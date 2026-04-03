/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Allure Labels Helper (Allure 3)
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides thin Cypress custom commands that wrap allure-js-commons APIs.
 *
 * Usage inside a test or beforeEach:
 *   cy.allureEpic("Authentication");
 *   cy.allureFeature("Login");
 *   cy.allureStory("Valid Login");
 *   cy.allureSeverity("critical");     // blocker | critical | normal | minor | trivial
 *   cy.allureLayer("e2e");             // e2e | integration | unit
 *   cy.allureOwner("QA Team");
 *   cy.allureTag("smoke");
 *   cy.allureSuite("Auth Suite");
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as allure from "allure-js-commons";

Cypress.Commands.add("allureEpic", (value) => {
  allure.epic(value);
});

Cypress.Commands.add("allureFeature", (value) => {
  allure.feature(value);
});

Cypress.Commands.add("allureStory", (value) => {
  allure.story(value);
});

/**
 * @param {string} level - blocker | critical | normal | minor | trivial
 */
Cypress.Commands.add("allureSeverity", (level) => {
  allure.severity(level);
});

/**
 * @param {string} layer - e2e | integration | unit
 */
Cypress.Commands.add("allureLayer", (layer) => {
  allure.layer(layer);
});

Cypress.Commands.add("allureOwner", (name) => {
  allure.owner(name);
});

Cypress.Commands.add("allureTag", (tag) => {
  allure.tag(tag);
});

Cypress.Commands.add("allureSuite", (name) => {
  allure.suite(name);
});
