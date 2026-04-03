/**
 * Test Suite: Wishlist Functionality
 * Tags: regression, wishlist
 */

import WishlistPage from "../../support/pages/cart/WishlistPage";
import ProductPage from "../../support/pages/product/ProductPage";
import ProductListPage from "../../support/pages/product/ProductListPage";
import CartPage from "../../support/pages/cart/CartPage";

describe("Wishlist Functionality", { tags: ["regression", "wishlist"] }, () => {
  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // ─── Add to Wishlist ───────────────────────────────────────────────────

  context("Add to Wishlist", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearWishlist();
    });

    it("TC_WISH_001 - Should add product to wishlist from product detail page", () => {
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.clickAddToWishlist();
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_WISH_002 - Should update wishlist counter in header", () => {
      cy.visit("/");
      cy.get(".wishlist-qty").should("contain.text", "(0)");
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.clickAddToWishlist();
      cy.get(".wishlist-qty").should("contain.text", "(1)");
    });

    it("TC_WISH_003 - Should add product from category listing to wishlist", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.addToWishlistAt(0);
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_WISH_004 - Should add multiple products to wishlist", () => {
      cy.addToWishlistByUrl(products.bookProduct.url);
      cy.dismissNotification();
      cy.addToWishlistByUrl(products.simpleProduct.url);
      WishlistPage.navigate();
      WishlistPage.verifyItemCount(2);
    });
  });

  // ─── Wishlist Management ───────────────────────────────────────────────

  context("Wishlist Management", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearWishlist();
      cy.addToWishlistByUrl(products.bookProduct.url);
      WishlistPage.navigate();
    });

    it("TC_WISH_005 - Should display wishlist page with added product", () => {
      WishlistPage.verifyOnWishlistPage();
      WishlistPage.verifyWishlistHasItems();
    });

    it("TC_WISH_006 - Should display product name in wishlist", () => {
      WishlistPage.verifyProductInWishlist(products.bookProduct.name);
    });

    it("TC_WISH_007 - Should display product price in wishlist", () => {
      WishlistPage.wishlistPrices.first().should("be.visible");
    });

    it("TC_WISH_008 - Should remove product from wishlist", () => {
      WishlistPage.removeItemAt(0);
      WishlistPage.verifyWishlistIsEmpty();
    });

    it("TC_WISH_009 - Should display empty message after removing all items", () => {
      WishlistPage.removeAllItems();
      WishlistPage.emptyWishlistMessage.should("be.visible");
    });

    it("TC_WISH_010 - Should update wishlist header count after removal", () => {
      WishlistPage.removeItemAt(0);
      cy.get(".wishlist-qty").should("contain.text", "(0)");
    });

    it("TC_WISH_011 - Should display share wishlist link", () => {
      WishlistPage.verifyShareLinkVisible();
    });
  });

  // ─── Wishlist to Cart ──────────────────────────────────────────────────

  context("Move Wishlist Items to Cart", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearWishlist();
      cy.clearCart();
      cy.addToWishlistByUrl(products.bookProduct.url);
      WishlistPage.navigate();
    });

    it("TC_WISH_012 - Should move wishlist item to cart", () => {
      WishlistPage.addItemToCartAt(0);
      cy.url().should("include", "/cart");
      CartPage.verifyCartHasItems();
    });

    it("TC_WISH_013 - Should display product in cart after moving from wishlist", () => {
      WishlistPage.addItemToCartAt(0);
      CartPage.verifyProductInCart(products.bookProduct.name);
    });

    it("TC_WISH_014 - Should move all wishlist items to cart", () => {
      // Add a second item
      cy.addToWishlistByUrl(products.simpleProduct.url);
      WishlistPage.navigate();
      WishlistPage.addAllToCart();
      CartPage.navigate();
      CartPage.verifyCartHasItems();
    });
  });

  // ─── Guest Wishlist ────────────────────────────────────────────────────

  context("Guest Wishlist", () => {
    it("TC_WISH_015 - Should allow guest to add items to wishlist", () => {
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.clickAddToWishlist();
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_WISH_016 - Should display wishlist for guest", () => {
      cy.addToWishlistByUrl(products.bookProduct.url);
      WishlistPage.navigate();
      WishlistPage.verifyWishlistHasItems();
    });
  });

  // ─── Shared Wishlist ───────────────────────────────────────────────────

  context("Shared Wishlist", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearWishlist();
      cy.addToWishlistByUrl(products.bookProduct.url);
      WishlistPage.navigate();
    });

    it("TC_WISH_017 - Should generate a shareable wishlist link", () => {
      WishlistPage.shareWishlistLink
        .invoke("attr", "href")
        .should("include", "/wishlist/");
    });

    it("TC_WISH_018 - Should access shared wishlist as guest", () => {
      WishlistPage.shareWishlistLink
        .invoke("attr", "href")
        .then((link) => {
          cy.logout();
          cy.visit(link);
          cy.get(".wishlist-content").should("exist");
        });
    });
  });
});
