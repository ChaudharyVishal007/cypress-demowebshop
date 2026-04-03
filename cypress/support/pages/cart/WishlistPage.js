const BasePage = require("../BasePage");

/**
 * WishlistPage - Page Object for Wishlist functionality
 * URL: /wishlist
 */
class WishlistPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get wishlistItems() {
    return cy.get(".wishlist tbody tr");
  }

  get wishlistProductNames() {
    return cy.get(".wishlist .product a");
  }

  get wishlistPrices() {
    return cy.get(".wishlist .unit-price .product-unit-price");
  }

  get wishlistQuantityInputs() {
    return cy.get(".wishlist .qty-input");
  }

  get addToCartCheckboxes() {
    return cy.get(".wishlist .add-to-cart input[type='checkbox']");
  }

  get removeCheckboxes() {
    return cy.get(".wishlist .remove-from-cart input[type='checkbox']");
  }

  get updateWishlistButton() {
    return cy.get(".update-wishlist-button");
  }

  get addToCartButton() {
    return cy.get(".wishlist-add-to-cart-button");
  }

  get shareWishlistLink() {
    return cy.get(".share-link");
  }

  get emailFriendButton() {
    return cy.get(".email-a-friend-wishlist-button");
  }

  get emptyWishlistMessage() {
    return cy.get(".wishlist-content .no-data");
  }

  get pageTitle() {
    return cy.get(".page-title h1");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate() {
    return this.visit("/wishlist");
  }

  removeItemAt(index = 0) {
    this.removeCheckboxes.eq(index).check();
    this.updateWishlistButton.click();
    return this;
  }

  removeAllItems() {
    this.removeCheckboxes.each(($el) => cy.wrap($el).check());
    this.updateWishlistButton.click();
    return this;
  }

  addItemToCartAt(index = 0) {
    this.addToCartCheckboxes.eq(index).check();
    this.addToCartButton.click();
    return this;
  }

  addAllToCart() {
    this.addToCartCheckboxes.each(($el) => cy.wrap($el).check());
    this.addToCartButton.click();
    return this;
  }

  clickShareWishlist() {
    this.shareWishlistLink.click();
    return this;
  }

  getShareLink() {
    return this.shareWishlistLink.invoke("href");
  }

  clickEmailFriend() {
    this.emailFriendButton.click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnWishlistPage() {
    this.verifyUrl("/wishlist");
    return this;
  }

  verifyWishlistHasItems() {
    this.wishlistItems.should("have.length.greaterThan", 0);
    return this;
  }

  verifyWishlistIsEmpty() {
    this.emptyWishlistMessage.should("be.visible");
    return this;
  }

  verifyItemCount(count) {
    this.wishlistItems.should("have.length", count);
    return this;
  }

  verifyProductInWishlist(productName) {
    this.wishlistProductNames.should("contain.text", productName);
    return this;
  }

  verifyProductNotInWishlist(productName) {
    this.wishlistProductNames.should("not.contain.text", productName);
    return this;
  }

  verifyShareLinkVisible() {
    this.shareWishlistLink.should("be.visible");
    return this;
  }
}

module.exports = new WishlistPage();
