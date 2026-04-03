// ─── Import Allure Cypress ─────────────────────────────────────────────────
import "allure-cypress";

// ─── Import Commands ───────────────────────────────────────────────────────
import "./commands/commands";

// ─── Global Configuration ──────────────────────────────────────────────────

// Prevent Cypress from failing on uncaught exceptions from app
Cypress.on("uncaught:exception", (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  if (
    err.message.includes("ResizeObserver") ||
    err.message.includes("Non-Error promise rejection") ||
    err.message.includes("Script error")
  ) {
    return false;
  }
  return true;
});

// ─── Global Hooks ─────────────────────────────────────────────────────────

before(() => {
  cy.log("🚀 Starting Demo Web Shop Automation Suite");
});

beforeEach(() => {
  // Set viewport for every test
  cy.viewport(1280, 800);

  // Clear cookies before each test (unless using session preservation)
  // cy.clearCookies();
  // cy.clearLocalStorage();
});

afterEach(function () {
  // Take screenshot on failure
  if (this.currentTest.state === "failed") {
    cy.screenshotWithTimestamp(`FAILED-${this.currentTest.title}`);
    cy.log(`❌ Test Failed: ${this.currentTest.title}`);
  }
});

after(() => {
  cy.log("✅ Demo Web Shop Automation Suite Completed");
});

// ─── Mochawesome Reporter ──────────────────────────────────────────────────
import "cypress-mochawesome-reporter/register";
