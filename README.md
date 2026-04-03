# 🧪 Cypress POM Automation Framework
## Demo Web Shop — Tricentis (http://demowebshop.tricentis.com)

---

## 📁 Framework Structure

```
cypress-demowebshop/
│
├── cypress/
│   ├── e2e/                          # Test Specs
│   │   ├── auth/
│   │   │   ├── login.cy.js           # 18 Login test cases
│   │   │   └── register.cy.js        # 18 Registration test cases
│   │   ├── product/
│   │   │   ├── product.cy.js         # 29 Product test cases
│   │   │   └── home.cy.js            # 25 Home Page test cases
│   │   ├── cart/
│   │   │   └── cart.cy.js            # 22 Cart test cases
│   │   ├── checkout/
│   │   │   └── checkout.cy.js        # 16 Checkout test cases
│   │   ├── search/
│   │   │   └── search.cy.js          # 24 Search test cases
│   │   ├── wishlist/
│   │   │   └── wishlist.cy.js        # 18 Wishlist test cases
│   │   └── account/
│   │       └── account.cy.js         # 25 Account test cases
│   │
│   ├── fixtures/                     # Test Data
│   │   ├── users.json
│   │   ├── products.json
│   │   └── checkout.json
│   │
│   ├── support/
│   │   ├── e2e.js                    # Global hooks & imports
│   │   ├── commands/
│   │   │   └── commands.js           # Custom Cypress commands
│   │   └── pages/                    # Page Object Models
│   │       ├── BasePage.js           # Parent class (common methods)
│   │       ├── HomePage.js
│   │       ├── auth/
│   │       │   ├── LoginPage.js
│   │       │   └── RegisterPage.js
│   │       ├── product/
│   │       │   ├── ProductPage.js
│   │       │   └── ProductListPage.js
│   │       ├── cart/
│   │       │   ├── CartPage.js
│   │       │   └── WishlistPage.js
│   │       ├── checkout/
│   │       │   └── CheckoutPage.js
│   │       ├── search/
│   │       │   └── SearchPage.js
│   │       └── account/
│   │           └── AccountPage.js
│   │
│   ├── screenshots/                  # Auto-captured on failure
│   └── videos/                       # Test run recordings
│
├── cypress.config.js                 # Cypress configuration
├── reporter-config.json              # Mochawesome reporter config
└── package.json                      # Dependencies & scripts
```

---

## 🏗️ Architecture — Page Object Model (POM)

```
BasePage (parent)
    │
    ├── HomePage
    ├── auth/
    │     ├── LoginPage
    │     └── RegisterPage
    ├── product/
    │     ├── ProductPage
    │     └── ProductListPage
    ├── cart/
    │     ├── CartPage
    │     └── WishlistPage
    ├── checkout/
    │     └── CheckoutPage
    ├── search/
    │     └── SearchPage
    └── account/
          └── AccountPage
```

Each Page Object contains:
- **Selectors** (getters) — Cypress element queries
- **Actions** — Page interactions (click, type, select)
- **Compound Actions** — Multi-step flows
- **Assertions** — Built-in verify methods

---

## 📋 Test Cases Summary

| Module      | Test File          | Count | Tags                 |
|-------------|-------------------|-------|----------------------|
| Home Page   | home.cy.js        | 25    | smoke                |
| Login       | login.cy.js       | 18    | smoke, auth          |
| Register    | register.cy.js    | 18    | smoke, auth          |
| Products    | product.cy.js     | 29    | regression, product  |
| Cart        | cart.cy.js        | 22    | smoke, cart          |
| Checkout    | checkout.cy.js    | 16    | regression, checkout |
| Search      | search.cy.js      | 24    | smoke, search        |
| Wishlist    | wishlist.cy.js    | 18    | regression, wishlist |
| Account     | account.cy.js     | 25    | regression, account  |
| **TOTAL**   |                   | **195** |                   |

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager

### Install

```bash
# Clone or extract the framework
cd cypress-demowebshop

# Install dependencies
npm install
```

### Configure Test User

Edit `cypress.config.js` environment variables to set valid test user:

```js
env: {
  userEmail: "your-registered-email@test.com",
  userPassword: "YourPassword123",
}
```

> **Note:** You must first register a user on http://demowebshop.tricentis.com manually, then use those credentials here.

---

## 🚀 Running Tests

### Open Cypress Test Runner (Interactive)
```bash
npm run cy:open
```

### Run All Tests (Headless)
```bash
npm run cy:run
```

### Run All Tests (Headed — see browser)
```bash
npm run cy:run:headed
```

### Run by Module
```bash
npm run cy:run:auth        # Auth tests only
npm run cy:run:cart        # Cart tests only
npm run cy:run:checkout    # Checkout tests only
npm run cy:run:product     # Product tests only
npm run cy:run:search      # Search tests only
npm run cy:run:wishlist    # Wishlist tests only
npm run cy:run:account     # Account tests only
```

### Run by Tag
```bash
npm run cy:run:smoke       # Smoke tests only
npm run cy:run:regression  # Regression tests only
```

### Generate HTML Report
```bash
npm run cy:report
```

### Clean Reports/Screenshots/Videos
```bash
npm run cy:clean
```

---

## 🔧 Custom Commands

| Command                          | Description                              |
|----------------------------------|------------------------------------------|
| `cy.loginUI(email, password)`    | Login via UI form                        |
| `cy.loginViaAPI(email, password)`| Login via API (faster, no UI interaction)|
| `cy.logout()`                    | Log out user                             |
| `cy.registerUser(userData)`      | Register a new user                      |
| `cy.clearCart()`                 | Remove all items from cart               |
| `cy.clearWishlist()`             | Remove all items from wishlist           |
| `cy.addToCartByUrl(url)`         | Add product to cart by product URL       |
| `cy.addToWishlistByUrl(url)`     | Add product to wishlist by URL           |
| `cy.searchProduct(term)`         | Search from header search bar            |
| `cy.verifySuccess(message)`      | Assert success notification              |
| `cy.verifyError(message)`        | Assert error notification                |
| `cy.dismissNotification()`       | Close notification bar                   |
| `cy.getCartCount()`              | Get current cart item count              |
| `cy.screenshotWithTimestamp(name)` | Take timestamped screenshot            |

---

## 📊 Test Data (Fixtures)

### users.json
- `validUser` — Existing test user
- `newUser` — Template for registration
- `invalidUser` — Wrong credentials
- `malformedEmail` — Invalid email format

### products.json
- Product URLs for all categories
- Category navigation URLs
- Search terms (valid, partial, empty, no-results)

### checkout.json
- Billing address data
- Shipping address data
- Payment method configs
- Credit card test data

---

## 🏷️ Test Tags

Tests are tagged using `{ tags: [...] }` in describe blocks:

| Tag         | Description                         |
|-------------|-------------------------------------|
| `smoke`     | Critical path tests (fast subset)   |
| `regression`| Full regression tests               |
| `auth`      | Authentication related              |
| `cart`      | Shopping cart functionality         |
| `checkout`  | Checkout flow tests                 |
| `product`   | Product listing/detail tests        |
| `search`    | Search functionality tests          |
| `wishlist`  | Wishlist tests                      |
| `account`   | My Account tests                    |

---

## 📸 Screenshots & Videos

- **Screenshots** are automatically captured on test failure
- **Videos** are recorded for every test run
- Both saved to `cypress/screenshots/` and `cypress/videos/`

---

## 📝 Best Practices Used

1. **POM Architecture** — All selectors and actions in page classes
2. **BasePage** — Common methods inherited by all pages
3. **Fixtures** — External test data, no hardcoding in tests
4. **Custom Commands** — Reusable actions across all tests
5. **API Login** — Fast authentication without UI for test setup
6. **beforeEach Hooks** — Consistent test setup/teardown
7. **Descriptive Test IDs** — TC_MODULE_NNN format
8. **Retry Logic** — 2 retries in CI mode
9. **Graceful Skipping** — Conditional checks for optional UI elements
10. **Reporter** — Mochawesome HTML reports with screenshots

---

## 🐛 Troubleshooting

**Tests fail due to login:**  
Ensure valid credentials are set in `cypress.config.js` env section.

**Timeouts:**  
Increase `defaultCommandTimeout` in `cypress.config.js` if the site is slow.

**Cart/Wishlist state issues:**  
`cy.clearCart()` and `cy.clearWishlist()` commands handle cleanup in beforeEach.

**Flaky tests:**  
Increase retries in `cypress.config.js`:
```js
retries: { runMode: 3, openMode: 1 }
```
