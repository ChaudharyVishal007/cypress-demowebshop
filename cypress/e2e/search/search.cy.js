/**
 * Test Suite: Search Functionality
 * Tags: smoke, regression, search
 */

import SearchPage from "../../support/pages/search/SearchPage";
import ProductListPage from "../../support/pages/product/ProductListPage";

describe("Search Functionality", { tags: ["smoke", "search"] }, () => {
  let products;

  before(() => {
    cy.fixture("products").then((data) => {
      products = data;
    });
  });

  // ─── Header Search ─────────────────────────────────────────────────────

  context("Header Search Bar", () => {
    beforeEach(() => {
      cy.visit("/");
    });

    it("TC_SRCH_001 - Should search using header search bar", () => {
      cy.searchProduct(products.searchTerms.valid);
      cy.url().should("include", "/search");
      SearchPage.verifyResultsFound();
    });

    it("TC_SRCH_002 - Should display results for valid search term", () => {
      cy.searchProduct(products.searchTerms.valid);
      SearchPage.verifyResultsFound();
    });

    it("TC_SRCH_003 - Should show no results for non-existent product", () => {
      cy.searchProduct(products.searchTerms.noResults);
      SearchPage.verifyNoResults();
    });

    it("TC_SRCH_004 - Should redirect to search page after header search", () => {
      cy.searchProduct(products.searchTerms.valid);
      cy.url().should("include", "q=" + products.searchTerms.valid);
    });
  });

  // ─── Search Page ───────────────────────────────────────────────────────

  context("Search Page - Basic Search", () => {
    beforeEach(() => {
      SearchPage.navigate();
    });

    it("TC_SRCH_005 - Should navigate to search page", () => {
      SearchPage.verifyOnSearchPage();
    });

    it("TC_SRCH_006 - Should find products for valid search term 'laptop'", () => {
      SearchPage.search("laptop");
      SearchPage.verifyResultsFound();
    });

    it("TC_SRCH_007 - Should find products for 'book'", () => {
      SearchPage.search("book");
      SearchPage.verifyResultsFound();
    });

    it("TC_SRCH_008 - Should find products for 'computer'", () => {
      SearchPage.search("computer");
      SearchPage.verifyResultsFound();
    });

    it("TC_SRCH_009 - Should display no results for 'xyznonexistent'", () => {
      SearchPage.search(products.searchTerms.noResults);
      SearchPage.verifyNoResults();
    });

    it("TC_SRCH_010 - Should show warning for very short search term (1 char)", () => {
      SearchPage.search("a");
      SearchPage.verifyShortTermWarning();
    });

    it("TC_SRCH_011 - Should handle empty search submission", () => {
      SearchPage.clickSearch();
      cy.url().should("include", "/search");
      // Should either show warning or no results
      cy.get("body").then(($body) => {
        const hasWarning = $body.find(".warning").length > 0;
        const hasNoResult = $body.find(".no-result").length > 0;
        expect(hasWarning || hasNoResult).to.be.true;
      });
    });

    it("TC_SRCH_012 - Should retain search term in input after search", () => {
      const term = "laptop";
      SearchPage.search(term);
      SearchPage.searchInput.should("have.value", term);
    });

    it("TC_SRCH_013 - Should navigate to product detail on result click", () => {
      SearchPage.search("laptop");
      SearchPage.verifyResultsFound();
      SearchPage.clickResultAt(0);
      cy.url().should("not.include", "/search");
      cy.get(".product-name h1").should("be.visible");
    });
  });

  // ─── Advanced Search ───────────────────────────────────────────────────

  context("Search Page - Advanced Search", () => {
    beforeEach(() => {
      SearchPage.navigate();
      SearchPage.enableAdvancedSearch();
    });

    it("TC_SRCH_014 - Should enable advanced search options", () => {
      cy.get("#advs").should("be.checked");
      SearchPage.categorySelect.should("be.visible");
    });

    it("TC_SRCH_015 - Should filter search by category - Books", () => {
      SearchPage.enterSearchTerm("computing");
      SearchPage.categorySelect.select("Books");
      SearchPage.clickSearch();
      SearchPage.verifyResultsFound();
    });

    it("TC_SRCH_016 - Should search with price range filter", () => {
      SearchPage.enterSearchTerm("laptop");
      SearchPage.setPriceRange(100, 2000);
      SearchPage.clickSearch();
      // Should return results or no results page (not an error)
      cy.url().should("include", "/search");
    });

    it("TC_SRCH_017 - Should search in descriptions", () => {
      SearchPage.enterSearchTerm("computing");
      SearchPage.enableSearchInDescriptions();
      SearchPage.clickSearch();
      cy.url().should("include", "/search");
    });

    it("TC_SRCH_018 - Should search with include subcategories option", () => {
      SearchPage.enterSearchTerm("book");
      SearchPage.categorySelect.select("Books");
      SearchPage.includeSubcategories();
      SearchPage.clickSearch();
      cy.url().should("include", "/search");
    });

    it("TC_SRCH_019 - Should return no results when price range excludes all products", () => {
      SearchPage.enterSearchTerm("laptop");
      SearchPage.setPriceRange(1, 2);
      SearchPage.clickSearch();
      SearchPage.verifyNoResults();
    });

    it("TC_SRCH_020 - Should handle special characters in search term", () => {
      SearchPage.search("laptop & book");
      cy.url().should("include", "/search");
    });
  });

  // ─── Search Result Display ─────────────────────────────────────────────

  context("Search Results Display", () => {
    it("TC_SRCH_021 - Should display product images in search results", () => {
      SearchPage.navigate();
      SearchPage.search("laptop");
      SearchPage.verifyResultsFound();
      cy.get(".search-results .picture img").should("be.visible");
    });

    it("TC_SRCH_022 - Should display product prices in search results", () => {
      SearchPage.navigate();
      SearchPage.search("laptop");
      SearchPage.verifyResultsFound();
      cy.get(".search-results .price.actual-price").should("be.visible");
    });

    it("TC_SRCH_023 - Should display Add to Cart button in search results", () => {
      SearchPage.navigate();
      SearchPage.search("book");
      SearchPage.verifyResultsFound();
      cy.get(".search-results .add-to-cart-button").should("exist");
    });

    it("TC_SRCH_024 - Should be able to sort search results", () => {
      SearchPage.navigate();
      SearchPage.search("book");
      SearchPage.verifyResultsFound();
      ProductListPage.sortBy("Price: Low to High");
      SearchPage.verifyResultsFound();
    });
  });
});
