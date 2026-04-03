const BasePage = require("../BasePage");

/**
 * LoginPage - Page Object for Login functionality
 * URL: /login
 */
class LoginPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get emailInput() {
    return cy.get("#Email");
  }

  get passwordInput() {
    return cy.get("#Password");
  }

  get loginButton() {
    return cy.get(".login-button");
  }

  get rememberMeCheckbox() {
    return cy.get("#RememberMe");
  }

  get forgotPasswordLink() {
    return cy.get(".forgot-password a");
  }

  get registerLink() {
    return cy.get(".register-button");
  }

  get loginForm() {
    return cy.get(".customer-blocks");
  }

  get validationSummary() {
    return cy.get(".validation-summary-errors");
  }

  get fieldValidationError() {
    return cy.get(".field-validation-error");
  }

  get returningCustomerTitle() {
    return cy.get(".returning-wrapper .title");
  }

  get newCustomerTitle() {
    return cy.get(".new-wrapper .title");
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
