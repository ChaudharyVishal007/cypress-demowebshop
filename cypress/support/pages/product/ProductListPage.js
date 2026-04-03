const BasePage = require("../BasePage");

/**
 * ProductListPage - Page Object for Category / Listing Pages
 */
class ProductListPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get pageTitle() {
    return cy.get(".page-title h1");
  }

  get productItems() {
    return cy.get(".product-item");
  }

  get productTitles() {
    return cy.get(".product-title a");
  }

  get productPrices() {
    return cy.get(".price.actual-price");
  }

  get addToCartButtons() {
    return cy.get(".add-to-cart-button");
  }

  get addToWishlistButtons() {
    return cy.get(".add-to-wishlist-button");
  }

  get addToCompareButtons() {
    return cy.get(".add-to-compare-list-button");
  }

  get sortBySelect() {
    return cy.get("#products-orderby");
  }

  get displayPerPageSelect() {
    return cy.get("#products-pagesize");
  }

  get viewModeList() {
    return cy.get(".viewmode-icon.list");
  }

  get viewModeGrid() {
    return cy.get(".viewmode-icon.grid");
  }

  get pagerLinks() {
    return cy.get(".pager li a");
  }

  get nextPageLink() {
    return cy.get(".pager .next-page");
  }

  get prevPageLink() {
    return cy.get(".pager .previous-page");
  }

  get filterByPriceSlider() {
    return cy.get(".price-range-filter");
  }

  get filterBySpecification() {
    return cy.get(".block-category-navigation");
  }

  get subCategoryItems() {
    return cy.get(".category-grid .category-item");
  }

  get breadcrumb() {
    return cy.get(".breadcrumb");
  }

  get noResultsMessage() {
    return cy.get(".no-result");
  }

  get productCount() {
    return cy.get(".item-box").its("length");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate(categoryUrl) {
    return this.visit(categoryUrl);
  }

  sortBy(option) {
    this.sortBySelect.select(option);
    return this;
  }

  setProductsPerPage(count) {
    this.displayPerPageSelect.select(count.toString());
    return this;
  }

  switchToListView() {
    this.viewModeList.click();
    return this;
  }

  switchToGridView() {
    this.viewModeGrid.click();
    return this;
  }

  clickNextPage() {
    this.nextPageLink.click();
    return this;
  }

  clickPrevPage() {
    this.prevPageLink.click();
    return this;
  }

  clickOnProduct(index = 0) {
    this.productTitles.eq(index).click();
    return this;
  }

  getProductNameAt(index = 0) {
    return this.productTitles.eq(index);
  }

  getProductPriceAt(index = 0) {
    return this.productPrices.eq(index);
  }

  addToCartAt(index = 0) {
    this.addToCartButtons.eq(index).click();
    return this;
  }

  addToWishlistAt(index = 0) {
    this.addToWishlistButtons.eq(index).click();
    return this;
  }

  addToCompareAt(index = 0) {
    this.addToCompareButtons.eq(index).click();
    return this;
  }

  clickSubCategory(index = 0) {
    this.subCategoryItems.eq(index).find("a").click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyPageTitle(title) {
    this.pageTitle.should("contain.text", title);
    return this;
  }

  verifyProductsDisplayed() {
    this.productItems.should("have.length.greaterThan", 0);
    return this;
  }

  verifyProductCount(count) {
    this.productItems.should("have.length", count);
    return this;
  }

  verifySortByVisible() {
    this.sortBySelect.should("be.visible");
    return this;
  }

  verifyPaginationVisible() {
    this.pagerLinks.should("exist");
    return this;
  }

  verifyNoResultsMessage() {
    this.noResultsMessage.should("be.visible");
    return this;
  }

  verifyBreadcrumbContains(text) {
    this.breadcrumb.should("contain.text", text);
    return this;
  }

  verifySubCategoriesVisible() {
    this.subCategoryItems.should("have.length.greaterThan", 0);
    return this;
  }
}

module.exports = new ProductListPage();
