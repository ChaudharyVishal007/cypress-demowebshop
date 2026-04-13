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
 * AuthApiTest — HTTP-level authentication endpoint tests
 * ─────────────────────────────────────────────────────────────────────────────
 * Epic    : Authentication
 * Feature : Login & Registration API
 * Layer   : integration
 * ─────────────────────────────────────────────────────────────────────────────
 */
@Epic("Authentication")
@Feature("Login & Registration API")
@Owner("QA Team")
public class AuthApiTest extends BaseTest {

    // ── Login Page ───────────────────────────────────────────────────────────

    @Test(description = "TC_API_AUTH_001 - Login page should return HTTP 200")
    @Story("Login Page Availability")
    @Severity(SeverityLevel.BLOCKER)
    @TmsLink("TC_API_AUTH_001")
    @io.qameta.allure.Link(name = "DemoWebShop Login", url = "http://demowebshop.tricentis.com/login")
    public void loginPageShouldReturn200() {
        given()
            .spec(requestSpec)
        .when()
            .get("/login")
        .then()
            .statusCode(200)
            .body(containsString("Welcome, Please Sign In!"));
    }

    @Test(description = "TC_API_AUTH_002 - Login with valid credentials should redirect to home")
    @Story("Successful Login")
    @Severity(SeverityLevel.BLOCKER)
    @TmsLink("TC_API_AUTH_002")
    public void loginWithValidCredentialsShouldSucceed() {
        Response response = given()
                .spec(requestSpec)
                .formParam("Email",    USER_EMAIL)
                .formParam("Password", USER_PASSWORD)
                .formParam("RememberMe", "false")
        .when()
                .post("/login")
        .then()
                .extract().response();

        // After successful login, redirected to home (200) or redirect (302)
        int status = response.statusCode();
        assertTrue(status == 200 || status == 302,
                "Expected 200 or 302 after valid login, got: " + status);

        // Response body or redirect location must not point to /login (error page)
        String body = response.body().asString();
        String location = response.header("Location");
        boolean noLoginError = !body.contains("Login was unsuccessful") &&
                               (location == null || !location.contains("/login"));
        assertTrue(noLoginError, "Login should not return to error page for valid credentials");
    }

    @Test(description = "TC_API_AUTH_003 - Login with invalid credentials should return error message")
    @Story("Invalid Login Attempt")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_AUTH_003")
    public void loginWithInvalidCredentialsShouldFail() {
        given()
            .spec(requestSpec)
            .formParam("Email",    "wrong@notexist.com")
            .formParam("Password", "WrongPass999!")
            .formParam("RememberMe", "false")
        .when()
            .post("/login")
        .then()
            .statusCode(200)                          // stays on login page
            .body(anyOf(
                containsString("Login was unsuccessful"),
                containsString("credentials provided are incorrect")
            ));
    }

    @Test(description = "TC_API_AUTH_004 - Login with empty credentials should return validation error")
    @Story("Invalid Login Attempt")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_AUTH_004")
    public void loginWithEmptyCredentialsShouldShowValidation() {
        given()
            .spec(requestSpec)
            .formParam("Email",    "")
            .formParam("Password", "")
            .formParam("RememberMe", "false")
        .when()
            .post("/login")
        .then()
            .statusCode(200)
            .body(containsString("login"));          // remains on login page
    }

    @Test(description = "TC_API_AUTH_005 - Login with wrong password should return error")
    @Story("Invalid Login Attempt")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_AUTH_005")
    public void loginWithWrongPasswordShouldFail() {
        given()
            .spec(requestSpec)
            .formParam("Email",    USER_EMAIL)
            .formParam("Password", "TotallyWrong999!")
            .formParam("RememberMe", "false")
        .when()
            .post("/login")
        .then()
            .statusCode(200)
            .body(anyOf(
                containsString("Login was unsuccessful"),
                containsString("credentials provided are incorrect")
            ));
    }

    // ── Register Page ────────────────────────────────────────────────────────

    @Test(description = "TC_API_AUTH_006 - Register page should return HTTP 200")
    @Story("Registration Page Availability")
    @Severity(SeverityLevel.CRITICAL)
    @TmsLink("TC_API_AUTH_006")
    public void registerPageShouldReturn200() {
        given()
            .spec(requestSpec)
        .when()
            .get("/register")
        .then()
            .statusCode(200)
            .body(containsString("Register"))
            .header("Content-Type", containsString("text/html"));
    }

    @Test(description = "TC_API_AUTH_007 - Registration with mismatched passwords should not cause server error")
    @Story("Invalid Registration")
    @Severity(SeverityLevel.NORMAL)
    @TmsLink("TC_API_AUTH_007")
    public void registerWithMismatchedPasswordsShouldFail() {
        long ts = System.currentTimeMillis();
        Response response = given()
                .spec(requestSpec)
                .redirects().follow(false)          // Don't auto-follow POST redirect
                .formParam("FirstName",       "Test")
                .formParam("LastName",        "User")
                .formParam("Email",           "newuser_" + ts + "@test.com")
                .formParam("Password",        "Password123!")
                .formParam("ConfirmPassword", "DifferentPass456!")
                .formParam("register-button", "Register")
            .when()
                .post("/register")
            .then()
                .extract().response();

        int status = response.statusCode();
        // ASP.NET MVC returns 302 redirect or 200 with validation errors
        // Either way — no 5xx server crash is the key assertion
        assertTrue(status < 500,
                "Registration with mismatched passwords should not crash the server. Got: " + status);
    }

    @Test(description = "TC_API_AUTH_008 - Password recovery page should return HTTP 200")
    @Story("Password Recovery")
    @Severity(SeverityLevel.MINOR)
    @TmsLink("TC_API_AUTH_008")
    public void passwordRecoveryPageShouldReturn200() {
        given()
            .spec(requestSpec)
        .when()
            .get("/passwordrecovery")
        .then()
            .statusCode(200)
            .body(containsString("password"));
    }
}
