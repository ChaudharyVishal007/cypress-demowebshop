const BasePage = require("../BasePage");

/**
 * RegisterPage - Page Object for Registration functionality
 * URL: /register
 *
 * All primary selectors use cy.selfHeal(selector, hint) for automatic AI healing.
 */
class RegisterPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get genderMaleRadio() {
    return cy.selfHeal("#gender-male", "male gender radio button");
  }

  get genderFemaleRadio() {
    return cy.selfHeal("#gender-female", "female gender radio button");
  }

  get firstNameInput() {
    return cy.selfHeal("#FirstName", "first name input field");
  }

  get lastNameInput() {
    return cy.selfHeal("#LastName", "last name input field");
  }

  get emailInput() {
    return cy.selfHeal("#Email", "email address input field");
  }

  get passwordInput() {
    return cy.selfHeal("#Password", "password input field");
  }

  get confirmPasswordInput() {
    return cy.selfHeal("#ConfirmPassword", "confirm password input field");
  }

  get registerButton() {
    return cy.selfHeal("#register-button", "register submit button");
  }

  get validationSummary() {
    return cy.selfHeal(".validation-summary-errors", "registration validation error summary");
  }

  get fieldValidationErrors() {
    return cy.selfHeal(".field-validation-error", "field level validation error messages");
  }

  get registrationResultMessage() {
    return cy.selfHeal(".result", "registration success result message");
  }

  get continueButton() {
    return cy.selfHeal(".register-continue-button", "register continue button");
  }

  get registerTitle() {
    return cy.selfHeal(".page-title", "register page title");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate() {
    return this.visit("/register");
  }

  selectGenderMale() {
    this.genderMaleRadio.check();
    return this;
  }

  selectGenderFemale() {
    this.genderFemaleRadio.check();
    return this;
  }

  enterFirstName(firstName) {
    this.firstNameInput.clear().type(firstName);
    return this;
  }

  enterLastName(lastName) {
    this.lastNameInput.clear().type(lastName);
    return this;
  }

  enterEmail(email) {
    this.emailInput.clear().type(email);
    return this;
  }

  enterCompany(company) {
    // Company field may not exist on all environments — skip gracefully
    cy.get("body").then(($body) => {
      if ($body.find("#Company").length > 0) {
        cy.selfHeal("#Company", "company name input field").clear().type(company);
      } else {
        cy.log("⚠️ Company field not found on this environment — skipping");
      }
    });
    return this;
  }

  toggleNewsletter(subscribe = true) {
    // Newsletter checkbox may not exist on all environments — skip gracefully
    cy.get("body").then(($body) => {
      if ($body.find("#Newsletter").length > 0) {
        if (subscribe) {
          cy.selfHeal("#Newsletter", "newsletter subscription checkbox").check();
        } else {
          cy.selfHeal("#Newsletter", "newsletter subscription checkbox").uncheck();
        }
      } else {
        cy.log("⚠️ Newsletter checkbox not found on this environment — skipping");
      }
    });
    return this;
  }

  enterPassword(password) {
    this.passwordInput.clear().type(password);
    return this;
  }

  enterConfirmPassword(password) {
    this.confirmPasswordInput.clear().type(password);
    return this;
  }

  clickRegister() {
    this.registerButton.click();
    return this;
  }

  clickContinue() {
    this.continueButton.click();
    return this;
  }

  // ─── Compound Actions ─────────────────────────────────────────────────────

  fillRegistrationForm(userData) {
    if (userData.gender === "male") this.selectGenderMale();
    if (userData.gender === "female") this.selectGenderFemale();
    this.enterFirstName(userData.firstName);
    this.enterLastName(userData.lastName);
    this.enterEmail(userData.email);
    if (userData.company) this.enterCompany(userData.company);
    this.enterPassword(userData.password);
    this.enterConfirmPassword(userData.confirmPassword || userData.password);
    return this;
  }

  registerUser(userData) {
    this.fillRegistrationForm(userData);
    this.clickRegister();
    return this;
  }

  registerWithUniqueEmail(userData) {
    const timestamp = Date.now();
    const uniqueEmail = `testuser_${timestamp}@automation.com`;
    const updatedData = { ...userData, email: uniqueEmail };
    this.registerUser(updatedData);
    return { ...updatedData };
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnRegisterPage() {
    this.verifyUrl("/register");
    this.registerButton.should("be.visible");
    return this;
  }

  verifyRegistrationSuccess() {
    this.registrationResultMessage
      .should("be.visible")
      .and("contain.text", "Your registration completed");
    return this;
  }

  verifyValidationErrors() {
    this.fieldValidationErrors.should("be.visible");
    return this;
  }

  verifyFieldError(text) {
    this.fieldValidationErrors.should("contain.text", text);
    return this;
  }

  verifyEmailAlreadyExists() {
    this.validationSummary
      .should("be.visible")
      .and("contain.text", "already exists");
    return this;
  }

  verifyPasswordMismatchError() {
    // The site shows field-level error for password mismatch
    // Fallback: also check validation summary
    cy.get("body").then(($body) => {
      if ($body.find(".field-validation-error").length > 0) {
        this.fieldValidationErrors.should("be.visible");
      } else {
        this.validationSummary.should("be.visible");
      }
    });
    return this;
  }
}

module.exports = new RegisterPage();
