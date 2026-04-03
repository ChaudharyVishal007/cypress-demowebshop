/**
 * Test Suite: Registration Functionality
 * Tags: smoke, regression, auth
 *
 * Layer Classification:
 *  - Positive Scenarios (TC_REG_001–006): e2e — full registration flow touching auth/user service
 *  - Negative Scenarios (TC_REG_007–015): e2e — server-side field & business rule validation
 *  - UI Validation (TC_REG_016–018):      integration — DOM element assertion, no server state change
 */

import RegisterPage from "../../support/pages/auth/RegisterPage";
import LoginPage from "../../support/pages/auth/LoginPage";

describe("Registration Functionality", { tags: ["smoke", "auth"] }, () => {
  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    RegisterPage.navigate();
    RegisterPage.verifyOnRegisterPage();
    cy.allureEpic("Authentication");
    cy.allureFeature("Registration");
  });

  // ─── Positive Tests ────────────────────────────────────────────────────

  context("Positive Scenarios", () => {
    beforeEach(() => {
      cy.allureStory("Successful Registration");
      cy.allureSeverity("critical");
      cy.allureLayer("e2e");
    });

    it("TC_REG_001 - Should register a new user successfully", () => {
      const timestamp = Date.now();
      const userData = {
        firstName: "Auto",
        lastName: "User",
        email: `autouser_${timestamp}@test.com`,
        password: "Test@1234",
        confirmPassword: "Test@1234",
      };
      RegisterPage.registerUser(userData);
      RegisterPage.verifyRegistrationSuccess();
    });

    it("TC_REG_002 - Should register with gender Male selected", () => {
      const timestamp = Date.now();
      RegisterPage.selectGenderMale();
      RegisterPage.enterFirstName("John");
      RegisterPage.enterLastName("Doe");
      RegisterPage.enterEmail(`john_${timestamp}@test.com`);
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      RegisterPage.verifyRegistrationSuccess();
    });

    it("TC_REG_003 - Should register with gender Female selected", () => {
      const timestamp = Date.now();
      RegisterPage.selectGenderFemale();
      RegisterPage.enterFirstName("Jane");
      RegisterPage.enterLastName("Smith");
      RegisterPage.enterEmail(`jane_${timestamp}@test.com`);
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      RegisterPage.verifyRegistrationSuccess();
    });

    it("TC_REG_004 - Should login successfully after registration", () => {
      const timestamp = Date.now();
      const email = `newuser_${timestamp}@test.com`;
      const password = "NewPass@123";

      RegisterPage.registerUser({
        firstName: "New",
        lastName: "Tester",
        email,
        password,
      });
      RegisterPage.verifyRegistrationSuccess();
      RegisterPage.clickContinue();

      // Logout and login with new credentials
      cy.logout();
      LoginPage.navigate();
      LoginPage.loginWith(email, password);
      LoginPage.verifyLoginSuccess();
    });

    it("TC_REG_005 - Should register with newsletter subscription", () => {
      const timestamp = Date.now();
      RegisterPage.enterFirstName("Newsletter");
      RegisterPage.enterLastName("User");
      RegisterPage.enterEmail(`newsletter_${timestamp}@test.com`);
      RegisterPage.toggleNewsletter(true);
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      RegisterPage.verifyRegistrationSuccess();
    });

    it("TC_REG_006 - Should register with company name", () => {
      const timestamp = Date.now();
      RegisterPage.enterFirstName("Corp");
      RegisterPage.enterLastName("User");
      RegisterPage.enterEmail(`corp_${timestamp}@test.com`);
      RegisterPage.enterCompany("Test Corporation Ltd");
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      RegisterPage.verifyRegistrationSuccess();
    });
  });

  // ─── Negative Tests ────────────────────────────────────────────────────

  context("Negative Scenarios", () => {
    beforeEach(() => {
      cy.allureStory("Registration Validation Errors");
      cy.allureSeverity("normal");
      cy.allureLayer("e2e");
    });

    it("TC_REG_007 - Should show validation errors for empty form", () => {
      RegisterPage.clickRegister();
      RegisterPage.verifyValidationErrors();
    });

    it("TC_REG_008 - Should show error for missing first name", () => {
      RegisterPage.enterLastName("Doe");
      RegisterPage.enterEmail("test@test.com");
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      // Validation summary or field error should be visible
      RegisterPage.verifyValidationErrors();
    });

    it("TC_REG_009 - Should show error for missing last name", () => {
      RegisterPage.enterFirstName("John");
      RegisterPage.enterEmail("test@test.com");
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      // Validation summary or field error should be visible
      RegisterPage.verifyValidationErrors();
    });

    it("TC_REG_010 - Should show error for missing email", () => {
      RegisterPage.enterFirstName("John");
      RegisterPage.enterLastName("Doe");
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      RegisterPage.verifyValidationErrors();
    });

    it("TC_REG_011 - Should show error for invalid email format", () => {
      RegisterPage.enterFirstName("John");
      RegisterPage.enterLastName("Doe");
      RegisterPage.enterEmail("invalidemail");
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      RegisterPage.verifyValidationErrors();
    });

    it("TC_REG_012 - Should show error for password mismatch", () => {
      const timestamp = Date.now();
      RegisterPage.enterFirstName("John");
      RegisterPage.enterLastName("Doe");
      RegisterPage.enterEmail(`mismatch_${timestamp}@test.com`);
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("DifferentPass@123");
      RegisterPage.clickRegister();
      RegisterPage.verifyPasswordMismatchError();
    });

    it("TC_REG_013 - Should show error for password too short", () => {
      const timestamp = Date.now();
      RegisterPage.enterFirstName("John");
      RegisterPage.enterLastName("Doe");
      RegisterPage.enterEmail(`shortpass_${timestamp}@test.com`);
      RegisterPage.enterPassword("123");
      RegisterPage.enterConfirmPassword("123");
      RegisterPage.clickRegister();
      RegisterPage.verifyValidationErrors();
    });

    it("TC_REG_014 - Should show error for already registered email", () => {
      RegisterPage.enterFirstName("Existing");
      RegisterPage.enterLastName("User");
      RegisterPage.enterEmail(Cypress.env("userEmail")); // Use existing email
      RegisterPage.enterPassword("Test@1234");
      RegisterPage.enterConfirmPassword("Test@1234");
      RegisterPage.clickRegister();
      RegisterPage.verifyEmailAlreadyExists();
    });

    it("TC_REG_015 - Should show error for missing password", () => {
      const timestamp = Date.now();
      RegisterPage.enterFirstName("John");
      RegisterPage.enterLastName("Doe");
      RegisterPage.enterEmail(`nopass_${timestamp}@test.com`);
      RegisterPage.clickRegister();
      RegisterPage.verifyValidationErrors();
    });
  });

  // ─── UI Validation ─────────────────────────────────────────────────────

  context("UI Validation", () => {
    beforeEach(() => {
      cy.allureStory("Registration Form UI Elements");
      cy.allureSeverity("minor");
      cy.allureLayer("integration");
    });

    it("TC_REG_016 - Should display all registration form elements", () => {
      RegisterPage.genderMaleRadio.should("exist");
      RegisterPage.genderFemaleRadio.should("exist");
      RegisterPage.firstNameInput.should("be.visible");
      RegisterPage.lastNameInput.should("be.visible");
      RegisterPage.emailInput.should("be.visible");
      RegisterPage.passwordInput.should("be.visible");
      RegisterPage.confirmPasswordInput.should("be.visible");
      RegisterPage.registerButton.should("be.visible");
    });

    it("TC_REG_017 - Should have Continue button after successful registration", () => {
      const timestamp = Date.now();
      RegisterPage.registerUser({
        firstName: "Button",
        lastName: "Test",
        email: `btntest_${timestamp}@test.com`,
        password: "Test@1234",
      });
      RegisterPage.continueButton.should("be.visible");
    });

    it("TC_REG_018 - Should navigate to home page after clicking Continue", () => {
      const timestamp = Date.now();
      RegisterPage.registerUser({
        firstName: "Continue",
        lastName: "Nav",
        email: `continue_${timestamp}@test.com`,
        password: "Test@1234",
      });
      RegisterPage.clickContinue();
      // Use include to handle http/https redirect from the site
      cy.url().should("include", "demowebshop.tricentis.com/");
      cy.url().should("not.include", "/register");
    });
  });
});
