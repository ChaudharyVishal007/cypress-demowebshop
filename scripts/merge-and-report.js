#!/usr/bin/env node
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * merge-and-report.js — Unified Allure Report Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Workflow:
 *  1. Clean merged-allure-results/
 *  2. Copy allure-results/*          (Cypress UI results)
 *  3. Copy api-tests/allure-results/ (Rest Assured API results)
 *  4. Restore history from allure-history/last-history/ → merged-allure-results/history/
 *  5. Inject environment.properties + categories.json
 *  6. Generate unified Allure report  →  allure-report/
 *  7. Pack Allure 3 history archive
 *  8. Archive last-history for next run
 *
 * Usage:
 *   node scripts/merge-and-report.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const fs   = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT               = path.resolve(__dirname, "..");
const UI_RESULTS         = path.join(ROOT, "allure-results");
const API_RESULTS        = path.join(ROOT, "api-tests", "allure-results");
const MERGED_RESULTS     = path.join(ROOT, "merged-allure-results");
const REPORT_DIR         = path.join(ROOT, "allure-report");
const HISTORY_BASE       = path.join(ROOT, "allure-history");
const LAST_HISTORY       = path.join(HISTORY_BASE, "last-history");
const HISTORY_ZIP        = path.join(HISTORY_BASE, "history.zip");
const CATEGORIES_SRC     = path.join(ROOT, "cypress", "fixtures", "categories.json");

// ─── Helpers ──────────────────────────────────────────────────────────────────

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠  Source not found, skipping: ${src}`);
    return 0;
  }
  fs.mkdirSync(dest, { recursive: true });
  let count = 0;
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath  = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      count += copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      count++;
    }
  }
  return count;
}

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => !e.isDirectory())
    .length;
}

function section(title) {
  const line = "─".repeat(70);
  console.log(`\n${line}\n  ${title}\n${line}`);
}

function run(cmd, args = [], allowFail = false) {
  console.log(`\n▶  ${cmd} ${args.join(" ")}\n`);
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    cwd: ROOT,
  });
  if (result.status !== 0 && result.status !== null && !allowFail) {
    throw new Error(`Command failed (exit ${result.status}): ${cmd} ${args.join(" ")}`);
  }
  return result.status;
}

function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `run-${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-${pad(now.getHours())}-${pad(now.getMinutes())}`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  // ── STEP 1: Clean merged results dir ─────────────────────────────────────
  section("STEP 1 — Cleaning merged-allure-results/");
  rmDir(MERGED_RESULTS);
  fs.mkdirSync(MERGED_RESULTS, { recursive: true });
  console.log(`✔  Created fresh: ${MERGED_RESULTS}`);

  // ── STEP 2: Copy Cypress UI results ──────────────────────────────────────
  section("STEP 2 — Copying Cypress UI results");
  if (fs.existsSync(UI_RESULTS) && countFiles(UI_RESULTS) > 0) {
    const n = copyDir(UI_RESULTS, MERGED_RESULTS);
    console.log(`✔  Copied ${n} UI result files from allure-results/`);
  } else {
    console.warn("⚠  No Cypress UI results found (allure-results/ is empty or missing).");
    console.warn("   Run Cypress first: npm run cy:run");
  }

  // ── STEP 3: Copy Rest Assured API results ─────────────────────────────────
  section("STEP 3 — Copying Rest Assured API results");
  if (fs.existsSync(API_RESULTS) && countFiles(API_RESULTS) > 0) {
    const n = copyDir(API_RESULTS, MERGED_RESULTS);
    console.log(`✔  Copied ${n} API result files from api-tests/allure-results/`);
  } else {
    console.warn("⚠  No API results found (api-tests/allure-results/ is empty or missing).");
    console.warn("   Run API tests first: cd api-tests && mvn test");
  }

  const total = countFiles(MERGED_RESULTS);
  console.log(`\n📊 Total result files merged: ${total}`);

  // ── STEP 4: Restore history ───────────────────────────────────────────────
  section("STEP 4 — Restoring history for trend graphs");
  const historyDest = path.join(MERGED_RESULTS, "history");
  if (fs.existsSync(LAST_HISTORY)) {
    copyDir(LAST_HISTORY, historyDest);
    console.log("✔  History restored into merged-allure-results/history/");
  } else {
    console.log("ℹ  No previous history — trend graph will start fresh.");
  }

  // ── STEP 5: Inject environment.properties & categories.json ──────────────
  section("STEP 5 — Injecting environment metadata");

  const envProps = [
    "browser=Chrome",
    "env=prod",
    "os=macOS",
    "baseUrl=http://demowebshop.tricentis.com",
    "platform=Web + API",
    "ui_framework=Cypress",
    "api_framework=Rest Assured (Java)",
  ].join("\n");
  fs.writeFileSync(path.join(MERGED_RESULTS, "environment.properties"), envProps);
  console.log("✔  Written: merged-allure-results/environment.properties");

  if (fs.existsSync(CATEGORIES_SRC)) {
    fs.copyFileSync(CATEGORIES_SRC, path.join(MERGED_RESULTS, "categories.json"));
    console.log("✔  Copied:  merged-allure-results/categories.json");
  }

  // ── STEP 6: Generate unified Allure report ────────────────────────────────
  section("STEP 6 — Generating unified Allure report");
  rmDir(REPORT_DIR);

  const allureArgs = ["allure", "generate", "--output", REPORT_DIR];

  // Use Allure 3 dump archive if it exists (for history trends)
  if (fs.existsSync(HISTORY_ZIP)) {
    console.log(`📦 Using Allure 3 history archive: ${HISTORY_ZIP}`);
    allureArgs.push(`--dump=${HISTORY_ZIP}`);
  }

  allureArgs.push(MERGED_RESULTS);
  run("npx", allureArgs);
  console.log(`✔  Unified report generated: ${REPORT_DIR}/index.html`);

  // ── STEP 7: Update Allure 3 history archive ───────────────────────────────
  section("STEP 7 — Updating Allure 3 history archive");
  fs.mkdirSync(HISTORY_BASE, { recursive: true });
  run("npx", [
    "allure", "results", "pack",
    "--name", HISTORY_ZIP,
    MERGED_RESULTS
  ], true); // allowFail = true (some Allure 3 versions may not support this)
  console.log(`✔  Updated history archive: ${HISTORY_ZIP}`);

  // ── STEP 8: Save last-history for next run ────────────────────────────────
  section("STEP 8 — Saving history for next run");
  const reportHistory = path.join(REPORT_DIR, "history");
  if (fs.existsSync(reportHistory)) {
    rmDir(LAST_HISTORY);
    copyDir(reportHistory, LAST_HISTORY);
    console.log("✔  Saved: allure-history/last-history/");
  }

  // Archive this run's merged results with timestamp
  const ts = timestamp();
  const archiveDest = path.join(HISTORY_BASE, ts);
  copyDir(MERGED_RESULTS, archiveDest);
  console.log(`✔  Archived merged run → allure-history/${ts}/`);

  // Prune old archives (keep last 20)
  pruneOldRuns(HISTORY_BASE, 20);

  // ── Summary ───────────────────────────────────────────────────────────────
  section("✅ DONE — Unified Allure Report Ready");
  console.log(`  Total result files  : ${total}`);
  console.log(`  Report location     : ${REPORT_DIR}/index.html`);
  console.log(`  History archived    : allure-history/${ts}/`);
  console.log(`\n  Open report: npx allure open allure-report`);
  console.log(`  Or run    : npm run allure:open\n`);
}

function pruneOldRuns(historyBase, keep = 20) {
  if (!fs.existsSync(historyBase)) return;
  const runs = fs.readdirSync(historyBase, { withFileTypes: true })
    .filter(e => e.isDirectory() && e.name.startsWith("run-"))
    .map(e => e.name)
    .sort();
  if (runs.length > keep) {
    runs.slice(0, runs.length - keep).forEach(dir => {
      fs.rmSync(path.join(historyBase, dir), { recursive: true, force: true });
      console.log(`🗑  Pruned: ${dir}`);
    });
  }
}

try {
  main();
} catch (err) {
  console.error("\n❌ merge-and-report.js failed:", err.message);
  process.exit(1);
}
