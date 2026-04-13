/**
 * BasePage - Parent class for all Page Objects
 * Contains common methods shared across all pages
 */
class BasePage {
  // ─── Navigation ───────────────────────────────────────────────────────────

  visit(path = "/") {
    cy.visit(path);
    this.waitForPageLoad();
    return this;
  }

  waitForPageLoad() {
    cy.document().its("readyState").should("eq", "complete");
    return this;
  }

  // ─── Element Interactions ─────────────────────────────────────────────────
  // All methods use cy.selfHeal() which transparently applies the healing flow:
  //   Original selector → Cache → Heuristics → Gemini AI → Error

  getElement(selector, hint) {
    return cy.selfHeal(selector, hint);
  }

  clickElement(selector, hint) {
    cy.selfHeal(selector, hint).should("be.visible").click();
    return this;
  }

  typeInField(selector, text, options = {}, hint) {
    cy.selfHeal(selector, hint).should("be.visible").clear().type(text, options);
    return this;
  }

  selectDropdown(selector, value, hint) {
    cy.selfHeal(selector, hint).select(value);
    return this;
  }

  checkCheckbox(selector, hint) {
    cy.selfHeal(selector, hint).check();
    return this;
  }

  uncheckCheckbox(selector, hint) {
    cy.selfHeal(selector, hint).uncheck();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyUrl(path) {
    cy.url().should("include", path);
    return this;
  }

  verifyText(selector, text) {
    cy.get(selector).should("contain.text", text);
    return this;
  }

  verifyVisible(selector) {
    cy.get(selector).should("be.visible");
    return this;
  }

  verifyNotVisible(selector) {
    cy.get(selector).should("not.be.visible");
    return this;
  }

  verifyExists(selector) {
    cy.get(selector).should("exist");
    return this;
  }

  verifyNotExists(selector) {
    cy.get(selector).should("not.exist");
    return this;
  }

  // ─── Header Common Elements ───────────────────────────────────────────────

  get headerCartLink() {
    return cy.get(".cart-qty");
  }

  get headerWishlistLink() {
    return cy.get(".wishlist-qty");
  }

  get headerSearchBox() {
    return cy.get("#small-searchterms");
  }

  get headerSearchBtn() {
    return cy.get(".search-box button[type='submit']");
  }

  get headerLoginLink() {
    // site uses class 'ico-login' on the login header link
    return cy.get(".header-links a.ico-login, .header-links a[href='/login']").first();
  }

  get headerRegisterLink() {
    // site uses class 'ico-register' or href
    return cy.get(".header-links a.ico-register, .header-links a[href='/register']").first();
  }

  get headerLogoutLink() {
    // site uses class 'ico-logout' on the logout header link
    return cy.get(".header-links a.ico-logout, .header-links a[href='/logout']").first();
  }

  get headerAccountLink() {
    // site uses class 'account' on the my-account header link
    return cy.get(".header-links a.account, .header-links a[href='/customer/info']").first();
  }

  get topMenuItems() {
    return cy.get(".top-menu > li > a");
  }

  // ─── Header Actions ───────────────────────────────────────────────────────

  navigateToLogin() {
    this.headerLoginLink.click();
    return this;
  }

  navigateToRegister() {
    this.headerRegisterLink.click();
    return this;
  }

  navigateToCart() {
    this.headerCartLink.click();
    return this;
  }

  navigateToWishlist() {
    this.headerWishlistLink.click();
    return this;
  }

  logout() {
    this.headerLogoutLink.click();
    return this;
  }

  searchFor(term) {
    this.headerSearchBox.clear().type(term);
    this.headerSearchBtn.click();
    return this;
  }

  getCartCount() {
    return this.headerCartLink;
  }

  getWishlistCount() {
    return this.headerWishlistLink;
  }

  // ─── Notifications ────────────────────────────────────────────────────────

  getSuccessNotification() {
    return cy.get(".bar-notification.success");
  }

  getErrorNotification() {
    return cy.get(".bar-notification.error");
  }

  verifySuccessMessage(text) {
    this.getSuccessNotification().should("be.visible").and("contain.text", text);
    return this;
  }

  closeNotification() {
    cy.get(".bar-notification .close").click();
    return this;
  }

  // ─── Utility ──────────────────────────────────────────────────────────────

  scrollToTop() {
    cy.scrollTo("top");
    return this;
  }

  scrollToBottom() {
    cy.scrollTo("bottom");
    return this;
  }

  waitFor(ms) {
    cy.wait(ms);
    return this;
  }

  log(message) {
    cy.log(message);
    return this;
  }
}

module.exports = BasePage;
