const BasePage = require("../BasePage");

/**
 * ProductPage - Page Object for individual Product Detail Pages
 */
class ProductPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get productTitle() {
    return cy.get(".product-name h1");
  }

  get productPrice() {
    return cy.get(".price-value");
  }

  get productDescription() {
    return cy.get(".full-description");
  }

  get productImages() {
    return cy.get(".picture img");
  }

  get productSku() {
    return cy.get(".sku .value");
  }

  get addToCartButton() {
    return cy.get("#add-to-cart-button-\\d+, .add-to-cart-button, button[id^='add-to-cart']");
  }

  get addToWishlistButton() {
    return cy.get(".add-to-wishlist-button");
  }

  get addToCompareButton() {
    return cy.get(".add-to-compare-list-button");
  }

  get quantityInput() {
    return cy.get("input.qty-input");
  }

  get productReviewsTab() {
    return cy.get("a[href='#tab-product-reviews']");
  }

  get writeReviewLink() {
    return cy.get(".write-review");
  }

  get reviewRatingStars() {
    return cy.get(".rating-options input[type='radio']");
  }

  get reviewTitle() {
    return cy.get("#AddNewReview_Title");
  }

  get reviewText() {
    return cy.get("#AddNewReview_ReviewText");
  }

  get submitReviewButton() {
    return cy.get(".write-review .button-1");
  }

  get reviewSuccessMessage() {
    return cy.get(".result");
  }

  get shareLinks() {
    return cy.get(".addthis_toolbox");
  }

  get emailFriendButton() {
    return cy.get(".email-a-friend-button");
  }

  get productTags() {
    return cy.get(".product-tags-list a");
  }

  get productSpecifications() {
    return cy.get(".product-specs-box");
  }

  get availableOptions() {
    return cy.get(".product-variant-line");
  }

  get colorOptions() {
    return cy.get(".color-squares li");
  }

  get sizeSelect() {
    return cy.get("select[name='product_attribute_\\d+']").first();
  }

  get relatedProducts() {
    return cy.get(".related-products-grid .product-item");
  }

  get alsoViewedProducts() {
    return cy.get(".also-viewed-products-grid .product-item");
  }

  get breadcrumb() {
    return cy.get(".breadcrumb");
  }

  get stockInfo() {
    return cy.get(".stock .value");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate(productUrl) {
    return this.visit(productUrl);
  }

  setQuantity(qty) {
    this.quantityInput.clear().type(qty.toString());
    return this;
  }

  clickAddToCart() {
    cy.get("input[value='Add to cart'], .add-to-cart-button").first().click();
    return this;
  }

  clickAddToWishlist() {
    this.addToWishlistButton.click();
    return this;
  }

  clickAddToCompare() {
    this.addToCompareButton.click();
    return this;
  }

  selectProductAttribute(attributeLabel, value) {
    cy.contains(".product-variant-line", attributeLabel)
      .find("select")
      .select(value);
    return this;
  }

  clickWriteReview() {
    this.writeReviewLink.click();
    return this;
  }

  submitReview(rating, title, text) {
    this.reviewRatingStars.eq(rating - 1).check();
    this.reviewTitle.clear().type(title);
    this.reviewText.clear().type(text);
    this.submitReviewButton.click();
    return this;
  }

  clickEmailFriend() {
    this.emailFriendButton.click();
    return this;
  }

  clickProductTag(index = 0) {
    this.productTags.eq(index).click();
    return this;
  }

  clickRelatedProduct(index = 0) {
    this.relatedProducts.eq(index).find(".product-title a").click();
    return this;
  }

  // Gift card specific
  enterGiftCardRecipientName(name) {
    cy.get("#giftcard_\\d+_RecipientName, input[name*='RecipientName']").type(name);
    return this;
  }

  enterGiftCardRecipientEmail(email) {
    cy.get("input[name*='RecipientEmail']").type(email);
    return this;
  }

  enterGiftCardSenderName(name) {
    cy.get("input[name*='SenderName']").type(name);
    return this;
  }

  enterGiftCardMessage(msg) {
    cy.get("textarea[name*='Message']").type(msg);
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyProductTitle(title) {
    this.productTitle.should("contain.text", title);
    return this;
  }

  verifyProductPrice(price) {
    this.productPrice.should("contain.text", price.toString());
    return this;
  }

  verifyAddToCartVisible() {
    cy.get("input[value='Add to cart'], .add-to-cart-button")
      .first()
      .should("be.visible");
    return this;
  }

  verifyProductImageVisible() {
    this.productImages.should("be.visible");
    return this;
  }

  verifyReviewSubmitted() {
    this.reviewSuccessMessage
      .should("be.visible")
      .and("contain.text", "review");
    return this;
  }

  verifyRelatedProductsVisible() {
    this.relatedProducts.should("have.length.greaterThan", 0);
    return this;
  }

  verifyBreadcrumbVisible() {
    this.breadcrumb.should("be.visible");
    return this;
  }

  verifyInStock() {
    this.stockInfo.should("contain.text", "In stock");
    return this;
  }
}

module.exports = new ProductPage();
