/**
 * healingLogger.js — Structured logger for self-healing events
 * Writes JSON session logs to test-results/healing-logs/
 */

const fs   = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../../../test-results/healing-logs');

// ─── Log Level Filter ────────────────────────────────────────────────────────

const LEVELS = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
const activeLevel = LEVELS[process.env.HEALING_LOG_LEVEL?.toUpperCase()] ?? LEVELS.INFO;

// ─── Session & Simple Log Files ───────────────────────────────────────────────

const sessionId       = new Date().toISOString().replace(/[:.]/g, '-');
const sessionFile     = path.join(LOG_DIR, `session_${sessionId}.json`);
const TEXT_LOG_FILE   = path.resolve(__dirname, '../../../self-healing.log');
const entries         = [];

function ensureDir() {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ─── Core Logger ──────────────────────────────────────────────────────────────

/**
 * Log a healing event.
 * @param {'DEBUG'|'INFO'|'WARN'|'ERROR'} level
 * @param {string} message
 * @param {object} [meta]
 */
function log(level, message, meta = {}) {
  if ((LEVELS[level] ?? 0) < activeLevel) return;

  const ICONS = { DEBUG: '🔍', INFO: '📋', WARN: '⚠️ ', ERROR: '❌' };
  const timestamp = new Date().toISOString();
  
  const entry = {
    timestamp,
    level,
    message,
    ...(Object.keys(meta).length ? { meta } : {}),
  };

  entries.push(entry);
  
  const consoleMsg = `[SelfHealing] ${ICONS[level] || ''} ${message}`;
  console.log(consoleMsg, Object.keys(meta).length ? meta : '');

  // 📝 Real-time append to root plaintext file
  try {
    const metaStr = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : '';
    const logLine = `[${timestamp}] [${level}] ${ICONS[level] || ''} ${message}${metaStr}\n`;
    fs.appendFileSync(TEXT_LOG_FILE, logLine, 'utf8');
  } catch (_) { /* non-fatal */ }

  // Flush every 5 entries
  if (entries.length % 5 === 0) flush();
}

function flush() {
  try {
    ensureDir();
    fs.writeFileSync(sessionFile, JSON.stringify(entries, null, 2), 'utf-8');
  } catch (_) { /* non-fatal */ }
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

const debug   = (msg, meta) => log('DEBUG', msg, meta);
const info    = (msg, meta) => log('INFO',  msg, meta);
const warn    = (msg, meta) => log('WARN',  msg, meta);
const error   = (msg, meta) => log('ERROR', msg, meta);
const success = (msg)       => log('INFO', `✅ ${msg}`);

module.exports = { log, debug, info, warn, error, success, flush };
