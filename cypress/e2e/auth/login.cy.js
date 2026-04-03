/**
 * Test Suite: Login Functionality
 * Tags: smoke, regression, auth
 */

import LoginPage from "../../support/pages/auth/LoginPage";
import HomePage from "../../support/pages/HomePage";

describe("Login Functionality", { tags: ["smoke", "auth"] }, () => {
  let users;

  before(() => {
    cy.fixture("users").then((data) => {
      users = data;
    });
  });

  beforeEach(() => {
    LoginPage.navigate();
    LoginPage.verifyOnLoginPage();
  });

  // ─── Positive Tests ────────────────────────────────────────────────────

  context("Positive Scenarios", () => {
    it("TC_LOGIN_001 - Should login successfully with valid credentials", () => {
      LoginPage.loginWith(
        Cypress.env("userEmail"),
        Cypress.env("userPassword")
      );
      LoginPage.verifyLoginSuccess();
      cy.url().should("include", "demowebshop.tricentis.com/");
      cy.url().should("not.include", "/login");
    });

    it("TC_LOGIN_002 - Should display My Account link after successful login", () => {
      LoginPage.loginWith(
        Cypress.env("userEmail"),
        Cypress.env("userPassword")
      );
      LoginPage.headerAccountLink.should("be.visible");
      LoginPage.headerLogoutLink.should("be.visible");
    });

    it("TC_LOGIN_003 - Should redirect to home page after login", () => {
      LoginPage.loginWith(
        Cypress.env("userEmail"),
        Cypress.env("userPassword")
      );
      HomePage.verifyOnHomePage();
    });

    it("TC_LOGIN_004 - Should hide Login link and show Logout after login", () => {
      LoginPage.loginWith(
        Cypress.env("userEmail"),
        Cypress.env("userPassword")
      );
      cy.get(".header-links").within(() => {
        cy.get("a[href='/logout']").should("be.visible");
        cy.get("a[href='/login']").should("not.exist");
      });
    });

    it("TC_LOGIN_005 - Should login with Remember Me checked", () => {
      LoginPage.loginWithRememberMe(
        Cypress.env("userEmail"),
        Cypress.env("userPassword")
      );
      LoginPage.verifyLoginSuccess();
    });
  });

  // ─── Negative Tests ────────────────────────────────────────────────────

  context("Negative Scenarios", () => {
    it("TC_LOGIN_006 - Should show error for invalid credentials", () => {
      LoginPage.loginWith(users.invalidUser.email, users.invalidUser.password);
      LoginPage.verifyLoginFailure();
      LoginPage.verifyErrorMessage("Login was unsuccessful");
    });

    it("TC_LOGIN_007 - Should show error for empty email and password", () => {
      LoginPage.clickLogin();
      LoginPage.verifyLoginFailure();
    });

    it("TC_LOGIN_008 - Should show validation for empty email field", () => {
      LoginPage.enterPassword(Cypress.env("userPassword"));
      LoginPage.clickLogin();
      LoginPage.verifyLoginFailure();
    });

    it("TC_LOGIN_009 - Should show validation for empty password field", () => {
      LoginPage.enterEmail(Cypress.env("userEmail"));
      LoginPage.clickLogin();
      LoginPage.verifyLoginFailure();
    });

    it("TC_LOGIN_010 - Should show error for non-existent email", () => {
      LoginPage.loginWith("nonexistent@test.com", "anypassword");
      LoginPage.verifyLoginFailure();
    });

    it("TC_LOGIN_011 - Should show error for wrong password", () => {
      LoginPage.loginWith(Cypress.env("userEmail"), "WrongPassword123");
      LoginPage.verifyLoginFailure();
      LoginPage.verifyErrorMessage("The credentials provided are incorrect");
    });
  });

  // ─── UI Validation Tests ───────────────────────────────────────────────

  context("UI Validation", () => {
    it("TC_LOGIN_012 - Should display login page elements correctly", () => {
      LoginPage.verifyReturningCustomerSection();
      LoginPage.verifyNewCustomerSection();
      LoginPage.verifyForgotPasswordLinkVisible();
      LoginPage.emailInput.should("be.visible");
      LoginPage.passwordInput.should("be.visible");
      LoginPage.loginButton.should("be.visible");
    });

    it("TC_LOGIN_013 - Should navigate to Forgot Password page", () => {
      LoginPage.clickForgotPassword();
      cy.url().should("include", "/passwordrecovery");
    });

    it("TC_LOGIN_014 - Should navigate to Register page from login", () => {
      LoginPage.clickRegister();
      cy.url().should("include", "/register");
    });

    it("TC_LOGIN_015 - Should have password field masked", () => {
      LoginPage.passwordInput.should("have.attr", "type", "password");
    });
  });

  // ─── Session Tests ─────────────────────────────────────────────────────

  context("Session Management", () => {
    it("TC_LOGIN_016 - Should logout successfully", () => {
      LoginPage.loginWith(
        Cypress.env("userEmail"),
        Cypress.env("userPassword")
      );
      LoginPage.logout();
      cy.url().should("include", "/");
      LoginPage.headerLoginLink.should("be.visible");
    });

    it("TC_LOGIN_017 - Should redirect to login when accessing protected page while logged out", () => {
      cy.visit("/customer/orders");
      cy.url().should("include", "/login");
    });
  });
});