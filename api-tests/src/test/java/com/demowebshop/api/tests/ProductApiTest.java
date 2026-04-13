package com.demowebshop.api.tests;

import com.demowebshop.api.base.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import org.testng.annotations.DataProvider;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.testng.Assert.*;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * ProductApiTest — HTTP-level catalog & product endpoint tests
 * ─────────────────────────────────────────────────────────────────────────────
 * Epic    : Catalog
 * Feature : Products & Categories API
 * Layer   : integration
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Epic("Catalog")
@Feature("Products & Categories API")
@Owner("QA Team")
public class ProductApiTest extends BaseTest {

    // ── Home / Store Availability ────────────────────────────────────────────

    @Test(description = "TC_API_PROD_001 - Home page should return HTTP 200")
    @Story("Store Availability")
    @Severity(SeverityLevel.BLOCKER)
    @TmsLink("TC_API_PROD_001")
    public void homePageShouldReturn200() {
        given()
            .spec(requestSpec)
        .when()
            .get("/")
        .then()
            .statusCode(200)
            .body(containsString("Tricentis"))
            .header("Content-Type", containsString("text/html"));
    }

    @Test(description = "TC_API_PROD_002 - Home page should include product items in the response")
    @Story("Store Availability")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_PROD_002")
    public void homePageShouldContainProducts() {
        given()
            .spec(requestSpec)
        .when()
            .get("/")
        .then()
            .statusCode(200)
            .body(anyOf(
                containsString("product-item"),
                containsString("add-to-cart"),
                containsString("product-title")
            ));
    }

    // ── Category Pages ───────────────────────────────────────────────────────

    @DataProvider(name = "categories")
    public Object[][] categories() {
        return new Object[][] {
            {"Books",        "/books",        "Books"},
            {"Electronics",  "/electronics",  "Electronics"},
            {"Computers",    "/computers",    "Computers"},
            {"Jewelry",      "/jewelry",      "Jewelry"},
            {"Gift Cards",   "/gift-cards",   "Gift Cards"},
        };
    }

    @Test(description = "TC_API_PROD_003 - Category pages should return HTTP 200",
          dataProvider = "categories")
    @Story("Category Navigation API")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_PROD_003")
    public void categoryPageShouldReturn200(String name, String path, String expectedText) {
        given()
            .spec(requestSpec)
        .when()
            .get(path)
        .then()
            .statusCode(200)
            .body(containsString(expectedText));
    }

    // ── Product Detail Pages ─────────────────────────────────────────────────

    @Test(description = "TC_API_PROD_004 - Product detail page (Fiction) should return HTTP 200")
    @Story("Product Detail API")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_PROD_004")
    public void productDetailFictionShouldReturn200() {
        // '14' is the ID of "Fiction" book on demowebshop
        given()
            .spec(requestSpec)
        .when()
            .get("/fiction")
        .then()
            .statusCode(200)
            .body(containsString("Fiction"));
    }

    @Test(description = "TC_API_PROD_005 - Product detail page (Build Your Own Computer) should return 200")
    @Story("Product Detail API")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_PROD_005")
    public void productDetailComputerShouldReturn200() {
        given()
            .spec(requestSpec)
        .when()
            .get("/build-your-own-computer")
        .then()
            .statusCode(200)
            .body(containsString("computer"));
    }

    // ── Search ───────────────────────────────────────────────────────────────

    @Test(description = "TC_API_PROD_006 - Search for 'book' should return results page")
    @Story("Search API")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_PROD_006")
    public void searchForBookShouldReturnResults() {
        given()
            .spec(requestSpec)
            .queryParam("q", "book")
        .when()
            .get("/search")
        .then()
            .statusCode(200)
            .body(containsString("search"));
    }

    @Test(description = "TC_API_PROD_007 - Search for empty query should show search page")
    @Story("Search API")
    @Severity(SeverityLevel.MINOR)
    @TmsLink("TC_API_PROD_007")
    public void searchWithEmptyQueryShouldShowSearchPage() {
        given()
            .spec(requestSpec)
            .queryParam("q", "")
        .when()
            .get("/search")
        .then()
            .statusCode(200)
            .body(containsString("search"));
    }

    @Test(description = "TC_API_PROD_008 - Search for non-existent product should return no results message")
    @Story("Search API")
    @Severity(SeverityLevel.MINOR)
    @TmsLink("TC_API_PROD_008")
    public void searchForNonExistentProductShouldShowNoResults() {
        given()
            .spec(requestSpec)
            .queryParam("q", "xyznonexistentproduct999")
        .when()
            .get("/search")
        .then()
            .statusCode(200)
            .body(anyOf(
                containsString("No products were found"),
                containsString("search-results")
            ));
    }

    // ── Response Headers & Performance ───────────────────────────────────────

    @Test(description = "TC_API_PROD_009 - Home page response time should be under 10 seconds")
    @Story("Performance API")
    @Severity(SeverityLevel.MINOR)
    @TmsLink("TC_API_PROD_009")
    public void homePageResponseTimeShouldBeAcceptable() {
        Response response = given()
                .spec(requestSpec)
            .when()
                .get("/")
            .then()
                .extract().response();

        long responseTime = response.time();
        assertTrue(responseTime < 10_000,
                "Home page took too long: " + responseTime + "ms (limit: 10000ms)");
    }

    @Test(description = "TC_API_PROD_010 - Books catalog response time should be under 10 seconds")
    @Story("Performance API")
    @Severity(SeverityLevel.MINOR)
    @TmsLink("TC_API_PROD_010")
    public void booksCatalogResponseTimeShouldBeAcceptable() {
        Response response = given()
                .spec(requestSpec)
            .when()
                .get("/books")
            .then()
                .extract().response();

        long responseTime = response.time();
        assertTrue(responseTime < 10_000,
                "Books catalog took too long: " + responseTime + "ms (limit: 10000ms)");
    }
}
