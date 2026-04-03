const BasePage = require("../BasePage");

/**
 * CheckoutPage - Page Object for multi-step Checkout process
 * URL: /checkout
 */
class CheckoutPage extends BasePage {
  // ─── Billing Address Selectors ────────────────────────────────────────────

  get billingFirstName() {
    return cy.get("#BillingNewAddress_FirstName");
  }

  get billingLastName() {
    return cy.get("#BillingNewAddress_LastName");
  }

  get billingEmail() {
    return cy.get("#BillingNewAddress_Email");
  }

  get billingCountry() {
    return cy.get("#BillingNewAddress_CountryId");
  }

  get billingState() {
    return cy.get("#BillingNewAddress_StateProvinceId");
  }

  get billingCity() {
    return cy.get("#BillingNewAddress_City");
  }

  get billingAddress1() {
    return cy.get("#BillingNewAddress_Address1");
  }

  get billingAddress2() {
    return cy.get("#BillingNewAddress_Address2");
  }

  get billingZip() {
    return cy.get("#BillingNewAddress_ZipPostalCode");
  }

  get billingPhone() {
    return cy.get("#BillingNewAddress_PhoneNumber");
  }

  get billingContinueBtn() {
    return cy.get("#billing-buttons-container .new-address-next-step-button");
  }

  get billingAddressDropdown() {
    return cy.get("#billing-address-select");
  }

  // ─── Shipping Address Selectors ───────────────────────────────────────────

  get shippingFirstName() {
    return cy.get("#ShippingNewAddress_FirstName");
  }

  get shippingLastName() {
    return cy.get("#ShippingNewAddress_LastName");
  }

  get shippingCountry() {
    return cy.get("#ShippingNewAddress_CountryId");
  }

  get shippingState() {
    return cy.get("#ShippingNewAddress_StateProvinceId");
  }

  get shippingCity() {
    return cy.get("#ShippingNewAddress_City");
  }

  get shippingAddress1() {
    return cy.get("#ShippingNewAddress_Address1");
  }

  get shippingZip() {
    return cy.get("#ShippingNewAddress_ZipPostalCode");
  }

  get shippingPhone() {
    return cy.get("#ShippingNewAddress_PhoneNumber");
  }

  get shippingContinueBtn() {
    return cy.get("#shipping-buttons-container .new-address-next-step-button");
  }

  get shipToSameAddressCheckbox() {
    return cy.get("#ShipToSameAddress");
  }

  // ─── Shipping Method Selectors ────────────────────────────────────────────

  get shippingMethodOptions() {
    return cy.get("#shipping-method-buttons-container input[type='radio']");
  }

  get shippingMethodLabels() {
    return cy.get(".shipping-method .method-name");
  }

  get shippingMethodContinueBtn() {
    return cy.get("#shipping-method-buttons-container .button-1");
  }

  // ─── Payment Method Selectors ─────────────────────────────────────────────

  get paymentMethodOptions() {
    return cy.get("#payment-method-buttons-container input[type='radio']");
  }

  get paymentMethodLabels() {
    return cy.get(".payment-method .method-name");
  }

  get paymentMethodContinueBtn() {
    return cy.get("#payment-method-buttons-container .button-1");
  }

  // ─── Payment Info Selectors ───────────────────────────────────────────────

  get creditCardType() {
    return cy.get("#CreditCardType");
  }

  get creditCardName() {
    return cy.get("#CardholderName");
  }

  get creditCardNumber() {
    return cy.get("#CardNumber");
  }

  get creditCardExpMonth() {
    return cy.get("#ExpireMonth");
  }

  get creditCardExpYear() {
    return cy.get("#ExpireYear");
  }

  get creditCardCVV() {
    return cy.get("#CardCode");
  }

  get purchaseOrderNumber() {
    return cy.get("#PurchaseOrderNumber");
  }

  get paymentInfoContinueBtn() {
    return cy.get("#payment-info-buttons-container .button-1");
  }

  // ─── Order Confirm Selectors ──────────────────────────────────────────────

  get orderConfirmItems() {
    return cy.get(".confirm-order-content .cart tbody tr");
  }

  get orderConfirmTotal() {
    return cy.get(".totals .order-total .value-summary");
  }

  get confirmOrderBtn() {
    return cy.get("#confirm-order-buttons-container .confirm-order-next-step-button");
  }

  // ─── Order Success Selectors ──────────────────────────────────────────────

  get orderSuccessTitle() {
    return cy.get(".section.order-completed");
  }

  get orderCompletedMessage() {
    return cy.get(".title strong");
  }

  get orderNumberLink() {
    return cy.get(".order-number a");
  }

  get continueButton() {
    return cy.get(".order-completed-continue-button");
  }

  // ─── Step Panels ─────────────────────────────────────────────────────────

  get billingStep() {
    return cy.get("#checkout-step-billing");
  }

  get shippingStep() {
    return cy.get("#checkout-step-shipping");
  }

  get shippingMethodStep() {
    return cy.get("#checkout-step-shipping-method");
  }

  get paymentMethodStep() {
    return cy.get("#checkout-step-payment-method");
  }

  get paymentInfoStep() {
    return cy.get("#checkout-step-payment-info");
  }

  get confirmStep() {
    return cy.get("#checkout-step-confirm-order");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate() {
    return this.visit("/checkout");
  }

  fillBillingAddress(data) {
    this.billingFirstName.clear().type(data.firstName);
    this.billingLastName.clear().type(data.lastName);
    if (data.email) this.billingEmail.clear().type(data.email);
    this.billingCountry.select(data.country);
    cy.wait(500);
    if (data.state) this.billingState.select(data.state);
    this.billingCity.clear().type(data.city);
    this.billingAddress1.clear().type(data.address1);
    if (data.address2) this.billingAddress2.clear().type(data.address2);
    this.billingZip.clear().type(data.zip);
    this.billingPhone.clear().type(data.phone);
    return this;
  }

  clickBillingContinue() {
    this.billingContinueBtn.click();
    return this;
  }

  checkShipToSameAddress() {
    this.shipToSameAddressCheckbox.check();
    return this;
  }

  fillShippingAddress(data) {
    this.shippingFirstName.clear().type(data.firstName);
    this.shippingLastName.clear().type(data.lastName);
    this.shippingCountry.select(data.country);
    cy.wait(500);
    if (data.state) this.shippingState.select(data.state);
    this.shippingCity.clear().type(data.city);
    this.shippingAddress1.clear().type(data.address1);
    this.shippingZip.clear().type(data.zip);
    this.shippingPhone.clear().type(data.phone);
    return this;
  }

  clickShippingContinue() {
    this.shippingContinueBtn.click();
    return this;
  }

  selectShippingMethod(index = 0) {
    this.shippingMethodOptions.eq(index).check();
    return this;
  }

  clickShippingMethodContinue() {
    this.shippingMethodContinueBtn.click();
    return this;
  }

  selectPaymentMethod(index = 0) {
    this.paymentMethodOptions.eq(index).check();
    return this;
  }

  clickPaymentMethodContinue() {
    this.paymentMethodContinueBtn.click();
    return this;
  }

  fillCreditCard(cardData) {
    this.creditCardType.select(cardData.type);
    this.creditCardName.clear().type(cardData.holder);
    this.creditCardNumber.clear().type(cardData.number);
    this.creditCardExpMonth.select(cardData.expMonth);
    this.creditCardExpYear.select(cardData.expYear);
    this.creditCardCVV.clear().type(cardData.cvv);
    return this;
  }

  enterPurchaseOrderNumber(poNumber) {
    this.purchaseOrderNumber.clear().type(poNumber);
    return this;
  }

  clickPaymentInfoContinue() {
    this.paymentInfoContinueBtn.click();
    return this;
  }

  confirmOrder() {
    this.confirmOrderBtn.click();
    return this;
  }

  clickContinueAfterOrder() {
    this.continueButton.click();
    return this;
  }

  // ─── Compound checkout flow ───────────────────────────────────────────────

  completeCheckoutWithCheckMoney(billingData) {
    this.fillBillingAddress(billingData);
    this.clickBillingContinue();
    cy.wait(1000);
    this.clickShippingContinue();
    cy.wait(1000);
    this.clickShippingMethodContinue();
    cy.wait(1000);
    // Check/Money Order = first option usually
    this.clickPaymentMethodContinue();
    cy.wait(1000);
    this.clickPaymentInfoContinue();
    cy.wait(1000);
    this.confirmOrder();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnCheckoutPage() {
    this.verifyUrl("/checkout");
    return this;
  }

  verifyBillingStepActive() {
    this.billingStep.should("be.visible");
    return this;
  }

  verifyOrderSuccess() {
    this.orderCompletedMessage.should("contain.text", "Your order has been successfully processed");
    return this;
  }

  getOrderNumber() {
    return this.orderNumberLink;
  }

  verifyConfirmStepItems() {
    this.orderConfirmItems.should("have.length.greaterThan", 0);
    return this;
  }
}

module.exports = new CheckoutPage();
