const BasePage = require("./BasePage");

/**
 * HomePage - Page Object for the Home Page
 * URL: /
 */
class HomePage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get heroBanners() {
    return cy.get(".nivo-slider");
  }

  get featuredProducts() {
    return cy.get(".home-page-product-grid .product-item");
  }

  get featuredProductsTitle() {
    return cy.get(".home-page-product-grid .title");
  }

  get categoryMenuItems() {
    return cy.get(".top-menu li a");
  }

  get pollBlock() {
    return cy.get(".block-poll");
  }

  get communityPollQuestion() {
    return cy.get(".poll-block .question");
  }

  get communityPollOptions() {
    return cy.get(".poll-block .inputs input[type='radio']");
  }

  get pollVoteButton() {
    return cy.get(".poll-block .vote-poll-button");
  }

  get newsletterEmail() {
    return cy.get("#newsletter-email");
  }

  get newsletterSubscribeBtn() {
    return cy.get("#newsletter-subscribe-button");
  }

  get footer() {
    return cy.get(".footer");
  }

  get footerLinks() {
    return cy.get(".footer a");
  }

  get popularTagsBlock() {
    return cy.get(".block-popular-tags");
  }

  get recentlyViewedBlock() {
    return cy.get(".block-recently-viewed-products");
  }

  get siteLogoImg() {
    return cy.get(".header-logo img");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate() {
    return this.visit("/");
  }

  clickOnFeaturedProduct(index = 0) {
    this.featuredProducts.eq(index).find(".product-title a").click();
    return this;
  }

  getFeaturedProductName(index = 0) {
    return this.featuredProducts.eq(index).find(".product-title a");
  }

  getFeaturedProductPrice(index = 0) {
    return this.featuredProducts.eq(index).find(".price.actual-price");
  }

  clickCategoryMenu(categoryName) {
    this.categoryMenuItems.contains(categoryName).click();
    return this;
  }

  subscribeToNewsletter(email) {
    this.newsletterEmail.clear().type(email);
    this.newsletterSubscribeBtn.click();
    return this;
  }

  voteInPoll(optionIndex = 0) {
    this.communityPollOptions.eq(optionIndex).check();
    this.pollVoteButton.click();
    return this;
  }

  clickLogo() {
    this.siteLogoImg.click();
    return this;
  }

  addFeaturedProductToCart(index = 0) {
    this.featuredProducts.eq(index).find(".add-to-cart-button").click();
    return this;
  }

  addFeaturedProductToWishlist(index = 0) {
    this.featuredProducts.eq(index).find(".add-to-wishlist-button").click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnHomePage() {
    // Use include to handle http/https redirect
    cy.url().should("include", "demowebshop.tricentis.com/");
    cy.url().should("not.include", "/login");
    return this;
  }

  verifyFeaturedProductsVisible() {
    this.featuredProducts.should("have.length.greaterThan", 0);
    return this;
  }

  verifyFeaturedProductsTitle() {
    this.featuredProductsTitle.should("be.visible");
    return this;
  }

  verifyLogoVisible() {
    this.siteLogoImg.should("be.visible");
    return this;
  }

  verifyCategoryMenuVisible() {
    this.categoryMenuItems.should("have.length.greaterThan", 0);
    return this;
  }

  verifyFooterVisible() {
    this.footer.should("be.visible");
    return this;
  }

  verifyNewsletterSubscriptionResult(message) {
    cy.get(".newsletter-result").should("contain.text", message);
    return this;
  }
}

module.exports = new HomePage();
