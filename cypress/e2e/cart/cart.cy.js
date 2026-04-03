/**
 * Test Suite: Shopping Cart Functionality
 * Tags: smoke, regression, cart
 *
 * Layer Classification:
 *  - Add to Cart (TC_CART_001–005):        e2e — full product-to-cart flow via UI & API
 *  - Cart Management (TC_CART_006–015):    e2e — cart CRUD operations with server state
 *  - Coupon & Gift Card (TC_CART_016–017): e2e — coupon engine integration
 *  - Guest Cart (TC_CART_018–020):         e2e — guest user flow
 *  - Cart Header Counter (TC_CART_021–022): integration — UI counter updates against live cart
 */

import CartPage from "../../support/pages/cart/CartPage";
import ProductPage from "../../support/pages/product/ProductPage";
import ProductListPage from "../../support/pages/product/ProductListPage";

describe("Shopping Cart Functionality", { tags: ["smoke", "cart"] }, () => {
  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // ─── Add to Cart Tests ─────────────────────────────────────────────────

  context("Add to Cart", () => {
    beforeEach(() => {
      cy.allureEpic("Shopping");
      cy.allureFeature("Cart");
      cy.allureStory("Add Product to Cart");
      cy.allureSeverity("critical");
      cy.allureLayer("e2e");
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
    });

    it("TC_CART_001 - Should add a product to cart from product detail page", () => {
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.clickAddToCart();
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_CART_002 - Should update cart count in header after adding product", () => {
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.clickAddToCart();
      cy.get(".cart-qty").should("contain.text", "(1)");
    });

    it("TC_CART_003 - Should add multiple products to cart", () => {
      cy.addToCartByUrl(products.bookProduct.url);
      cy.dismissNotification();
      cy.addToCartByUrl(products.simpleProduct.url);
      CartPage.navigate();
      CartPage.verifyItemCount(2);
    });

    it("TC_CART_004 - Should add product to cart from category listing", () => {
      ProductListPage.navigate(products.categories.books);
      ProductListPage.addToCartAt(0);
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_CART_005 - Should add product with quantity 2", () => {
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.setQuantity(2);
      ProductPage.clickAddToCart();
      CartPage.navigate();
      CartPage.cartItemQuantityInputs.first().should("have.value", "2");
    });
  });

  // ─── Cart Management Tests ─────────────────────────────────────────────

  context("Cart Management", () => {
    beforeEach(() => {
      cy.allureEpic("Shopping");
      cy.allureFeature("Cart");
      cy.allureStory("Cart Item Management");
      cy.allureSeverity("normal");
      cy.allureLayer("e2e");
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
    });

    it("TC_CART_006 - Should view cart page with product", () => {
      CartPage.navigate();
      CartPage.verifyCartHasItems();
      CartPage.verifyProductInCart(products.bookProduct.name);
    });

    it("TC_CART_007 - Should update quantity in cart", () => {
      CartPage.navigate();
      CartPage.updateItemQuantity(0, 3);
      CartPage.clickUpdateCart();
      CartPage.verifyQuantityUpdated(0, 3);
    });

    it("TC_CART_008 - Should remove an item from cart", () => {
      CartPage.navigate();
      CartPage.removeItemAt(0);
      CartPage.verifyCartIsEmpty();
    });

    it("TC_CART_009 - Should display cart empty message after removing all items", () => {
      CartPage.navigate();
      CartPage.removeAllItems();
      CartPage.emptyCartMessage.should("be.visible");
    });

    it("TC_CART_010 - Should display product price in cart", () => {
      CartPage.navigate();
      CartPage.cartItemPrices.first().should("be.visible");
    });

    it("TC_CART_011 - Should display subtotal in cart", () => {
      CartPage.navigate();
      CartPage.cartItemSubtotals.first().should("be.visible");
    });

    it("TC_CART_012 - Should display order total in cart", () => {
      CartPage.navigate();
      CartPage.cartTotal.should("be.visible");
    });

    it("TC_CART_013 - Should continue shopping from cart", () => {
      CartPage.navigate();
      CartPage.clickContinueShopping();
      cy.url().should("not.include", "/cart");
    });

    it("TC_CART_014 - Should display Terms checkbox before checkout", () => {
      CartPage.navigate();
      CartPage.verifyTermsCheckboxVisible();
    });

    it("TC_CART_015 - Should display Checkout button", () => {
      CartPage.navigate();
      CartPage.verifyCheckoutButtonVisible();
    });
  });

  // ─── Coupon & Gift Card Tests ──────────────────────────────────────────

  context("Coupon & Gift Card", () => {
    beforeEach(() => {
      cy.allureEpic("Shopping");
      cy.allureFeature("Cart");
      cy.allureStory("Coupon & Gift Card Validation");
      cy.allureSeverity("normal");
      cy.allureLayer("e2e");
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
    });

    it("TC_CART_016 - Should show error for invalid coupon code", () => {
      CartPage.applyCouponCode("INVALIDCODE123");
      CartPage.verifyInvalidCouponMessage();
    });

    it("TC_CART_017 - Should show error for invalid gift card code", () => {
      CartPage.applyGiftCard("INVALIDGIFTCARD");
      cy.get(".message-failure").should("be.visible");
    });
  });

  // ─── Guest Cart Tests ──────────────────────────────────────────────────

  context("Guest Cart", () => {
    beforeEach(() => {
      cy.allureEpic("Shopping");
      cy.allureFeature("Cart");
      cy.allureStory("Guest Cart Behaviour");
      cy.allureSeverity("normal");
      cy.allureLayer("e2e");
    });

    it("TC_CART_018 - Should allow guest to add products to cart", () => {
      ProductPage.navigate(products.bookProduct.url);
      ProductPage.clickAddToCart();
      cy.verifySuccess("The product has been added to your");
    });

    it("TC_CART_019 - Should maintain cart items as guest", () => {
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
      CartPage.verifyCartHasItems();
    });

    it("TC_CART_020 - Should redirect guest to login on checkout attempt", () => {
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
      CartPage.acceptTermsAndCheckout();
      cy.url().should("include", "/login");
    });
  });

  // ─── Cart Header Count Tests ───────────────────────────────────────────

  context("Cart Header Counter", () => {
    beforeEach(() => {
      cy.allureEpic("Shopping");
      cy.allureFeature("Cart");
      cy.allureStory("Cart Counter UI");
      cy.allureSeverity("minor");
      cy.allureLayer("integration");
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
    });

    it("TC_CART_021 - Should show (0) in header when cart is empty", () => {
      cy.visit("/");
      cy.get(".cart-qty").should("contain.text", "(0)");
    });

    it("TC_CART_022 - Should increment cart counter when product is added", () => {
      cy.visit("/");
      cy.get(".cart-qty").should("contain.text", "(0)");
      cy.addToCartByUrl(products.bookProduct.url);
      cy.get(".cart-qty").should("contain.text", "(1)");
    });
  });
});
