const BasePage = require("../BasePage");

/**
 * LoginPage - Page Object for Login functionality
 * URL: /login
 *
 * All selectors use cy.selfHeal(selector, hint) instead of cy.get(selector).
 * The hint is sent to Gemini when AI healing fires, helping it understand
 * what element we're looking for even if the selector has drifted.
 *
 * Zero changes required to any test file — healing is fully transparent.
 */
class LoginPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get emailInput() {
    return cy.selfHeal("#Email", "email address input field");
  }

  get passwordInput() {
    return cy.selfHeal("#Password₹", "password input field");
  }

  get loginButton() {
    return cy.selfHeal('input[type="submit"][value="Log in"]', "login submit button");
  }

  get rememberMeCheckbox() {
    return cy.selfHeal("#RememberMe-v1", "remember me checkbox");
  }

  get forgotPasswordLink() {
    return cy.selfHeal(".forgot-password a", "forgot password link");
  }

  get registerLink() {
    return cy.selfHeal(".register-button", "register button on login page");
  }

  get loginForm() {
    return cy.selfHeal(".customer-blocks", "login form container");
  }

  get validationSummary() {
    return cy.selfHeal(".validation-summary-errors", "login error validation summary");
  }

  get fieldValidationError() {
    return cy.selfHeal(".field-validation-error", "field level validation error message");
  }

  get returningCustomerTitle() {
    return cy.selfHeal(".returning-wrapper .title", "returning customer section heading");
  }

  get newCustomerTitle() {
    return cy.selfHeal(".new-wrapper .title", "new customer section heading");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate() {
    return this.visit("/login");
  }

  enterEmail(email) {
    this.emailInput.clear().type(email);
    return this;
  }

  enterPassword(password) {
    this.passwordInput.clear().type(password);
    return this;
  }

  clickLogin() {
    this.loginButton.click();
    return this;
  }

  checkRememberMe() {
    this.rememberMeCheckbox.check();
    return this;
  }

  clickForgotPassword() {
    this.forgotPasswordLink.click();
    return this;
  }

  clickRegister() {
    this.registerLink.click();
    return this;
  }

  // ─── Compound Actions ─────────────────────────────────────────────────────

  loginWith(email, password) {
    this.enterEmail(email);
    this.enterPassword(password);
    this.clickLogin();
    return this;
  }

  loginWithRememberMe(email, password) {
    this.enterEmail(email);
    this.enterPassword(password);
    this.checkRememberMe();
    this.clickLogin();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnLoginPage() {
    this.verifyUrl("/login");
    this.loginForm.should("be.visible");
    return this;
  }

  verifyLoginSuccess() {
    cy.url().should("not.include", "/login");
    this.headerLogoutLink.should("be.visible");
    return this;
  }

  verifyLoginFailure() {
    this.validationSummary.should("be.visible");
    return this;
  }

  verifyErrorMessage(text) {
    this.validationSummary.should("contain.text", text);
    return this;
  }

  verifyEmailFieldError() {
    this.fieldValidationError.should("be.visible");
    return this;
  }

  verifyReturningCustomerSection() {
    this.returningCustomerTitle.should("contain.text", "Returning Customer");
    return this;
  }

  verifyNewCustomerSection() {
    this.newCustomerTitle.should("contain.text", "New Customer");
    return this;
  }

  verifyForgotPasswordLinkVisible() {
    this.forgotPasswordLink.should("be.visible");
    return this;
  }
}

module.exports = new LoginPage();
