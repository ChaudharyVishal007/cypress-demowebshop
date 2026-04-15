'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { parseDocument } = require('htmlparser2');

// 🔥 FIX: Dynamic import for ESM module
let selectAll;
async function loadCssSelect() {
  if (!selectAll) {
    const cssSelectModule = await import('css-select');
    selectAll = cssSelectModule.selectAll;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_NAME = 'gemini-2.5-flash';
const TEMPERATURE = 0.1;
const MAX_TOKENS = 1500;
const MAX_DOM_CHARS = 6000;
const MAX_RETRIES = 2;

// ─── Selector Rules ───────────────────────────────────────────────────────────

const SELECTOR_PRIORITY_RULES = `
SELECTOR PRIORITY (use the FIRST rule that uniquely identifies the element):

  P1 — data-testid / data-cy / data-qa / data-automation-id
  P2 — aria-label, aria-labelledby, role with accessible name
  P3 — id attribute (only if it looks static)
  P4 — name, href, type + value
  P5 — Scoped structural path
  P6 — :nth-child (last resort)

AVOID unstable selectors.
`.trim();

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are an expert Cypress CSS selector engineer.

Return JSON only:
{
  "candidates": [
    { "selector": "<css>", "confidence": "HIGH|MEDIUM|LOW" }
  ]
}
`.trim();

// ─── MAIN FUNCTION ────────────────────────────────────────────────────────────

async function generateHealingSelector(failedSelector, domSnippet, hint = '', options = {}) {
  const { verify = true, retryLow = true } = options;

  const truncatedDom = truncateDom(domSnippet, MAX_DOM_CHARS);
  const model = buildModel();

  let candidates = [];
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    attempt++;

    const prompt = buildPrompt(failedSelector, truncatedDom, hint, attempt);
    const raw = await callGemini(model, prompt);
    candidates = parseCandidates(raw);

    if (candidates.length === 0) continue;

    if (verify) {
      candidates = await annotateCandidatesWithVerification(candidates, truncatedDom);
      const verified = candidates.filter(c => c.verified);
      if (verified.length > 0) candidates = verified;
    }

    if (retryLow && candidates[0]?.confidence === 'LOW' && attempt < MAX_RETRIES) {
      continue;
    }

    break;
  }

  const best = candidates[0];

  return {
    selector: best.selector,
    confidence: best.confidence,
    verified: best.verified ?? false,
    candidates,
  };
}

// ─── DOM VERIFICATION ─────────────────────────────────────────────────────────

async function annotateCandidatesWithVerification(candidates, domSnippet) {
  await loadCssSelect(); // 🔥 Important fix

  let dom;
  try {
    dom = parseDocument(domSnippet);
  } catch {
    return candidates.map(c => ({ ...c, verified: false }));
  }

  return candidates.map(candidate => {
    try {
      const matches = selectAll(candidate.selector, dom);
      return {
        ...candidate,
        verified: matches.length > 0,
      };
    } catch {
      return { ...candidate, verified: false };
    }
  });
}

// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────

function buildPrompt(failedSelector, domSnippet, hint, attempt) {
  return `
FAILED SELECTOR: ${failedSelector}
${hint ? `HINT: ${hint}` : ''}

DOM:
${domSnippet}
`;
}

// ─── RESPONSE PARSER ──────────────────────────────────────────────────────────

function parseCandidates(raw) {
  try {
    const parsed = JSON.parse(raw);
    return parsed.candidates || [];
  } catch {
    return [];
  }
}

// ─── GEMINI CLIENT ────────────────────────────────────────────────────────────

function buildModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY');

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: MODEL_NAME });
}

async function callGemini(model, prompt) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}

// ─── UTILITIES ────────────────────────────────────────────────────────────────

function truncateDom(dom, maxChars) {
  if (dom.length <= maxChars) return dom;
  return dom.slice(0, maxChars);
}

// ─── EXPORT ───────────────────────────────────────────────────────────────────

module.exports = {
  generateHealingSelector,
};