// ─── Authentication Commands ───────────────────────────────────────────────

/**
 * Login via UI
 */
Cypress.Commands.add("loginUI", (email, password) => {
  cy.visit("/login");
  cy.get("#Email").clear().type(email);
  cy.get("#Password").clear().type(password);
  cy.get(".login-button").click();
  cy.url().should("not.include", "/login");
});

/**
 * Login via API (faster - sets cookie directly)
 */
Cypress.Commands.add("loginViaAPI", (email, password) => {
  cy.request({
    method: "POST",
    url: "/login",
    form: true,
    body: {
      Email: email,
      Password: password,
      RememberMe: false,
    },
    followRedirect: true,
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

/**
 * Logout
 */
Cypress.Commands.add("logout", () => {
  cy.visit("/logout");
  cy.url().should("include", "/");
});

/**
 * Register a new user
 */
Cypress.Commands.add("registerUser", (userData) => {
  cy.visit("/register");
  if (userData.gender === "male") cy.get("#gender-male").check();
  cy.get("#FirstName").clear().type(userData.firstName);
  cy.get("#LastName").clear().type(userData.lastName);
  cy.get("#Email").clear().type(userData.email);
  cy.get("#Password").clear().type(userData.password);
  cy.get("#ConfirmPassword").clear().type(userData.confirmPassword || userData.password);
  cy.get("#register-button").click();
  cy.get(".result").should("contain.text", "Your registration completed");
});

// ─── Cart Commands ─────────────────────────────────────────────────────────

/**
 * Add a product to cart by visiting its URL
 */
Cypress.Commands.add("addToCartByUrl", (productUrl) => {
  cy.visit(productUrl);
  cy.get("input[value='Add to cart'], .add-to-cart-button").first().click();
  cy.get(".bar-notification.success").should("be.visible");
});

/**
 * Clear the shopping cart completely
 */
Cypress.Commands.add("clearCart", () => {
  cy.visit("/cart");
  cy.get("body").then(($body) => {
    if ($body.find(".cart tbody tr").length > 0) {
      cy.get(".remove-from-cart input[type='checkbox']").each(($el) => {
        cy.wrap($el).check();
      });
      cy.get(".update-cart-button").click();
    }
  });
});

/**
 * Clear the wishlist completely
 */
Cypress.Commands.add("clearWishlist", () => {
  cy.visit("/wishlist");
  cy.get("body").then(($body) => {
    if ($body.find(".wishlist tbody tr").length > 0) {
      cy.get(".remove-from-cart input[type='checkbox']").each(($el) => {
        cy.wrap($el).check();
      });
      cy.get(".update-wishlist-button").click();
    }
  });
});

/**
 * Get cart item count from header
 */
Cypress.Commands.add("getCartCount", () => {
  return cy.get(".cart-qty").invoke("text").then((text) => {
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1]) : 0;
  });
});

// ─── Product Commands ──────────────────────────────────────────────────────

/**
 * Add to wishlist by product URL
 */
Cypress.Commands.add("addToWishlistByUrl", (productUrl) => {
  cy.visit(productUrl);
  cy.get(".add-to-wishlist-button").click();
  cy.get(".bar-notification.success").should("be.visible");
});

/**
 * Search for products from header
 */
Cypress.Commands.add("searchProduct", (term) => {
  cy.get("#small-searchterms").clear().type(term);
  cy.get(".search-box button[type='submit']").click();
});

// ─── Utility Commands ──────────────────────────────────────────────────────

/**
 * Dismiss notification bar if present
 */
Cypress.Commands.add("dismissNotification", () => {
  cy.get("body").then(($body) => {
    if ($body.find(".bar-notification .close").length > 0) {
      cy.get(".bar-notification .close").click();
    }
  });
});

/**
 * Verify success notification
 */
Cypress.Commands.add("verifySuccess", (message) => {
  cy.get(".bar-notification.success")
    .should("be.visible")
    .and("contain.text", message);
});

/**
 * Verify error notification
 */
Cypress.Commands.add("verifyError", (message) => {
  cy.get(".bar-notification.error")
    .should("be.visible")
    .and("contain.text", message);
});

/**
 * Navigate to a category page
 */
Cypress.Commands.add("goToCategory", (categoryUrl) => {
  cy.visit(categoryUrl);
  cy.get(".product-item").should("have.length.greaterThan", 0);
});

/**
 * Preserve cookies across tests
 * Note: Cypress.Cookies.preserveOnce was removed in Cypress 12+.
 * Use cy.session() in your tests for session preservation instead.
 */
Cypress.Commands.add("preserveSession", () => {
  // Cypress 13+: Cookie preservation is handled automatically via cy.session()
  // This command is kept as a no-op for backward compatibility
  cy.log("ℹ️ preserveSession: use cy.session() for session caching in Cypress 13+");
});

/**
 * Take screenshot with timestamp
 */
Cypress.Commands.add("screenshotWithTimestamp", (name) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  cy.screenshot(`${name}-${timestamp}`);
});

/**
 * Wait for AJAX to complete
 */
Cypress.Commands.add("waitForAjax", () => {
  cy.window().then((win) => {
    if (win.jQuery) {
      cy.wrap(null).should(() => {
        expect(win.jQuery.active).to.equal(0);
      });
    }
  });
});
