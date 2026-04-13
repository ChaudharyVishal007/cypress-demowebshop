/**
 * healingCache.js — JSON file-based cache for healed locators
 * Stores: { "originalSelector": "healedSelector" }
 */

const fs   = require('fs');
const path = require('path');

const CACHE_PATH = path.resolve(__dirname, '../../../data/healedLocators.json');

// ─── Helpers ────────────────────────────────────────────────────────────────

function loadCache() {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
    }
  } catch (_) { /* corrupted file — start fresh */ }
  return {};
}

function saveCache(cache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[HealingCache] Failed to persist cache:', err.message);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Returns the cached healed metadata object, or null if not cached.
 * @param {string} original - Original failed CSS selector
 * @returns {{ healed: string, confidence: string, source: string }|null}
 */
function get(original) {
  return loadCache()[original] || null;
}

/**
 * Stores a successful heal metadata in the JSON cache.
 * @param {string} original
 * @param {{ healed: string, confidence: string, source: string }} metadata
 */
function set(original, metadata) {
  const cache = loadCache();
  cache[original] = metadata;
  saveCache(cache);
}

/**
 * Removes a stale cache entry (called when a cached selector stops working).
 * @param {string} original
 */
function invalidate(original) {
  const cache = loadCache();
  if (cache[original]) {
    delete cache[original];
    saveCache(cache);
  }
}

/**
 * Returns the full cache object (for stats/reporting).
 * @returns {Record<string, string>}
 */
function getAll() {
  return loadCache();
}

module.exports = { get, set, invalidate, getAll };
