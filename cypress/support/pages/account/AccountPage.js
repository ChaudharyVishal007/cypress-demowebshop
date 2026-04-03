const BasePage = require("../BasePage");

/**
 * AccountPage - Page Object for Customer Account management
 * URL: /customer/info
 */
class AccountPage extends BasePage {
  // ─── My Account Info Selectors ────────────────────────────────────────────

  get genderMale() {
    return cy.get("#gender-male");
  }

  get genderFemale() {
    return cy.get("#gender-female");
  }

  get firstNameInput() {
    return cy.get("#FirstName");
  }

  get lastNameInput() {
    return cy.get("#LastName");
  }

  get dateOfBirthDay() {
    return cy.get(".date-of-birth select").eq(0);
  }

  get dateOfBirthMonth() {
    return cy.get(".date-of-birth select").eq(1);
  }

  get dateOfBirthYear() {
    return cy.get(".date-of-birth select").eq(2);
  }

  get emailInput() {
    return cy.get("#Email");
  }

  get companyInput() {
    return cy.get("#Company");
  }

  get newsletterCheckbox() {
    return cy.get("#Newsletter");
  }

  get saveInfoButton() {
    return cy.get(".save-customer-info-button");
  }

  // ─── Change Password Selectors ────────────────────────────────────────────

  get oldPasswordInput() {
    return cy.get("#OldPassword");
  }

  get newPasswordInput() {
    return cy.get("#NewPassword");
  }

  get confirmNewPasswordInput() {
    return cy.get("#ConfirmNewPassword");
  }

  get changePasswordButton() {
    return cy.get(".change-password-button");
  }

  get passwordChangedSuccess() {
    return cy.get(".bar-notification.success");
  }

  // ─── My Addresses Selectors ───────────────────────────────────────────────

  get addNewAddressButton() {
    return cy.get(".add-address-button");
  }

  get addressItems() {
    return cy.get(".address-item");
  }

  get addressDeleteButtons() {
    return cy.get(".delete-address-button");
  }

  get addressEditButtons() {
    return cy.get(".edit-address-button");
  }

  // ─── My Orders Selectors ──────────────────────────────────────────────────

  get orderItems() {
    return cy.get(".order-item");
  }

  get orderNumbers() {
    return cy.get(".order-number");
  }

  get orderStatuses() {
    return cy.get(".order-status");
  }

  get orderDetailButtons() {
    return cy.get(".order-detail-button");
  }

  // ─── Navigation Links ─────────────────────────────────────────────────────

  get customerInfoLink() {
    return cy.get(".customer-info-link");
  }

  get addressesLink() {
    return cy.get(".customer-addresses-link");
  }

  get ordersLink() {
    return cy.get(".customer-orders-link");
  }

  get downloadableProductsLink() {
    return cy.get(".customer-downloadable-products-link");
  }

  get backInStockSubscriptionsLink() {
    return cy.get(".customer-backinstock-subscriptions-link");
  }

  get changePasswordLink() {
    return cy.get(".change-password-link");
  }

  get avatarLink() {
    return cy.get(".customer-avatar-link");
  }

  get rewardPointsLink() {
    return cy.get(".reward-points-link");
  }

  get returnRequestsLink() {
    return cy.get(".return-requests-link");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigateToInfo() {
    return this.visit("/customer/info");
  }

  navigateToOrders() {
    return this.visit("/customer/orders");
  }

  navigateToAddresses() {
    return this.visit("/customer/addresses");
  }

  navigateToChangePassword() {
    return this.visit("/customer/changepassword");
  }

  navigateToDownloadableProducts() {
    return this.visit("/customer/downloadableproducts");
  }

  updateFirstName(name) {
    this.firstNameInput.clear().type(name);
    return this;
  }

  updateLastName(name) {
    this.lastNameInput.clear().type(name);
    return this;
  }

  updateEmail(email) {
    this.emailInput.clear().type(email);
    return this;
  }

  updateCompany(company) {
    this.companyInput.clear().type(company);
    return this;
  }

  subscribeNewsletter(subscribe = true) {
    if (subscribe) {
      this.newsletterCheckbox.check();
    } else {
      this.newsletterCheckbox.uncheck();
    }
    return this;
  }

  saveInfo() {
    this.saveInfoButton.click();
    return this;
  }

  changePassword(oldPassword, newPassword) {
    this.oldPasswordInput.clear().type(oldPassword);
    this.newPasswordInput.clear().type(newPassword);
    this.confirmNewPasswordInput.clear().type(newPassword);
    this.changePasswordButton.click();
    return this;
  }

  clickOrderDetails(index = 0) {
    this.orderDetailButtons.eq(index).click();
    return this;
  }

  clickEditAddress(index = 0) {
    this.addressEditButtons.eq(index).click();
    return this;
  }

  clickDeleteAddress(index = 0) {
    this.addressDeleteButtons.eq(index).click();
    return this;
  }

  clickAddNewAddress() {
    this.addNewAddressButton.click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnAccountPage() {
    this.verifyUrl("/customer/info");
    return this;
  }

  verifyInfoSaved() {
    this.getSuccessNotification().should("be.visible");
    return this;
  }

  verifyPasswordChanged() {
    this.passwordChangedSuccess.should("contain.text", "Password was changed");
    return this;
  }

  verifyOrdersExist() {
    this.orderItems.should("have.length.greaterThan", 0);
    return this;
  }

  verifyNoOrders() {
    cy.get(".no-data").should("be.visible");
    return this;
  }

  verifyAddressesExist() {
    this.addressItems.should("have.length.greaterThan", 0);
    return this;
  }

  verifyFirstName(name) {
    this.firstNameInput.should("have.value", name);
    return this;
  }

  verifyEmail(email) {
    this.emailInput.should("have.value", email);
    return this;
  }
}

module.exports = new AccountPage();
