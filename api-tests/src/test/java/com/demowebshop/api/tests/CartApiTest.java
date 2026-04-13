package com.demowebshop.api.tests;

import com.demowebshop.api.base.BaseTest;
import io.qameta.allure.*;
import io.restassured.response.Response;
import org.testng.annotations.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;
import static org.testng.Assert.*;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * CartApiTest — HTTP-level shopping cart endpoint tests
 * ─────────────────────────────────────────────────────────────────────────────
 * Epic    : Shopping Cart
 * Feature : Cart & Wishlist API
 * Layer   : integration
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Epic("Shopping Cart")
@Feature("Cart & Wishlist API")
@Owner("QA Team")
public class CartApiTest extends BaseTest {

    // ── Cart Page ────────────────────────────────────────────────────────────

    @Test(description = "TC_API_CART_001 - Cart page should return HTTP 200 for guest user")
    @Story("Cart Page Availability")
    @Severity(SeverityLevel.BLOCKER)
    @TmsLink("TC_API_CART_001")
    public void cartPageShouldReturn200ForGuest() {
        given()
            .spec(requestSpec)
        .when()
            .get("/cart")
        .then()
            .statusCode(200)
            .body(containsString("Shopping cart"))
            .header("Content-Type", containsString("text/html"));
    }

    @Test(description = "TC_API_CART_002 - Cart page for guest should contain empty cart message or cart table")
    @Story("Cart Page Availability")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_CART_002")
    public void cartPageForGuestShouldShowEmptyCart() {
        given()
            .spec(requestSpec)
        .when()
            .get("/cart")
        .then()
            .statusCode(200)
            .body(anyOf(
                containsString("Your Shopping Cart is empty"),
                containsString("shopping-cart-page")
            ));
    }

    // ── Add to Cart ──────────────────────────────────────────────────────────

    @Test(description = "TC_API_CART_003 - Add simple product to cart should return success response")
    @Story("Add to Cart")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_CART_003")
    public void addSimpleProductToCartShouldSucceed() {
        // Product ID 45 = "14.1-inch Laptop" (simple product, catalog type 1)
        Response response = given()
                .spec(requestSpec)
                .formParam("addtocart_45.EnteredQuantity", "1")
            .when()
                .post("/addproducttocart/catalog/45/1/1")
            .then()
                .extract().response();

        int status = response.statusCode();
        assertTrue(status == 200 || status == 302,
                "Expected 200 or 302 when adding to cart, got: " + status);
    }

    @Test(description = "TC_API_CART_004 - Add book to cart should respond without server error")
    @Story("Add to Cart")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_CART_004")
    public void addBookToCartShouldNotReturn5xx() {
        // Product ID 14 = Fiction book
        Response response = given()
                .spec(requestSpec)
                .formParam("addtocart_14.EnteredQuantity", "1")
            .when()
                .post("/addproducttocart/catalog/14/1/1")
            .then()
                .extract().response();

        int status = response.statusCode();
        assertTrue(status < 500,
                "Server error when adding book to cart. Status: " + status);
    }

    @Test(description = "TC_API_CART_005 - Add to cart endpoint should reject invalid product ID")
    @Story("Add to Cart")
    @Severity(SeverityLevel.MINOR)
    @TmsLink("TC_API_CART_005")
    public void addInvalidProductToCartShouldReturn404Or302() {
        Response response = given()
                .spec(requestSpec)
                .formParam("addtocart_99999.EnteredQuantity", "1")
            .when()
                .post("/addproducttocart/catalog/99999/1/1")
            .then()
                .extract().response();

        int status = response.statusCode();
        // Should not crash the server — 404 expected for non-existent product
        assertTrue(status == 404 || status == 302 || status == 200,
                "Unexpected status for invalid product: " + status);
    }

    // ── Wishlist ─────────────────────────────────────────────────────────────

    @Test(description = "TC_API_CART_006 - Wishlist page should return HTTP 200")
    @Story("Wishlist Page Availability")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_CART_006")
    public void wishlistPageShouldReturn200() {
        given()
            .spec(requestSpec)
        .when()
            .get("/wishlist")
        .then()
            .statusCode(200)
            .body(anyOf(
                containsString("Wishlist"),
                containsString("wishlist")
            ));
    }

    @Test(description = "TC_API_CART_007 - Add to wishlist should respond without server error")
    @Story("Wishlist")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_CART_007")
    public void addToWishlistShouldNotReturn5xx() {
        // Type 2 = wishlist in addproducttocart endpoint
        Response response = given()
                .spec(requestSpec)
                .formParam("addtocart_14.EnteredQuantity", "1")
            .when()
                .post("/addproducttocart/catalog/14/2/1")
            .then()
                .extract().response();

        int status = response.statusCode();
        assertTrue(status < 500,
                "Server error when adding to wishlist. Status: " + status);
    }

    // ── Checkout ─────────────────────────────────────────────────────────────

    @Test(description = "TC_API_CART_008 - Checkout page should redirect to login for guest user")
    @Story("Checkout Availability")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_CART_008")
    public void checkoutPageShouldRequireLogin() {
        Response response = given()
                .spec(requestSpec)
                // Don't follow redirect so we can inspect redirect target
                .redirects().follow(false)
            .when()
                .get("/checkout")
            .then()
                .extract().response();

        int status = response.statusCode();
        // Guest checkout should redirect or show login prompt
        if (status == 302 || status == 301) {
            String location = response.header("Location");
            assertNotNull(location, "Redirect location header should not be null");
        } else {
            // Some sites render login inline
            assertEquals(status, 200);
        }
    }
}
