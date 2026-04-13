require('dotenv').config();   // loads GEMINI_API_KEY from .env

const { defineConfig }    = require("cypress");
const { allureCypress }   = require("allure-cypress/reporter");
const healingEngine       = require("./cypress/plugins/selfHealing/healingEngine");

module.exports = defineConfig({
  // Reporter config must be at root level in Cypress 13
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    configFile: "reporter-config.json",
  },

  e2e: {
    baseUrl: "http://demowebshop.tricentis.com",
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",
    fixturesFolder: "cypress/fixtures",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    downloadsFolder: "cypress/downloads",

    // Timeouts
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    requestTimeout: 10000,
    responseTimeout: 10000,

    // Video & Screenshots
    video: true,
    screenshotOnRunFailure: true,
    videoCompression: 32,

    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Viewport
    viewportWidth: 1280,
    viewportHeight: 800,

    // Environment variables
    env: {
      baseUrl: "http://demowebshop.tricentis.com/",
      adminUrl: "http://demowebshop.tricentis.com/Admin",
      // Test user credentials (registered user)
      userEmail: "testuser_jetski_12347@example.com",
      userPassword: "Password123!",
      // Admin credentials
      adminEmail: "admin@yourstore.com",
      adminPassword: "admin",
      // Tags for selective test running
      tags: "",
    },

    setupNodeEvents(on, config) {
      // ─── Allure 3 Reporter ─────────────────────────────────────────
      allureCypress(on, config, {
        resultsDir: "allure-results",
      });

      // ─── Mochawesome Reporter ──────────────────────────────────────
      require("cypress-mochawesome-reporter/plugin")(on);

      on("task", {
        // ─── Existing tasks ──────────────────────────────────────────
        log(message) {
          console.log(message);
          return null;
        },
        table(message) {
          console.table(message);
          return null;
        },

        // ─── AI Self-Healing tasks ────────────────────────────────────
        //
        // selfHeal:run      → runs Cache → Heuristic → Gemini AI pipeline
        //                     returns { candidates: [{selector, layer, confidence}] }
        //
        // selfHeal:cache    → persists a successful heal to healedLocators.json
        //
        // selfHeal:invalidate → removes a stale cache entry
        //
        'selfHeal:run':        (payload) => healingEngine.runHealingPipeline(payload),
        'selfHeal:cache':      (payload) => healingEngine.cacheHealedLocator(payload),
        'selfHeal:invalidate': (payload) => healingEngine.invalidateCacheEntry(payload),
      });

      return config;
    },
  },
});
