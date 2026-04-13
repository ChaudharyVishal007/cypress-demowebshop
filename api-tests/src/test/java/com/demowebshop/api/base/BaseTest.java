package com.demowebshop.api.base;

import io.qameta.allure.restassured.AllureRestAssured;
import io.restassured.RestAssured;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.config.HttpClientConfig;
import io.restassured.config.RedirectConfig;
import io.restassured.config.RestAssuredConfig;
import io.restassured.filter.log.RequestLoggingFilter;
import io.restassured.filter.log.ResponseLoggingFilter;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import org.testng.annotations.BeforeSuite;

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BaseTest — shared configuration for all API test classes
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *  • Set RestAssured baseURI
 *  • Attach AllureRestAssured filter (auto-attaches req/res to Allure report)
 *  • Configure timeouts, redirect policy, and logging
 * ─────────────────────────────────────────────────────────────────────────────
 */
public class BaseTest {

    protected static final String BASE_URL  = "http://demowebshop.tricentis.com";
    protected static final String USER_EMAIL    = "testuser_jetski_12347@example.com";
    protected static final String USER_PASSWORD = "Password123!";

    protected static RequestSpecification requestSpec;

    @BeforeSuite(alwaysRun = true)
    public void setUpSuite() {
        // ── RestAssured global config ────────────────────────────────────────
        RestAssured.baseURI = BASE_URL;
        RestAssured.config = RestAssuredConfig.config()
                .httpClient(HttpClientConfig.httpClientConfig()
                        .setParam("http.connection.timeout", 15_000)
                        .setParam("http.socket.timeout",     15_000))
                .redirect(RedirectConfig.redirectConfig().followRedirects(true).maxRedirects(5));

        // ── Shared request specification ─────────────────────────────────────
        requestSpec = new RequestSpecBuilder()
                .setBaseUri(BASE_URL)
                .setContentType(ContentType.URLENC)          // form posts
                .addHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .addHeader("User-Agent", "Mozilla/5.0 RestAssured/ApiTests")
                .addFilter(new AllureRestAssured()           // Allure HTTP attachment
                        .setRequestTemplate("http-request.ftl")
                        .setResponseTemplate("http-response.ftl"))
                .addFilter(new RequestLoggingFilter())       // console log
                .addFilter(new ResponseLoggingFilter())
                .build();
    }
}
