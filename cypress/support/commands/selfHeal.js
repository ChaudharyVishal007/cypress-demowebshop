/**
 * selfHeal.js — Custom Cypress command: cy.selfHeal(selector, elementHint)
 *
 * ─────────────────────────────────────────────────────────────────
 * EXACT FLOW:
 *
 *   cy.selfHeal(selector)
 *        ↓
 *   Check if element exists in current DOM ($body.find)
 *        ↓
 *   ✅ Found → return cy.get(selector)   [zero overhead]
 *        ↓
 *   ❌ Not Found
 *        ↓
 *   Extract focused DOM snippet  (browser context, < 3000 chars)
 *        ↓
 *   cy.task('selfHeal:run')  → Node.js
 *        ↓  Cache hit? → return immediately
 *        ↓  Heuristic candidates[]
 *        ↓  Gemini AI candidate (prepended)
 *        ↓  return candidates[]
 *        ↓
 *   Validate each candidate with $body.find()  (browser context)
 *        ↓
 *   ✅ First match found
 *        ↓
 *   cy.task('selfHeal:cache')  → persist to healedLocators.json
 *        ↓
 *   return cy.get(healedSelector)  → test continues
 *        ↓
 *   ❌ No candidate worked
 *        ↓
 *   return cy.get(selector)  → Cypress throws proper timeout error
 * ─────────────────────────────────────────────────────────────────
 */

// ─── DOM Snippet Extractor (runs inside browser context) ─────────────────────

/**
 * Extracts a focused HTML snippet around the failed selector.
 * Tries ancestor-walk first; falls back to interactive element collection.
 *
 * @param {JQuery<HTMLElement>} $body
 * @param {string} failedSelector
 * @returns {string}  HTML string trimmed to ≤ 3000 chars
 */
function extractDomSnippet($body, failedSelector) {
  const MAX_CHARS = 100000; // Gemini Flash 2.5 handles 1M tokens easily.

  // ── Strategy 1: Try matching by ID fragment ────────────────────────────────
  try {
    const idMatch = failedSelector.match(/^#([^\s.[\]:]+)/);
    if (idMatch) {
      const $found = $body.find(`[id*="${idMatch[1]}"]`).first();
      if ($found.length) {
        return walkUpAndSerialize($found, MAX_CHARS);
      }
    }
  } catch (_) { /* invalid selector fragment */ }

  // ── Strategy 2: Try matching by class fragment ─────────────────────────────
  try {
    const clsMatch = failedSelector.match(/\.([a-zA-Z][\w-]+)/);
    if (clsMatch) {
      const $found = $body.find(`[class*="${clsMatch[1]}"]`).first();
      if ($found.length) {
        return walkUpAndSerialize($found, MAX_CHARS);
      }
    }
  } catch (_) { /* invalid class fragment */ }

  // ── Strategy 3: Cleaned Full Body Hierarchy ────────────────────────────────
  // If we can't find a localized fragment, we give Gemini the cleaned page structure
  // so it can find the element anywhere on the screen (e.g., login forms, footers).
  const $clone = $body.clone();
  
  // Strip out noise that wastes context window and confuses the AI
  $clone.find('script, style, svg, img, noscript, iframe, meta, link, path').remove();
  
  let htmlString = $clone.prop('outerHTML') || '';
  
  // Condense excessive whitespace
  htmlString = htmlString.replace(/\s{2,}/g, ' ').replace(/\n\s*\n/g, '\n').trim();

  return htmlString.slice(0, MAX_CHARS);
}

function walkUpAndSerialize($el, maxChars) {
  let $target = $el;
  for (let i = 0; i < 3; i++) {
    const $parent = $target.parent();
    if (!$parent.length || $parent[0].tagName === 'BODY') break;
    $target = $parent;
  }
  return ($target.prop('outerHTML') || '').slice(0, maxChars);
}

// ─── Browser-Side Sanitizer ──────────────────────────────────────────────────

function sanitizeSelector(sel) {
  return String(sel).replace(/[^\x20-\x7E]/g, '').trim();
}

// ─── Custom Command ───────────────────────────────────────────────────────────

Cypress.Commands.add('selfHeal', (rawSelector, elementHint) => {
  const selector = sanitizeSelector(rawSelector);
  
  // ── Infinite Loop Protection ───────────────────────────────────────────────
  const attemptsMap = Cypress.env('heal_attempts') || {};
  const currentAttempts = attemptsMap[selector] || 0;

  if (currentAttempts >= 2) {
    Cypress.log({ 
      name: '⚠️ selfHeal', 
      message: `Loop detected for "${selector}". Failing after 2 healing attempts.` 
    });
    return cy.get(selector); // Natural failure
  }

  Cypress.log({
    name:    '🔧 selfHeal',
    message: `Checking: "${selector}"`,
    consoleProps: () => ({ selector, elementHint, attempts: currentAttempts }),
  });

  return cy.get('body', { log: false }).then(($body) => {

    // ── FAST PATH: element already exists ─────────────────────────────────────
    let exists = false;
    try {
      exists = $body.find(selector).length > 0;
    } catch (_) {}

    if (exists) {
      // Reset attempts if we find it
      attemptsMap[selector] = 0;
      Cypress.env('heal_attempts', attemptsMap);
      return cy.get(selector, { log: false });
    }

    // ── HEALING PATH ──────────────────────────────────────────────────────────
    attemptsMap[selector] = currentAttempts + 1;
    Cypress.env('heal_attempts', attemptsMap);

    Cypress.log({
      name:    '❌ selfHeal',
      message: `Element NOT found: "${selector}" — initiating healing pipeline...`,
    });

    const domSnippet = extractDomSnippet($body, selector);
    const pageUrl    = window.location.href;

    return cy.task('selfHeal:run', {
      selector,
      domSnippet,
      hint:    elementHint || '',
      url:     pageUrl,
    }).then((result) => {

      if (!result?.candidates?.length) {
        return cy.get(selector); // will throw Cypress timeout error
      }

      // ── STRONG VALIDATION: visibility + semantic match ─────────────────────
      let healedSelector   = null;
      let healedLayer      = null;
      let healedConfidence = null;

      for (const candidate of result.candidates) {
        try {
          const $el = $body.find(candidate.selector);
          
          if ($el.length > 0 && $el.is(':visible')) {
            // Priority matching: if original had an input-related hint or tag, 
            // ensure healed element is interactive
            const isTargetInteractive = /input|button|select|textarea/i.test(selector + elementHint);
            const isHealedInteractive = /INPUT|BUTTON|SELECT|TEXTAREA/.test($el[0].tagName) || $el.attr('role') === 'button';

            if (isTargetInteractive && !isHealedInteractive) {
               // Reject generic containers if we expect a button/input
               continue;
            }

            healedSelector   = candidate.selector;
            healedLayer      = candidate.layer;
            healedConfidence = candidate.confidence;
            break;
          }
        } catch (_) {}
      }

      if (!healedSelector) {
        return cy.get(selector);
      }

      Cypress.log({
        name:    '✅ selfHeal',
        message: `Healed [${healedLayer}/${healedConfidence}]: "${selector}" → "${healedSelector}"`,
      });

      // Persist to healedLocators.json
      cy.task('selfHeal:cache', {
        original:   selector,
        healed:     healedSelector,
        layer:      healedLayer,
        confidence: healedConfidence,
        source:     healedLayer === 'AI' ? 'AI' : 'HEURISTIC'
      }, { log: false });

      return cy.get(healedSelector, { log: false });
    });
  });
});
