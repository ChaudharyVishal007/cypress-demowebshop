/**
 * healingEngine.js — Core self-healing orchestrator (Node.js / Cypress task side)
 *
 * Implements the exact flow:
 *
 *   Check Cache
 *      ↓ miss
 *   Heuristic Healing  (fast, no API call)
 *      ↓ generates candidates[]
 *   AI Healing via Gemini Flash  (prepended as top candidate)
 *      ↓
 *   Return candidates[]  →  browser validates each via $body.find()
 */

const fs = require('fs');
const path = require('path');
const healingCache = require('./healingCache');
const geminiClient = require('./geminiClient');
const logger = require('./healingLogger');

const GEMINI_TIMEOUT_MS = 25000; // 25s timeout to allow new retry loop and multi-candidate generation ────────────────────────────────────────────────

// ─── Global State (Persists across entire Cypress Run) ───────────────────────
const MAX_AI_CALLS_PER_RUN = 5;
let _totalAiCallsThisRun = 0;
const _seenLocatorsSet = new Set(); // Prevents infinite AI looping for the exact same broken selector

/**
 * Strips non-standard characters (like ₹ or accidental unicode) from broken selectors.
 */
function sanitizeSelector(sel) {
  return String(sel).replace(/[^\x20-\x7E]/g, '').trim();
}

// ─── Public: main task handler ────────────────────────────────────────────────

/**
 * Run the full healing pipeline for a broken selector.
 * Called by `cy.task('selfHeal:run', payload)`.
 *
 * @param {{
 *   selector:   string,
 *   domSnippet: string,
 *   hint:       string,
 *   url:        string
 * }} payload
 *
 * @returns {{ candidates: Array<{selector, layer, confidence}> }}
 */
async function runHealingPipeline({ selector: rawSelector, domSnippet, hint, url }) {
  const selector = sanitizeSelector(rawSelector);

  if (selector !== rawSelector) {
    logger.warn(`🧹 Sanitized invalid characters from selector: "${rawSelector}" → "${selector}"`);
  }

  logger.info(`🔍 Healing started for: "${selector}"`, { url });

  // ── Layer 0: Cache ──────────────────────────────────────────────────────────
  const cached = healingCache.get(selector);
  if (cached) {
    logger.info(`⚡ Cache hit: "${selector}" → "${cached.healed || cached}"`);
    // Return immediately — no need to run heuristics or AI
    return { candidates: [{ selector: cached, layer: 'CACHE', confidence: 'HIGH' }] };
  }

  const candidates = [];

  // ── Layer 1: Heuristic Healing ──────────────────────────────────────────────
  const heuristics = buildHeuristicCandidates(selector, domSnippet);
  logger.info(`🔧 Heuristic produced ${heuristics.length} candidates`);
  candidates.push(...heuristics);

  // ── Layer 2: AI Healing (Gemini Flash) ─────────────────────────────────────
  const alreadySeen = _seenLocatorsSet.has(selector);
  _seenLocatorsSet.add(selector);

  if (alreadySeen) {
    logger.warn(`[AI Skipped] Loop protection: Already called AI for "${selector}" previously in this run.`);
  } else if (_totalAiCallsThisRun >= MAX_AI_CALLS_PER_RUN) {
    logger.warn(`[AI Skipped] Rate limit protection: Reached global max of ${MAX_AI_CALLS_PER_RUN} AI calls.`);
  } else {
    try {
      _totalAiCallsThisRun++;
      const aiResult = await withTimeout(
        geminiClient.generateHealingSelector(selector, domSnippet, hint),
        GEMINI_TIMEOUT_MS
      );

      if (aiResult?.candidates && aiResult.candidates.length > 0) {
        // AI returns an ordered array of alternatives in the new Gemni API. We prepend all of them natively.
        const mappedCandidates = aiResult.candidates.map(c => ({
          selector: c.selector,
          layer: 'AI',
          confidence: c.confidence
        }));
        candidates.unshift(...mappedCandidates);
        logger.success(`🤖 AI suggested top candidate: "${mappedCandidates[0].selector}" [${mappedCandidates[0].confidence}]`);
      } else if (aiResult?.selector) {
        // Fallback for older geminiClient if properties don't exist
        candidates.unshift({ selector: aiResult.selector, layer: 'AI', confidence: aiResult.confidence });
      }
    } catch (err) {
      logger.warn(`Gemini unavailable: ${err.message} — falling back to heuristics`);
    }
  }

  logger.info(`Total candidates to validate: ${candidates.length}`);
  return { candidates };
}

// ─── Public: cache a successful heal ─────────────────────────────────────────

/**
 * Called by `cy.task('selfHeal:cache', payload)` after the browser confirms
 * a candidate works.
 *
 * @param {{ original: string, healed: string, layer: string, confidence: string }} payload
 * @returns {null}
 */
function cacheHealedLocator({ original: rawOriginal, healed: rawHealed, layer, confidence, source = 'AI' }) {
  const original = sanitizeSelector(rawOriginal);
  const healed = sanitizeSelector(rawHealed);

  if (confidence === 'LOW' || confidence === 'MEDIUM') {
    logger.info(`📦 Skip caching [${layer}/${confidence}]: "${original}". We only cache HIGH confidence heals permanently.`);
  } else {
    healingCache.set(original, { healed, confidence, source });
    logger.success(`📦 Cached [${layer}/${confidence}]: "${original}" → "${healed}"`);
  }

  // Actually rewrite the source JS file!
  patchSourceCode(original, healed);


  logger.flush();
  return null; // cy.task must return null or serialisable value
}

// Searches all page objects and rewrites the source code:
// Replaces cy.selfHeal("old", "hint") with cy.selfHeal("new", "hint")
function patchSourceCode(originalSelector, healedSelector) {
  try {
    const pagesDir = path.resolve(__dirname, '../../support/pages');
    const filesToSearch = [];

    function walkSync(dir) {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const absolute = path.join(dir, file);
        if (fs.statSync(absolute).isDirectory()) walkSync(absolute);
        else if (file.endsWith('.js')) filesToSearch.push(absolute);
      }
    }

    walkSync(pagesDir);

    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`cy\\.selfHeal\\(\\s*["']${escapeRegex(originalSelector)}["']`, 'g');

    for (const file of filesToSearch) {
      const content = fs.readFileSync(file, 'utf-8');
      if (pattern.test(content)) {
        let quoteChar = '"';
        if (healedSelector.includes('"') && !healedSelector.includes("'")) {
          quoteChar = "'";
        } else if (healedSelector.includes('"') && healedSelector.includes("'")) {
          quoteChar = '\`';
        }
        const newContent = content.replace(pattern, `cy.selfHeal(${quoteChar}${healedSelector}${quoteChar}`);
        fs.writeFileSync(file, newContent, 'utf-8');
        logger.success(`🚀 Source Code Auto-Patched permanently in: ${path.basename(file)}`);
      }
    }
  } catch (err) {
    logger.warn(`Failed to auto-patch source code: ${err.message}`);
  }
}

// ─── Public: invalidate a stale cache entry ───────────────────────────────────

/**
 * Called when a previously cached selector stops working.
 * @param {{ selector: string }} payload
 * @returns {null}
 */
function invalidateCacheEntry({ selector }) {
  healingCache.invalidate(selector);
  logger.warn(`🗑️  Cache invalidated for: "${selector}"`);
  return null;
}

// ─── Layer 1: Heuristic candidate builder ────────────────────────────────────

function buildHeuristicCandidates(selector, domSnippet) {
  const candidates = [];

  // ── 1. ID variations ────────────────────────────────────────────────────────
  const idMatch = selector.match(/^#([^\s.[\]:]+)/);
  if (idMatch) {
    const id = idMatch[1];
    // Partial match in case id gained a prefix/suffix
    candidates.push(mk(`[id*="${id}"]`, 'HEURISTIC', 'MEDIUM'));
    candidates.push(mk(`[id^="${id}"]`, 'HEURISTIC', 'LOW'));
  }

  // ── 2. Class partial match ───────────────────────────────────────────────────
  const classMatches = [...selector.matchAll(/\.([a-zA-Z][\w-]+)/g)];
  for (const m of classMatches.slice(0, 3)) {
    candidates.push(mk(`[class*="${m[1]}"]`, 'HEURISTIC', 'MEDIUM'));
  }

  // ── 3. Strip pseudo-selectors (:first-child, :nth-child, etc.) ───────────────
  const stripped = selector.replace(/:[\w-]+(\([^)]*\))?/g, '').trim();
  if (stripped && stripped !== selector && stripped.length > 1) {
    candidates.push(mk(stripped, 'HEURISTIC', 'MEDIUM'));
  }

  // Deduplicate by selector string
  return [...new Map(candidates.map(c => [c.selector, c])).values()];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function mk(selector, layer, confidence) {
  return { selector, layer, confidence };
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

module.exports = { runHealingPipeline, cacheHealedLocator, invalidateCacheEntry };
