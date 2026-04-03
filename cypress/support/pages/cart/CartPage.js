const BasePage = require("../BasePage");

/**
 * CartPage - Page Object for Shopping Cart functionality
 * URL: /cart
 */
class CartPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get cartItems() {
    return cy.get(".cart tbody tr");
  }

  get cartItemNames() {
    return cy.get(".cart .product a");
  }

  get cartItemPrices() {
    return cy.get(".cart .unit-price .product-unit-price");
  }

  get cartItemQuantityInputs() {
    return cy.get(".cart .qty-input");
  }

  get cartItemSubtotals() {
    return cy.get(".cart .subtotal .product-subtotal");
  }

  get removeItemCheckboxes() {
    return cy.get(".cart .remove-from-cart input[type='checkbox']");
  }

  get updateCartButton() {
    return cy.get(".update-cart-button");
  }

  get continueShoppingButton() {
    return cy.get(".continue-shopping-button");
  }

  get estimateShippingButton() {
    return cy.get(".estimate-shipping-button");
  }

  get countrySelect() {
    return cy.get("#CountryId");
  }

  get stateSelect() {
    return cy.get("#StateProvinceId");
  }

  get zipInput() {
    return cy.get("#ZipPostalCode");
  }

  get couponCodeInput() {
    return cy.get("#coupon-code");
  }

  get applyCouponButton() {
    return cy.get(".apply-discount-coupon-code-button");
  }

  get giftCardInput() {
    return cy.get("#gift-card-coupon-code");
  }

  get applyGiftCardButton() {
    return cy.get(".apply-gift-card-coupon-code-button");
  }

  get cartSubtotal() {
    return cy.get(".cart-total .order-subtotal .value-summary");
  }

  get cartShipping() {
    return cy.get(".cart-total .shipping .value-summary");
  }

  get cartTotal() {
    return cy.get(".cart-total .order-total .value-summary");
  }

  get termsCheckbox() {
    return cy.get("#termsofservice");
  }

  get checkoutButton() {
    return cy.get("#checkout");
  }

  get emptyCartMessage() {
    return cy.get(".order-summary-content .no-data");
  }

  get cartTable() {
    return cy.get(".cart-content");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate() {
    return this.visit("/cart");
  }

  updateItemQuantity(index, qty) {
    this.cartItemQuantityInputs.eq(index).clear().type(qty.toString());
    return this;
  }

  removeItemAt(index) {
    this.removeItemCheckboxes.eq(index).check();
    this.updateCartButton.click();
    return this;
  }

  removeAllItems() {
    this.removeItemCheckboxes.each(($el) => cy.wrap($el).check());
    this.updateCartButton.click();
    return this;
  }

  clickUpdateCart() {
    this.updateCartButton.click();
    return this;
  }

  clickContinueShopping() {
    this.continueShoppingButton.click();
    return this;
  }

  applyCouponCode(code) {
    this.couponCodeInput.clear().type(code);
    this.applyCouponButton.click();
    return this;
  }

  applyGiftCard(code) {
    this.giftCardInput.clear().type(code);
    this.applyGiftCardButton.click();
    return this;
  }

  estimateShipping(country, zip) {
    this.countrySelect.select(country);
    this.zipInput.clear().type(zip);
    this.estimateShippingButton.click();
    return this;
  }

  acceptTermsAndCheckout() {
    this.termsCheckbox.check();
    this.checkoutButton.click();
    return this;
  }

  proceedToCheckout() {
    this.termsCheckbox.check();
    this.checkoutButton.click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnCartPage() {
    this.verifyUrl("/cart");
    return this;
  }

  verifyCartHasItems() {
    this.cartItems.should("have.length.greaterThan", 0);
    return this;
  }

  verifyCartIsEmpty() {
    this.emptyCartMessage.should("be.visible");
    return this;
  }

  verifyItemCount(count) {
    this.cartItems.should("have.length", count);
    return this;
  }

  verifyProductInCart(productName) {
    this.cartItemNames.should("contain.text", productName);
    return this;
  }

  verifyProductNotInCart(productName) {
    this.cartItemNames.should("not.contain.text", productName);
    return this;
  }

  verifyCartTotal(total) {
    this.cartTotal.should("contain.text", total);
    return this;
  }

  verifyCheckoutButtonVisible() {
    this.checkoutButton.should("be.visible");
    return this;
  }

  verifyTermsCheckboxVisible() {
    this.termsCheckbox.should("be.visible");
    return this;
  }

  verifyInvalidCouponMessage() {
    cy.get(".message-failure").should("be.visible");
    return this;
  }

  verifyQuantityUpdated(index, qty) {
    this.cartItemQuantityInputs.eq(index).should("have.value", qty.toString());
    return this;
  }
}

module.exports = new CartPage();
