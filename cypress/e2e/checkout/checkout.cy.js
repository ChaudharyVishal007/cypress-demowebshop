/**
 * Test Suite: Checkout Functionality
 * Tags: regression, checkout
 */

import CartPage from "../../support/pages/cart/CartPage";
import CheckoutPage from "../../support/pages/checkout/CheckoutPage";

describe("Checkout Functionality", { tags: ["regression", "checkout"] }, () => {
  let checkoutData, products;

  before(() => {
    cy.fixture("checkout").then((data) => {
      checkoutData = data;
    });
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // ─── Checkout Flow ─────────────────────────────────────────────────────

  context("Full Checkout Flow - Check/Money Order", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
      CartPage.acceptTermsAndCheckout();
    });

    it("TC_CHK_001 - Should navigate to checkout page after accepting terms", () => {
      CheckoutPage.verifyOnCheckoutPage();
    });

    it("TC_CHK_002 - Should display billing address step on checkout", () => {
      CheckoutPage.verifyBillingStepActive();
    });

    it("TC_CHK_003 - Should complete checkout with Check/Money Order payment", () => {
      CheckoutPage.fillBillingAddress(checkoutData.billingAddress);
      CheckoutPage.clickBillingContinue();
      cy.wait(1500);

      // Shipping step
      CheckoutPage.clickShippingContinue();
      cy.wait(1500);

      // Shipping method
      CheckoutPage.selectShippingMethod(0);
      CheckoutPage.clickShippingMethodContinue();
      cy.wait(1500);

      // Payment method - Check/Money Order
      CheckoutPage.selectPaymentMethod(0);
      CheckoutPage.clickPaymentMethodContinue();
      cy.wait(1500);

      // Payment info
      CheckoutPage.clickPaymentInfoContinue();
      cy.wait(1500);

      // Confirm order
      CheckoutPage.verifyConfirmStepItems();
      CheckoutPage.confirmOrder();

      // Verify success
      CheckoutPage.verifyOrderSuccess();
    });

    it("TC_CHK_004 - Should display order number after successful checkout", () => {
      CheckoutPage.fillBillingAddress(checkoutData.billingAddress);
      CheckoutPage.clickBillingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingMethodContinue();
      cy.wait(1500);
      CheckoutPage.clickPaymentMethodContinue();
      cy.wait(1500);
      CheckoutPage.clickPaymentInfoContinue();
      cy.wait(1500);
      CheckoutPage.confirmOrder();

      CheckoutPage.orderNumberLink.should("be.visible");
    });

    it("TC_CHK_005 - Should navigate to home after completing order", () => {
      CheckoutPage.fillBillingAddress(checkoutData.billingAddress);
      CheckoutPage.clickBillingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingMethodContinue();
      cy.wait(1500);
      CheckoutPage.clickPaymentMethodContinue();
      cy.wait(1500);
      CheckoutPage.clickPaymentInfoContinue();
      cy.wait(1500);
      CheckoutPage.confirmOrder();
      CheckoutPage.verifyOrderSuccess();
      CheckoutPage.clickContinueAfterOrder();
      cy.url().should("eq", Cypress.config("baseUrl") + "/");
    });
  });

  // ─── Billing Address Validation ────────────────────────────────────────

  context("Billing Address Validation", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
      CartPage.acceptTermsAndCheckout();
    });

    it("TC_CHK_006 - Should show validation for empty billing fields", () => {
      CheckoutPage.clickBillingContinue();
      cy.get(".field-validation-error").should("exist");
    });

    it("TC_CHK_007 - Should show validation for missing city", () => {
      const data = { ...checkoutData.billingAddress, city: "" };
      CheckoutPage.billingFirstName.clear().type(data.firstName);
      CheckoutPage.billingLastName.clear().type(data.lastName);
      CheckoutPage.billingCountry.select(data.country);
      cy.wait(500);
      CheckoutPage.billingZip.clear().type(data.zip);
      CheckoutPage.clickBillingContinue();
      cy.get(".field-validation-error").should("exist");
    });
  });

  // ─── Shipping Methods ──────────────────────────────────────────────────

  context("Shipping Methods", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
      CartPage.acceptTermsAndCheckout();
      CheckoutPage.fillBillingAddress(checkoutData.billingAddress);
      CheckoutPage.clickBillingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingContinue();
      cy.wait(1500);
    });

    it("TC_CHK_008 - Should display shipping methods", () => {
      CheckoutPage.shippingMethodOptions.should("have.length.greaterThan", 0);
    });

    it("TC_CHK_009 - Should select Ground shipping method", () => {
      CheckoutPage.selectShippingMethod(0);
      CheckoutPage.shippingMethodOptions.first().should("be.checked");
    });

    it("TC_CHK_010 - Should select Next Day Air shipping method", () => {
      CheckoutPage.shippingMethodOptions.then(($options) => {
        if ($options.length >= 2) {
          CheckoutPage.selectShippingMethod(1);
          CheckoutPage.shippingMethodOptions.eq(1).should("be.checked");
        }
      });
    });
  });

  // ─── Payment Methods ───────────────────────────────────────────────────

  context("Payment Methods", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
      CartPage.acceptTermsAndCheckout();
      CheckoutPage.fillBillingAddress(checkoutData.billingAddress);
      CheckoutPage.clickBillingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingMethodContinue();
      cy.wait(1500);
    });

    it("TC_CHK_011 - Should display payment method options", () => {
      CheckoutPage.paymentMethodOptions.should("have.length.greaterThan", 0);
    });

    it("TC_CHK_012 - Should select Check/Money Order payment", () => {
      CheckoutPage.selectPaymentMethod(0);
      CheckoutPage.paymentMethodOptions.first().should("be.checked");
    });
  });

  // ─── Order Review ──────────────────────────────────────────────────────

  context("Order Review / Confirmation", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
      CartPage.acceptTermsAndCheckout();
      CheckoutPage.fillBillingAddress(checkoutData.billingAddress);
      CheckoutPage.clickBillingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingContinue();
      cy.wait(1500);
      CheckoutPage.clickShippingMethodContinue();
      cy.wait(1500);
      CheckoutPage.clickPaymentMethodContinue();
      cy.wait(1500);
      CheckoutPage.clickPaymentInfoContinue();
      cy.wait(1500);
    });

    it("TC_CHK_013 - Should display order items in confirmation step", () => {
      CheckoutPage.verifyConfirmStepItems();
    });

    it("TC_CHK_014 - Should display order total in confirmation step", () => {
      CheckoutPage.orderConfirmTotal.should("be.visible");
    });
  });

  // ─── Terms of Service ──────────────────────────────────────────────────

  context("Terms of Service", () => {
    beforeEach(() => {
      cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
      cy.clearCart();
      cy.addToCartByUrl(products.bookProduct.url);
      CartPage.navigate();
    });

    it("TC_CHK_015 - Should display Terms of Service alert when not checked", () => {
      CartPage.checkoutButton.click();
      cy.on("window:alert", (alertText) => {
        expect(alertText).to.include("terms");
      });
    });

    it("TC_CHK_016 - Should allow checkout when terms are accepted", () => {
      CartPage.termsCheckbox.check();
      CartPage.checkoutButton.click();
      CheckoutPage.verifyOnCheckoutPage();
    });
  });
});
