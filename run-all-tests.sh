#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# run-all-tests.sh — Master Test Execution Script
# ─────────────────────────────────────────────────────────────────────────────
#
# WHAT THIS SCRIPT RUNS (Currently scoped to Login tests):
#   • UI  Tests : Cypress  → cypress/e2e/auth/login.cy.js   (layer: e2e)
#   • API Tests : Rest Assured → AuthApiTest.java            (layer: integration)
#   • Merges both Allure result sets → single unified report
#
# WHAT THIS SCRIPT NEVER DELETES:
#   ✅ allure-history/          ← Your past run archives   [ALWAYS PRESERVED]
#   ✅ allure-history/last-history/  ← Trend data          [ALWAYS PRESERVED]
#   ✅ allure-history/history.zip    ← Allure 3 archive    [ALWAYS PRESERVED]
#   ✅ history.jsonl            ← Allure 3 history file     [ALWAYS PRESERVED]
#
# WHAT THIS SCRIPT CLEANS (needed for a fresh run):
#   🧹 allure-results/           ← Current UI run results   (temp, always regenerated)
#   🧹 api-tests/allure-results/ ← Current API run results  (temp, always regenerated)
#   🧹 merged-allure-results/    ← Merge temp folder        (temp, always regenerated)
#
# Usage:
#   ./run-all-tests.sh              # Run login UI + API tests + open report
#   ./run-all-tests.sh --no-open    # Run but don't auto-open browser
#   ./run-all-tests.sh --ui-only    # Only Cypress login tests
#   ./run-all-tests.sh --api-only   # Only Rest Assured login API tests
# ─────────────────────────────────────────────────────────────────────────────

set -e

# ── Colours ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

# ── Config ────────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$SCRIPT_DIR"
AUTO_OPEN=true
RUN_UI=true
RUN_API=true

# ── Parse arguments ───────────────────────────────────────────────────────────
for arg in "$@"; do
  case $arg in
    --no-open)  AUTO_OPEN=false ;;
    --api-only) RUN_UI=false ;;
    --ui-only)  RUN_API=false ;;
    *) echo -e "${RED}Unknown argument: $arg${RESET}"; exit 1 ;;
  esac
done

# ── Helpers ───────────────────────────────────────────────────────────────────
section() {
  echo ""
  echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════════════${RESET}"
  echo -e "${CYAN}${BOLD}  $1${RESET}"
  echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════════════${RESET}"
}
success() { echo -e "${GREEN}✔  $1${RESET}"; }
warn()    { echo -e "${YELLOW}⚠  $1${RESET}"; }
info()    { echo -e "   $1"; }

# ── Safety guard: verify history is NOT in the cleanup list ───────────────────
safe_clean() {
  local target="$1"
  # Refuse to delete anything inside allure-history
  if [[ "$target" == *"allure-history"* ]]; then
    echo -e "${RED}❌ SAFETY BLOCK: refusing to delete history folder: $target${RESET}"
    exit 1
  fi
  rm -rf "$target"
}

UI_EXIT=0
API_EXIT=0
START_TIME=$(date +%s)

cd "$ROOT"

# ────────────────────────────────────────────────────────────────────────────
section "STEP 1 — Cleaning ONLY current-run result folders (history is untouched)"
# ────────────────────────────────────────────────────────────────────────────

# Only clean fresh result folders — history is NEVER touched here
safe_clean "$ROOT/allure-results"
safe_clean "$ROOT/merged-allure-results"
mkdir -p "$ROOT/allure-results" "$ROOT/merged-allure-results"
success "Cleared allure-results/ and merged-allure-results/ (temp folders)"

if [ "$RUN_API" = true ]; then
  safe_clean "$ROOT/api-tests/allure-results"
  mkdir -p "$ROOT/api-tests/allure-results"
  success "Cleared api-tests/allure-results/ (temp folder)"
fi

# Confirm history is untouched
if [ -d "$ROOT/allure-history" ]; then
  HISTORY_COUNT=$(find "$ROOT/allure-history" -maxdepth 1 -mindepth 1 | wc -l | tr -d ' ')
  success "allure-history/ preserved intact ($HISTORY_COUNT items untouched)"
else
  info "allure-history/ does not exist yet — will be created after first run"
fi

# ────────────────────────────────────────────────────────────────────────────
if [ "$RUN_UI" = true ]; then
section "STEP 2 — Cypress UI Tests: Login (layer: e2e)"
# ────────────────────────────────────────────────────────────────────────────

  info "Spec      : cypress/e2e/auth/login.cy.js"
  info "Framework : Cypress"
  info "Results   : allure-results/"
  echo ""

  set +e
  npx cypress run --spec "cypress/e2e/auth/login.cy.js"
  UI_EXIT=$?
  set -e

  if [ $UI_EXIT -eq 0 ]; then
    success "Cypress login UI tests passed"
  else
    warn "Cypress login UI tests had failures (exit: $UI_EXIT) — report will still be generated"
  fi

  UI_COUNT=$(find "$ROOT/allure-results" -maxdepth 1 -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  info "Generated $UI_COUNT UI result files"
fi

# ────────────────────────────────────────────────────────────────────────────
if [ "$RUN_API" = true ]; then
section "STEP 3 — Rest Assured API Tests: Auth/Login (layer: integration)"
# ────────────────────────────────────────────────────────────────────────────

  info "Suite     : testng-auth.xml (AuthApiTest only)"
  info "Framework : Rest Assured + TestNG (Java/Maven)"
  info "Results   : api-tests/allure-results/"
  echo ""

  set +e
  cd "$ROOT/api-tests"
  mvn test -DsuiteXmlFile=src/test/resources/testng-auth.xml -q
  API_EXIT=$?
  cd "$ROOT"
  set -e

  if [ $API_EXIT -eq 0 ]; then
    success "Rest Assured login API tests passed"
  else
    warn "API tests had failures (exit: $API_EXIT) — report will still be generated"
  fi

  API_COUNT=$(find "$ROOT/api-tests/allure-results" -maxdepth 1 -name "*.json" 2>/dev/null | wc -l | tr -d ' ')
  info "Generated $API_COUNT API result files"
fi

# ────────────────────────────────────────────────────────────────────────────
section "STEP 4 — Merging Results & Generating Unified Allure Report"
# ────────────────────────────────────────────────────────────────────────────

info "Merging  : allure-results/ + api-tests/allure-results/ → merged-allure-results/"
info "Output   : allure-report/"
echo ""

node "$ROOT/scripts/merge-and-report.js"
success "Unified Allure report generated: allure-report/index.html"

# Confirm history still intact after report generation
if [ -d "$ROOT/allure-history" ]; then
  HISTORY_COUNT=$(find "$ROOT/allure-history" -maxdepth 1 -mindepth 1 | wc -l | tr -d ' ')
  success "allure-history/ still intact after report generation ($HISTORY_COUNT items)"
fi

# ── Summary ───────────────────────────────────────────────────────────────────
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

echo ""
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════════════${RESET}"
echo -e "${CYAN}${BOLD}  ✅  DONE — Execution Summary${RESET}"
echo -e "${CYAN}${BOLD}══════════════════════════════════════════════════════════════════════${RESET}"
echo ""
echo -e "  Scope             : Login tests (UI + API)"

if [ "$RUN_UI" = true ]; then
  if [ $UI_EXIT -eq 0 ]; then
    echo -e "  ${GREEN}✔${RESET}  Cypress Login UI   : ${GREEN}PASSED${RESET}"
  else
    echo -e "  ${RED}✗${RESET}  Cypress Login UI   : ${RED}FAILED${RESET} (exit $UI_EXIT)"
  fi
fi

if [ "$RUN_API" = true ]; then
  if [ $API_EXIT -eq 0 ]; then
    echo -e "  ${GREEN}✔${RESET}  Rest Assured Auth  : ${GREEN}PASSED${RESET}"
  else
    echo -e "  ${RED}✗${RESET}  Rest Assured Auth  : ${RED}FAILED${RESET} (exit $API_EXIT)"
  fi
fi

echo ""
echo -e "  Duration          : ${MINUTES}m ${SECONDS}s"
echo -e "  Report            : ${ROOT}/allure-report/index.html"
echo -e "  History preserved : ${ROOT}/allure-history/"
echo ""

if [ "$AUTO_OPEN" = true ]; then
  echo -e "${CYAN}  Opening unified Allure report...${RESET}"
  npx allure open allure-report
fi

FINAL_EXIT=$((UI_EXIT + API_EXIT))
exit $((FINAL_EXIT > 0 ? 1 : 0))
