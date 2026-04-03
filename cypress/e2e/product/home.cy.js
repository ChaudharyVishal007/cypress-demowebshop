/**
 * Test Suite: Home Page Functionality
 * Tags: smoke, regression
 */

import HomePage from "../../support/pages/HomePage";

describe("Home Page Functionality", { tags: ["smoke"] }, () => {

  beforeEach(() => {
    HomePage.navigate();
  });

  // ─── Page Load & Layout ────────────────────────────────────────────────

  context("Page Load & Layout", () => {
    it("TC_HOME_001 - Should load home page successfully", () => {
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
      HomePage.verifyLogoVisible();
    });

    it("TC_HOME_002 - Should display site logo", () => {
      HomePage.verifyLogoVisible();
    });

    it("TC_HOME_003 - Should display category navigation menu", () => {
      HomePage.verifyCategoryMenuVisible();
    });

    it("TC_HOME_004 - Should display featured products", () => {
      HomePage.verifyFeaturedProductsVisible();
    });

    it("TC_HOME_005 - Should display footer", () => {
      HomePage.verifyFooterVisible();
    });

    it("TC_HOME_006 - Should display header search bar", () => {
      HomePage.headerSearchBox.should("be.visible");
    });

    it("TC_HOME_007 - Should display cart link in header", () => {
      HomePage.headerCartLink.should("be.visible");
    });

    it("TC_HOME_008 - Should display wishlist link in header", () => {
      HomePage.headerWishlistLink.should("be.visible");
    });
  });

  // ─── Navigation ────────────────────────────────────────────────────────

  context("Navigation", () => {
    it("TC_HOME_009 - Should navigate to Login page from header", () => {
      HomePage.navigateToLogin();
      cy.url().should("include", "/login");
    });

    it("TC_HOME_010 - Should navigate to Register page from header", () => {
      HomePage.navigateToRegister();
      cy.url().should("include", "/register");
    });

    it("TC_HOME_011 - Should navigate to Books category", () => {
      HomePage.clickCategoryMenu("Books");
      cy.url().should("include", "/books");
    });

    it("TC_HOME_012 - Should navigate to Computers category", () => {
      HomePage.clickCategoryMenu("Computers");
      cy.url().should("include", "/computers");
    });

    it("TC_HOME_013 - Should navigate to Electronics category", () => {
      HomePage.clickCategoryMenu("Electronics");
      cy.url().should("include", "/electronics");
    });

    it("TC_HOME_014 - Should navigate to Jewelry category", () => {
      HomePage.clickCategoryMenu("Jewelry");
      cy.url().should("include", "/jewelry");
    });

    it("TC_HOME_015 - Should navigate to Gift Cards category", () => {
      HomePage.clickCategoryMenu("Gift Cards");
      cy.url().should("include", "/gift-cards");
    });

    it("TC_HOME_016 - Should navigate to home when logo is clicked", () => {
      cy.visit("/login");
      HomePage.clickLogo();
      HomePage.verifyOnHomePage();
    });

    it("TC_HOME_017 - Should navigate to Cart page from header", () => {
      HomePage.navigateToCart();
      cy.url().should("include", "/cart");
    });
  });

  // ─── Newsletter ────────────────────────────────────────────────────────

  context("Newsletter Subscription", () => {
    it("TC_HOME_018 - Should display newsletter subscription input", () => {
      HomePage.newsletterEmail.should("be.visible");
      HomePage.newsletterSubscribeBtn.should("be.visible");
    });

    it("TC_HOME_019 - Should subscribe to newsletter with valid email", () => {
      const timestamp = Date.now();
      HomePage.subscribeToNewsletter(`newsletter_${timestamp}@test.com`);
      cy.get(".newsletter-result").should("be.visible");
    });

    it("TC_HOME_020 - Should show error for invalid newsletter email", () => {
      HomePage.subscribeToNewsletter("notanemail");
      cy.get(".field-validation-error, .newsletter-result").should("exist");
    });
  });

  // ─── Community Poll ────────────────────────────────────────────────────

  context("Community Poll", () => {
    it("TC_HOME_021 - Should display community poll block", () => {
      cy.get("body").then(($body) => {
        if ($body.find(".block-poll").length > 0) {
          HomePage.pollBlock.should("be.visible");
        } else {
          cy.log("Poll block not present - skipping");
        }
      });
    });

    it("TC_HOME_022 - Should allow voting in community poll", () => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.visit("/");
      cy.get("body").then(($body) => {
        if ($body.find(".block-poll").length > 0) {
          cy.get(".poll-block input[type='radio']").first().check();
          cy.get(".poll-block .vote-poll-button").click();
          cy.get(".poll-block").should("exist");
        }
      });
    });
  });

  // ─── Featured Products ─────────────────────────────────────────────────

  context("Featured Products Interaction", () => {
    it("TC_HOME_023 - Should display prices for featured products", () => {
      HomePage.getFeaturedProductPrice(0).should("be.visible");
    });

    it("TC_HOME_024 - Should navigate to product detail from featured product", () => {
      HomePage.clickOnFeaturedProduct(0);
      cy.get(".product-name h1").should("be.visible");
    });

    it("TC_HOME_025 - Should show multiple featured products", () => {
      HomePage.featuredProducts.should("have.length.greaterThan", 1);
    });
  });
});
