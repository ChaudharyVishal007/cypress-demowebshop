/**
 * Test Suite: Customer Account Management
 * Tags: regression, account
 *
 * Layer Classification:
 *  - My Account Info (TC_ACCT_001–009):    e2e — updates user profile state; integration — field validation
 *  - Change Password (TC_ACCT_010–013):    e2e — updates auth credentials
 *  - My Addresses (TC_ACCT_014–017):       e2e — address book CRUD operations
 *  - My Orders (TC_ACCT_018–020):          integration — read-only history browsing
 *  - Account Navigation (TC_ACCT_021–025): integration — sidebar link verification
 */

import AccountPage from "../../support/pages/account/AccountPage";

describe("Account Management", { tags: ["regression", "account"] }, () => {

  beforeEach(() => {
    cy.allureEpic("User Management");
    cy.allureFeature("Account");
    cy.loginViaAPI(Cypress.env("userEmail"), Cypress.env("userPassword"));
  });

  // ─── My Account Info ───────────────────────────────────────────────────

  context("My Account Information", () => {
    beforeEach(() => {
      cy.allureStory("Account Info Management");
      cy.allureSeverity("normal");
      cy.allureLayer("e2e");
      AccountPage.navigateToInfo();
    });

    it("TC_ACCT_001 - Should navigate to My Account page", () => {
      cy.allureLayer("integration");
      AccountPage.verifyOnAccountPage();
    });

    it("TC_ACCT_002 - Should display account info form fields", () => {
      cy.allureSeverity("minor");
      cy.allureLayer("integration");
      AccountPage.firstNameInput.should("be.visible");
      AccountPage.lastNameInput.should("be.visible");
      AccountPage.emailInput.should("be.visible");
    });

    it("TC_ACCT_003 - Should update first name successfully", () => {
      AccountPage.updateFirstName("UpdatedFirst");
      AccountPage.saveInfo();
      cy.verifySuccess("The customer info has been updated successfully.");
    });

    it("TC_ACCT_004 - Should update last name successfully", () => {
      AccountPage.updateLastName("UpdatedLast");
      AccountPage.saveInfo();
      cy.verifySuccess("The customer info has been updated successfully.");
    });

    it("TC_ACCT_005 - Should update company name", () => {
      AccountPage.updateCompany("New Company Inc");
      AccountPage.saveInfo();
      cy.verifySuccess("The customer info has been updated successfully.");
    });

    it("TC_ACCT_006 - Should subscribe to newsletter from account page", () => {
      AccountPage.subscribeNewsletter(true);
      AccountPage.saveInfo();
      cy.verifySuccess("The customer info has been updated successfully.");
    });

    it("TC_ACCT_007 - Should unsubscribe from newsletter", () => {
      AccountPage.subscribeNewsletter(false);
      AccountPage.saveInfo();
      cy.verifySuccess("The customer info has been updated successfully.");
    });

    it("TC_ACCT_008 - Should show validation error for empty first name", () => {
      cy.allureLayer("integration");
      AccountPage.firstNameInput.clear();
      AccountPage.saveInfo();
      cy.get(".field-validation-error").should("exist");
    });

    it("TC_ACCT_009 - Should show validation error for invalid email format", () => {
      cy.allureLayer("integration");
      AccountPage.updateEmail("invalidemail");
      AccountPage.saveInfo();
      cy.get(".field-validation-error").should("exist");
    });
  });

  // ─── Change Password ───────────────────────────────────────────────────

  context("Change Password", () => {
    beforeEach(() => {
      cy.allureStory("Password Management");
      cy.allureSeverity("critical");
      cy.allureLayer("e2e");
      AccountPage.navigateToChangePassword();
    });

    it("TC_ACCT_010 - Should navigate to Change Password page", () => {
      cy.allureSeverity("minor");
      cy.allureLayer("integration");
      cy.url().should("include", "/customer/changepassword");
      AccountPage.oldPasswordInput.should("be.visible");
      AccountPage.newPasswordInput.should("be.visible");
    });

    it("TC_ACCT_011 - Should show error for wrong old password", () => {
      AccountPage.changePassword("WrongOldPassword", "NewPass@123");
      cy.get(".validation-summary-errors, .message-error").should("be.visible");
    });

    it("TC_ACCT_012 - Should show validation for empty fields", () => {
      cy.allureLayer("integration");
      AccountPage.changePasswordButton.click();
      cy.get(".field-validation-error, .validation-summary-errors").should("exist");
    });

    it("TC_ACCT_013 - Should show validation for short new password", () => {
      cy.allureLayer("integration");
      AccountPage.oldPasswordInput.type(Cypress.env("userPassword"));
      AccountPage.newPasswordInput.type("123");
      AccountPage.confirmNewPasswordInput.type("123");
      AccountPage.changePasswordButton.click();
      cy.get(".field-validation-error").should("exist");
    });
  });

  // ─── My Addresses ──────────────────────────────────────────────────────

  context("My Addresses", () => {
    beforeEach(() => {
      cy.allureStory("Address Book Management");
      cy.allureSeverity("normal");
      cy.allureLayer("e2e");
      AccountPage.navigateToAddresses();
    });

    it("TC_ACCT_014 - Should navigate to My Addresses page", () => {
      cy.allureSeverity("minor");
      cy.allureLayer("integration");
      cy.url().should("include", "/customer/addresses");
    });

    it("TC_ACCT_015 - Should display Add New Address button", () => {
      cy.allureSeverity("minor");
      cy.allureLayer("integration");
      AccountPage.addNewAddressButton.should("be.visible");
    });

    it("TC_ACCT_016 - Should navigate to Add New Address form", () => {
      cy.allureLayer("integration");
      AccountPage.clickAddNewAddress();
      cy.url().should("include", "/customer/addressadd");
    });

    it("TC_ACCT_017 - Should add a new address successfully", () => {
      AccountPage.clickAddNewAddress();
      cy.get("#Address_FirstName").type("Test");
      cy.get("#Address_LastName").type("Address");
      cy.get("#Address_Email").type("test@address.com");
      cy.get("#Address_CountryId").select("United States");
      cy.wait(500);
      cy.get("#Address_City").type("Los Angeles");
      cy.get("#Address_Address1").type("123 Test Street");
      cy.get("#Address_ZipPostalCode").type("90001");
      cy.get("#Address_PhoneNumber").type("5551234567");
      cy.get(".save-address-button").click();
      cy.url().should("include", "/customer/addresses");
    });
  });

  // ─── My Orders ─────────────────────────────────────────────────────────

  context("My Orders", () => {
    beforeEach(() => {
      cy.allureStory("Order History Browsing");
      cy.allureSeverity("normal");
      cy.allureLayer("integration");
      AccountPage.navigateToOrders();
    });

    it("TC_ACCT_018 - Should navigate to My Orders page", () => {
      cy.url().should("include", "/customer/orders");
    });

    it("TC_ACCT_019 - Should display orders list or no orders message", () => {
      cy.get("body").then(($body) => {
        if ($body.find(".order-item").length > 0) {
          AccountPage.verifyOrdersExist();
        } else {
          AccountPage.verifyNoOrders();
        }
      });
    });

    it("TC_ACCT_020 - Should navigate to order details when orders exist", () => {
      cy.get("body").then(($body) => {
        if ($body.find(".order-detail-button").length > 0) {
          AccountPage.clickOrderDetails(0);
          cy.url().should("include", "/customer/order/");
        } else {
          cy.log("No orders found - skipping");
        }
      });
    });
  });

  // ─── Account Navigation ────────────────────────────────────────────────

  context("Account Navigation Links", () => {
    beforeEach(() => {
      cy.allureStory("Account Sidebar Links");
      cy.allureSeverity("minor");
      cy.allureLayer("integration");
      AccountPage.navigateToInfo();
    });

    it("TC_ACCT_021 - Should have Customer Info sidebar link", () => {
      AccountPage.customerInfoLink.should("exist");
    });

    it("TC_ACCT_022 - Should have Orders sidebar link", () => {
      AccountPage.ordersLink.should("exist");
    });

    it("TC_ACCT_023 - Should have Addresses sidebar link", () => {
      AccountPage.addressesLink.should("exist");
    });

    it("TC_ACCT_024 - Should have Change Password sidebar link", () => {
      AccountPage.changePasswordLink.should("exist");
    });

    it("TC_ACCT_025 - Should navigate to Downloadable Products page", () => {
      AccountPage.navigateToDownloadableProducts();
      cy.url().should("include", "/customer/downloadableproducts");
    });
  });
});

