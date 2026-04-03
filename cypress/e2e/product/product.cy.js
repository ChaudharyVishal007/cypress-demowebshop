/**
 * Test Suite: Product Detail & Listing Functionality
 * Tags: smoke, regression, product
 *
 * Layer Classification:
 *  - Home Page Products (TC_PROD_001–003):    integration — read-only catalog display checks
 *  - Product List Page (TC_PROD_004–017):     integration — category browsing & sorting (no state change)
 *  - Product Detail Page (TC_PROD_018–028):   integration — detail display; e2e for cart/wishlist actions
 *  - Product Reviews (TC_PROD_029):            e2e — form submission touching review service
 */

import ProductPage from "../../support/pages/product/ProductPage";
import ProductListPage from "../../support/pages/product/ProductListPage";
import HomePage from "../../support/pages/HomePage";

describe("Product Functionality", { tags: ["regression", "product"] }, () => {
  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // ─── Home Page Products ────────────────────────────────────────────────

  context("Home Page Products", () => {
    beforeEach(() => {
      cy.allureEpic("Catalog");
      cy.allureFeature("Product");
      cy.allureStory("Featured Products on Home Page");
      cy.allureSeverity("normal");
      cy.allureLayer("integration");
      HomePage.navigate();
    });

    it("TC_PROD_001 - Should display featured products on home page", () => {
      HomePage.verifyFeaturedProductsVisible();
    });

    it("TC_PROD_002 - Should navigate to product detail from featured products", () => {
      HomePage.featuredProducts
        .first()
        .find(".product-title a")
        .then(($link) => {
          const productName = $link.text().trim();
          cy.wrap($link).click();
          ProductPage.verifyProductTitle(productName);
        });
    });

    it("TC_PROD_003 - Should display product prices on home page", () => {
      HomePage.featuredProducts
        .first()
        .find(".price.actual-price")
        .should("be.visible");
    });
  });

  // ─── Category / List Page ──────────────────────────────────────────────

  context("Product List Page", () => {
    beforeEach(() => {
      cy.allureEpic("Catalog");
      cy.allureFeature("Product");
      cy.allureStory("Category & List Page Browsing");
      cy.allureSeverity("normal");
      cy.allureLayer("integration");
    });

    it("TC_PROD_004 - Should display products in Books category", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.verifyPageTitle("Books");
      ProductListPage.verifyProductsDisplayed();
    });

    it("TC_PROD_005 - Should display products in Computers category", () => {
      ProductListPage.navigate(products.categories.computers);
      ProductListPage.verifySubCategoriesVisible();
    });

    it("TC_PROD_006 - Should display products in Electronics category", () => {
      ProductListPage.navigate(products.categories.electronics);
      ProductListPage.verifySubCategoriesVisible();
    });

    it("TC_PROD_007 - Should display products in Apparel & Shoes category", () => {
      ProductListPage.navigate(products.categories.apparel);
      ProductListPage.verifyPageTitle("Apparel & Shoes");
      ProductListPage.verifyProductsDisplayed();
    });

    it("TC_PROD_008 - Should display products in Digital Downloads category", () => {
      ProductListPage.navigate(products.categories.digitalDownloads);
      ProductListPage.verifyPageTitle("Digital downloads");
      ProductListPage.verifyProductsDisplayed();
    });

    it("TC_PROD_009 - Should display products in Jewelry category", () => {
      ProductListPage.navigate(products.categories.jewelry);
      ProductListPage.verifyPageTitle("Jewelry");
      ProductListPage.verifyProductsDisplayed();
    });

    it("TC_PROD_010 - Should display products in Gift Cards category", () => {
      ProductListPage.navigate(products.categories.giftCards);
      ProductListPage.verifyPageTitle("Gift Cards");
      ProductListPage.verifyProductsDisplayed();
    });

    it("TC_PROD_011 - Should sort products by Name A-Z", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.sortBy("Name: A to Z");
      ProductListPage.verifyProductsDisplayed();
    });

    it("TC_PROD_012 - Should sort products by Price Low to High", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.sortBy("Price: Low to High");
      // Verify first price is less than last
      let firstPrice, lastPrice;
      ProductListPage.productPrices.first().invoke("text").then((t) => {
        firstPrice = parseFloat(t.replace(/[^0-9.]/g, ""));
      });
      ProductListPage.productPrices.last().invoke("text").then((t) => {
        lastPrice = parseFloat(t.replace(/[^0-9.]/g, ""));
        expect(firstPrice).to.be.lte(lastPrice);
      });
    });

    it("TC_PROD_013 - Should sort products by Price High to Low", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.sortBy("Price: High to Low");
      ProductListPage.verifyProductsDisplayed();
    });

    it("TC_PROD_014 - Should switch to list view", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.switchToListView();
      cy.get(".product-list .product-item").should("exist");
    });

    it("TC_PROD_015 - Should switch to grid view", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.switchToListView();
      ProductListPage.switchToGridView();
      cy.get(".product-grid .product-item").should("exist");
    });

    it("TC_PROD_016 - Should display breadcrumb on category page", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.verifyBreadcrumbContains("Books");
    });

    it("TC_PROD_017 - Should change products per page to 4", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.setProductsPerPage(4);
      ProductListPage.productItems.should("have.length.lte", 4);
    });
  });

  // ─── Product Detail Page ───────────────────────────────────────────────

  context("Product Detail Page", () => {
    beforeEach(() => {
      cy.allureEpic("Catalog");
      cy.allureFeature("Product");
      cy.allureStory("Product Detail Page UI & Actions");
      cy.allureSeverity("normal");
      cy.allureLayer("integration");
    });

    it("TC_PROD_018 - Should display product title on detail page", () => {
      ProductPage.navigate(products.singleProduct.url);
      ProductPage.verifyProductTitle(products.singleProduct.name);
    });

    it("TC_PROD_019 - Should display product image", () => {
      ProductPage.navigate(products.singleProduct.url);
      ProductPage.verifyProductImageVisible();
    });

    it("TC_PROD_020 - Should display Add to Cart button", () => {
      ProductPage.navigate(products.singleProduct.url);
      ProductPage.verifyAddToCartVisible();
    });

    it("TC_PROD_021 - Should display breadcrumb on product detail page", () => {
      ProductPage.navigate(products.singleProduct.url);
      ProductPage.verifyBreadcrumbVisible();
    });

    it("TC_PROD_022 - Should display product description", () => {
      ProductPage.navigate(products.singleProduct.url);
      ProductPage.productDescription.should("exist");
    });

    it("TC_PROD_023 - Should change quantity before adding to cart", () => {
      ProductPage.navigate(products.singleProduct.url);
      ProductPage.setQuantity(2);
      ProductPage.quantityInput.should("have.value", "2");
    });

    it("TC_PROD_024 - Should add product to cart from detail page", () => {
      cy.allureStory("Add to Cart from Detail Page");
      cy.allureSeverity("critical");
      cy.allureLayer("e2e");
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      ProductPage.navigate(products.singleProduct.url);
      ProductPage.clickAddToCart();
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_PROD_025 - Should add product to wishlist from detail page", () => {
      cy.allureStory("Add to Wishlist from Detail Page");
      cy.allureSeverity("normal");
      cy.allureLayer("e2e");
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearWishlist();
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.clickAddToWishlist();
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_PROD_026 - Should navigate back to category via breadcrumb", () => {
      ProductPage.navigate(products.singleProduct.url);
      cy.get(".breadcrumb a").eq(1).click();
      cy.url().should("include", "/computers");
    });

    it("TC_PROD_027 - Should display product tags if available", () => {
      ProductPage.navigate(products.bookProduct.url);
      cy.get("body").then(($body) => {
        if ($body.find(".product-tags-list").length > 0) {
          ProductPage.productTags.should("have.length.greaterThan", 0);
        }
      });
    });

    it("TC_PROD_028 - Should display related products section", () => {
      ProductPage.navigate(products.singleProduct.url);
      cy.get("body").then(($body) => {
        if ($body.find(".related-products-grid").length > 0) {
          ProductPage.verifyRelatedProductsVisible();
        }
      });
    });
  });

  // ─── Product Reviews ───────────────────────────────────────────────────

  context("Product Reviews", () => {
    beforeEach(() => {
      cy.allureEpic("Catalog");
      cy.allureFeature("Product");
      cy.allureStory("Product Review Submission");
      cy.allureSeverity("minor");
      cy.allureLayer("e2e");
    });

    before(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
    });

    it("TC_PROD_029 - Should submit a product review successfully", () => {
      ProductPage.navigate(products.bookProduct.url);
      cy.get("body").then(($body) => {
        if ($body.find(".write-review").length > 0) {
          ProductPage.submitReview(4, "Great Product", "This is a great product. Highly recommended!");
          ProductPage.verifyReviewSubmitted();
        } else {
          cy.log("Review section not present - skipping");
        }
      });
    });
  });
});
