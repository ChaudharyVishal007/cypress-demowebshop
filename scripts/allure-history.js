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

const fs = require("fs");
const path = require("path");
const { execSync, spawnSync } = require("child_process");

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, "..");
const RESULTS_DIR = path.join(ROOT, "allure-results");
const REPORT_DIR = path.join(ROOT, "allure-report");
const HISTORY_BASE = path.join(ROOT, "allure-history");
const LAST_HISTORY = path.join(HISTORY_BASE, "last-history");
const CATEGORIES_SRC = path.join(ROOT, "cypress", "fixtures", "categories.json");
const HISTORY_ZIP = path.join(HISTORY_BASE, "history.zip");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Copy a directory recursively (Node 16.7+ has fs.cpSync) */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
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
    cwd: ROOT,
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

  // ── 2. Ensure history directory exists ───────────────────────────────────
  section("STEP 2 — Ensure history directory exists");
  fs.mkdirSync(HISTORY_BASE, { recursive: true });
  console.log("✔  Using Allure 3 history file: allure-history/history.jsonl");

  // ── 2b. Inject environment.properties & categories.json into allure-results
  section("STEP 2b — Injecting environment metadata and categories");

  // environment.properties — tells Allure which environment tests ran against
  const envProps = [
    "browser=Chrome",
    "env=prod",
    "os=Windows",
    "baseUrl=http://demowebshop.tricentis.com",
    "platform=Web",
  ].join("\n");
  fs.writeFileSync(path.join(RESULTS_DIR, "environment.properties"), envProps);
  console.log("✔  Written: allure-results/environment.properties");

  // categories.json — failure grouping rules for Categories widget
  if (fs.existsSync(CATEGORIES_SRC)) {
    fs.copyFileSync(CATEGORIES_SRC, path.join(RESULTS_DIR, "categories.json"));
    console.log("✔  Copied:  allure-results/categories.json");
  } else {
    console.warn("⚠  categories.json source not found — skipping");
  }

  // ── 3. Run Cypress tests ───────────────────────────────────────────────────
  section("STEP 3 — Running Cypress tests");

  // 🔥 Robust argument handling (works in Docker + Jenkins)
  const rawArgs = process.argv.slice(2);

  // Normalize args (handle both --spec=value and --spec value)
  const parsedArgs = [];

  for (let i = 0; i < rawArgs.length; i++) {
    if (rawArgs[i].startsWith('--spec=')) {
      parsedArgs.push('--spec', rawArgs[i].split('=')[1]);
    } else if (rawArgs[i] === '--spec') {
      parsedArgs.push('--spec', rawArgs[i + 1]);
      i++;
    } else {
      parsedArgs.push(rawArgs[i]);
    }
  }

  console.log("👉 Forwarding args to Cypress:", parsedArgs.join(" "));

  // 🚀 FINAL COMMAND
  const cypressExitCode = run("npx", ["cypress", "run", ...parsedArgs]);

  // ── 4. Generate Allure report ──────────────────────────────────────────────
  section("STEP 4 — Generating Allure report");

  // 4a. Restore previous history into results for trend analysis
  if (fs.existsSync(LAST_HISTORY)) {
    console.log("📂 Restoring previous history into results...");
    copyDir(LAST_HISTORY, path.join(RESULTS_DIR, "history"));
    console.log("✔  History restored to allure-results/history/");
  } else {
    console.log("ℹ  No previous history found to restore.");
  }

  rmDir(REPORT_DIR);
  const allureArgs = [
    "allure", "generate",
    "--output", REPORT_DIR
  ];

  // If we have an Allure 3 history dump archive, use it
  if (fs.existsSync(HISTORY_ZIP)) {
    console.log(`📦 Using Allure 3 history archive: ${HISTORY_ZIP}`);
    allureArgs.push(`--dump=${HISTORY_ZIP}`);
  }

  allureArgs.push(RESULTS_DIR);

  run("npx", allureArgs);
  console.log(`✔  Report generated: ${REPORT_DIR}`);

  // 4b. Update Allure 3 history archive (cumulative)
  section("STEP 4b — Updating Allure 3 history archive");
  // Pack current results into the cumulative history archive
  run("npx", [
    "allure", "results", "pack",
    "--name", HISTORY_ZIP,
    RESULTS_DIR
  ]);
  console.log(`✔  Updated Allure 3 history archive: ${HISTORY_ZIP}`);

  // 4c. Save latest history (Allure 2 style) for next run
  const reportHistory = path.join(REPORT_DIR, "history");
  if (fs.existsSync(reportHistory)) {
    rmDir(LAST_HISTORY);
    copyDir(reportHistory, LAST_HISTORY);
    console.log("✔  Saved latest history to allure-history/last-history/");
  }

  // ── 5. Archive current results with timestamp ──────────────────────────────
  section("STEP 5 — Archiving current run results");
  const runLabel = timestamp();
  const archiveDest = path.join(HISTORY_BASE, runLabel);
  fs.mkdirSync(archiveDest, { recursive: true });
  copyDir(RESULTS_DIR, archiveDest);
  console.log(`✔  Archived run results → allure-history/${runLabel}/`);

  // Prune old runs: keep only the last 20
  pruneOldRuns(HISTORY_BASE, 20);

  // ── 6. Allure 3 History Summary ──────────────────────────────────────────
  section("STEP 6 — Allure 3 History Tracking");
  console.log(`✔  Report ready: ${REPORT_DIR}/index.html`);
  console.log(`✔  History tracked in: allure-history/last-history/`);

  // ── 7. Summary ─────────────────────────────────────────────────────────────
  section("DONE");
  console.log(`  Run archived : allure-history/${runLabel}/`);
  console.log(`  Report ready : ${REPORT_DIR}/index.html`);
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
