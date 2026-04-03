const BasePage = require("../BasePage");

/**
 * RegisterPage - Page Object for Registration functionality
 * URL: /register
 */
class RegisterPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get genderMaleRadio() {
    return cy.get("#gender-male");
  }

  get genderFemaleRadio() {
    return cy.get("#gender-female");
  }

  get firstNameInput() {
    return cy.get("#FirstName");
  }

  get lastNameInput() {
    return cy.get("#LastName");
  }

  get emailInput() {
    return cy.get("#Email");
  }

  // Note: Company and Newsletter fields are not present in this demo environment
  // They are conditionally checked before interacting

  get passwordInput() {
    return cy.get("#Password");
  }

  get confirmPasswordInput() {
    return cy.get("#ConfirmPassword");
  }

  get registerButton() {
    return cy.get("#register-button");
  }

  get validationSummary() {
    return cy.get(".validation-summary-errors");
  }

  get fieldValidationErrors() {
    return cy.get(".field-validation-error");
  }

  get registrationResultMessage() {
    return cy.get(".result");
  }

  get continueButton() {
    // class="button-1 register-continue-button"
    return cy.get(".register-continue-button");
  }

  get registerTitle() {
    return cy.get(".page-title");
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
        cy.get("#Company").clear().type(company);
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
          cy.get("#Newsletter").check();
        } else {
          cy.get("#Newsletter").uncheck();
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
    // The site shows field-level errors (e.g. "First name is required.")
    // NOT a .validation-summary-errors div for most validation failures
    cy.get(".field-validation-error").should("be.visible");
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
        cy.get(".field-validation-error").should("be.visible");
      } else {
        cy.get(".validation-summary-errors").should("be.visible");
      }
    });
    return this;
  }
}

module.exports = new RegisterPage();
