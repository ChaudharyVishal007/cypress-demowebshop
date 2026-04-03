const BasePage = require("../BasePage");

/**
 * SearchPage - Page Object for Search functionality
 * URL: /search
 */
class SearchPage extends BasePage {
  // ─── Selectors ────────────────────────────────────────────────────────────

  get searchInput() {
    return cy.get("#q");
  }

  get advancedSearchCheckbox() {
    return cy.get("#advs");
  }

  get categorySelect() {
    return cy.get("#cid");
  }

  get includeSubcategoriesCheckbox() {
    return cy.get("#isc");
  }

  get manufacturerSelect() {
    return cy.get("#mid");
  }

  get priceFromInput() {
    return cy.get("#pf");
  }

  get priceToInput() {
    return cy.get("#pt");
  }

  get searchInDescriptionsCheckbox() {
    return cy.get("#sid");
  }

  get searchButton() {
    return cy.get(".search-input .button-1[type='submit']");
  }

  get searchResults() {
    return cy.get(".search-results .product-item");
  }

  get searchResultTitles() {
    return cy.get(".search-results .product-title a");
  }

  get noResultsMessage() {
    return cy.get(".search-results .no-result");
  }

  get searchWarning() {
    return cy.get(".warning");
  }

  get pageTitle() {
    return cy.get(".page-title");
  }

  // ─── Actions ──────────────────────────────────────────────────────────────

  navigate() {
    return this.visit("/search");
  }

  enterSearchTerm(term) {
    this.searchInput.clear().type(term);
    return this;
  }

  clickSearch() {
    this.searchButton.click();
    return this;
  }

  search(term) {
    this.enterSearchTerm(term);
    this.clickSearch();
    return this;
  }

  enableAdvancedSearch() {
    this.advancedSearchCheckbox.check();
    return this;
  }

  selectCategory(value) {
    this.categorySelect.select(value);
    return this;
  }

  includeSubcategories() {
    this.includeSubcategoriesCheckbox.check();
    return this;
  }

  setPriceRange(from, to) {
    if (from) this.priceFromInput.clear().type(from.toString());
    if (to) this.priceToInput.clear().type(to.toString());
    return this;
  }

  enableSearchInDescriptions() {
    this.searchInDescriptionsCheckbox.check();
    return this;
  }

  advancedSearch({ term, category, priceFrom, priceTo, includeSubcats = false }) {
    this.enableAdvancedSearch();
    if (term) this.enterSearchTerm(term);
    if (category) this.selectCategory(category);
    if (includeSubcats) this.includeSubcategories();
    if (priceFrom || priceTo) this.setPriceRange(priceFrom, priceTo);
    this.clickSearch();
    return this;
  }

  clickResultAt(index = 0) {
    this.searchResultTitles.eq(index).click();
    return this;
  }

  // Header search shortcut
  searchFromHeader(term) {
    this.headerSearchBox.clear().type(term);
    this.headerSearchBtn.click();
    return this;
  }

  // ─── Assertions ───────────────────────────────────────────────────────────

  verifyOnSearchPage() {
    this.verifyUrl("/search");
    return this;
  }

  verifyResultsFound() {
    this.searchResults.should("have.length.greaterThan", 0);
    return this;
  }

  verifyResultCount(count) {
    this.searchResults.should("have.length", count);
    return this;
  }

  verifyNoResults() {
    this.noResultsMessage.should("be.visible");
    return this;
  }

  verifyResultContains(term) {
    this.searchResultTitles
      .first()
      .invoke("text")
      .then((text) => {
        expect(text.toLowerCase()).to.include(term.toLowerCase());
      });
    return this;
  }

  verifyShortTermWarning() {
    this.searchWarning.should("be.visible");
    return this;
  }

  verifyAllResultsContain(term) {
    this.searchResultTitles.each(($el) => {
      cy.wrap($el)
        .invoke("text")
        .then((text) => {
          expect(text.toLowerCase()).to.include(term.toLowerCase());
        });
    });
    return this;
  }
}

module.exports = new SearchPage();
