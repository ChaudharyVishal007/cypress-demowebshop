#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Allure History Manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Workflow:
 *  1. Restore history  → copy allure-history/last-history/ into allure-results/history/
 *  2. Run Cypress      → generates fresh allure-results/
 *  3. Generate report  → allure generate --clean (produces allure-report/)
 *  4. Archive results  → copy allure-results/ → allure-history/run-<timestamp>/
 *  5. Save history     → copy allure-report/history/ → allure-history/last-history/
 *
 * Usage:
 *   node scripts/allure-history.js [--spec <glob>] [--headed] [--env <key=val>]
 *   All extra args after -- are forwarded to cypress run.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs   = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT          = path.resolve(__dirname, "..");
const RESULTS_DIR   = path.join(ROOT, "allure-results");
const REPORT_DIR    = path.join(ROOT, "allure-report");
const HISTORY_BASE  = path.join(ROOT, "allure-history");
const LAST_HISTORY  = path.join(HISTORY_BASE, "last-history");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Copy a directory recursively (Node 16.7+ has fs.cpSync) */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** Delete a directory if it exists */
function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

/** Generate a timestamp string: run-YYYY-MM-DD-HH-MM */
function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `run-${now.getFullYear()}-` +
    `${pad(now.getMonth() + 1)}-` +
    `${pad(now.getDate())}-` +
    `${pad(now.getHours())}-` +
    `${pad(now.getMinutes())}`
  );
}

/** Print a section header */
function section(title) {
  const line = "─".repeat(70);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}`);
}

/** Run a shell command, streaming output */
function run(cmd, args = [], opts = {}) {
  console.log(`\n▶  ${cmd} ${args.join(" ")}\n`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    cwd: ROOT,
    ...opts,
  });
  if (result.status !== 0 && result.status !== null) {
    // Don't throw for cypress (tests may fail but we still want reports)
    if (cmd !== "npx" || !args.includes("cypress")) {
      throw new Error(`Command failed with exit code ${result.status}`);
    }
  }
  return result.status;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Parse extra args to forward to cypress
  const extraArgs = process.argv.slice(2);

  // ── 1. Clean current allure-results (not history) ─────────────────────────
  section("STEP 1 — Cleaning allure-results (keeping history)");
  rmDir(RESULTS_DIR);
  fs.mkdirSync(RESULTS_DIR, { recursive: true });
  console.log(`✔  Cleared: ${RESULTS_DIR}`);

  // ── 2. (Skipped) Allure 3 uses history.jsonl directly ─────────
  section("STEP 2 — Ensure history directory exists");
  fs.mkdirSync(HISTORY_BASE, { recursive: true });
  console.log("✔  Using Allure 3 history file: allure-history/history.jsonl");

  // ── 3. Run Cypress tests ───────────────────────────────────────────────────
  section("STEP 3 — Running Cypress tests");
  const cypressExitCode = run("npx", ["cypress", "run", ...extraArgs]);

  // ── 4. Generate Allure report ──────────────────────────────────────────────
  section("STEP 4 — Generating Allure report");
  rmDir(REPORT_DIR);
  run("npx", [
    "allure", "generate",
    RESULTS_DIR,
    "--output", REPORT_DIR
  ]);
  console.log(`✔  Report generated: ${REPORT_DIR}`);

  // ── 5. Archive current results with timestamp ──────────────────────────────
  section("STEP 5 — Archiving current run results");
  const runLabel  = timestamp();
  const archiveDest = path.join(HISTORY_BASE, runLabel);
  fs.mkdirSync(archiveDest, { recursive: true });
  copyDir(RESULTS_DIR, archiveDest);
  console.log(`✔  Archived run results → allure-history/${runLabel}/`);

  // Prune old runs: keep only the last 20
  pruneOldRuns(HISTORY_BASE, 20);

  // ── 6. (Skipped) Allure 3 auto-updates history.jsonl ─────────
  section("STEP 6 — History is auto-updated by Allure 3");
  console.log(`✔  Saved history → allure-history/history.jsonl`);

  // ── 7. Summary ─────────────────────────────────────────────────────────────
  section("DONE");
  console.log(`  Run archived : allure-history/${runLabel}/`);
  console.log(`  Report ready : ${REPORT_DIR}/index.html`);
  console.log(`  History saved: allure-history/history.jsonl`);
  console.log(
    `\n  Open report  : npx allure open allure-report\n` +
    `  Or run       : npm run allure:open\n`
  );

  // Exit with Cypress exit code so CI can detect failures
  process.exit(cypressExitCode || 0);
}

/** Keep only the N most recent run-* directories */
function pruneOldRuns(historyBase, keep = 20) {
  if (!fs.existsSync(historyBase)) return;
  const runs = fs
    .readdirSync(historyBase, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith("run-"))
    .map((e) => e.name)
    .sort(); // lexicographic sort = chronological for run-YYYY-MM-DD-HH-MM

  if (runs.length > keep) {
    const toDelete = runs.slice(0, runs.length - keep);
    for (const dir of toDelete) {
      const fullPath = path.join(historyBase, dir);
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`🗑  Pruned old run: ${dir}`);
    }
  }
}

main().catch((err) => {
  console.error("\n❌ allure-history.js failed:", err.message);
  process.exit(1);
});
