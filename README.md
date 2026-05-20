# Limited Edition VTuber Goods E-Commerce 🦈🔮🎙️

A zero-config, highly compliant E-commerce web application built for a university final project. This project implements advanced structural design patterns and is styled using a premium cyberpunk glassmorphism visual aesthetic.

---

## 🚀 Quickstart Guide (Zero-Config Portability)

Follow these simple steps to run the application on any system:

### 1. Install Dependencies
Initialize the project libraries. (This downloads Express, SQLite3, JSONWebToken, and BcryptJS):
```bash
npm install
```

### 2. Run the Automated Tests (Verification Suite)
Before spinning up the server, run the service layer and database verification suite to confirm that registration, security, parameterized queries, and ACID transactions are functioning perfectly:
```bash
node verify.js
```

### 3. Launch the Application
Start the Node.js server:
```bash
npm start
```

### 4. Visit the Storefront
Open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 📐 Architectural Best Practices Rubric Mapping

This project was built to satisfy the university's architectural standards. Below is the mapping of each rubric requirement to its implementation in the codebase:

### 1. Interaction: Event Delegation & Input Debouncing
* **Event Delegation:** Rather than attaching click event listeners to hundreds of dynamically-generated merchandise cards, a single listener is placed on the parent grid `#products-grid`. It intercepts clicks and delegates actions to the correct item using `.closest('.add-to-cart-btn')`.
  * 📍 **Implementation:** [public/js/app.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/public/js/app.js)
* **Debouncing:** When users type in the catalog search input, the character streams are debounced by `300ms` using a custom timer before sending filtering requests to the backend. This prevents API query flooding.
  * 📍 **Implementation:** [public/js/app.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/public/js/app.js) (Functions `debounce` and input mounting)

### 2. State & Continuity: State Hydration
* The shopping cart uses a global `cartState` array. Changes are serialized to JSON and persisted using browser `localStorage`. On application boot, hydration logic (`hydrateState()`) runs, parses the stored values, and draws the corresponding products back onto the page.
  * 📍 **Implementation:** [public/js/app.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/public/js/app.js) (Functions `hydrateState()` and `persistCartState()`)

### 3. Security (API): Gatekeeper Pattern
* **Authentication Gatekeeper:** Incoming requests to private endpoints (like checkout or order history) pass through `authenticateToken`, which extracts, verifies, and decodes the JWT stateless session token.
  * 📍 **Implementation:** [src/middlewares/authMiddleware.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/middlewares/authMiddleware.js)
* **Validation Gatekeeper:** Endpoints are guarded by `validateRegister`, `validateLogin`, and `validateCheckout`. These check parameters, validate email formats, ensure positive quantities, and sanitize incoming strings (HTML escaping) to block cross-site scripting (XSS).
  * 📍 **Implementation:** [src/middlewares/validateMiddleware.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/middlewares/validateMiddleware.js)

### 4. Checkout Body Parsing
* Standard JSON parsing is initialized on the Express server using `express.json()` middleware, allowing controllers to receive clean Javascript objects directly in `req.body`.
  * 📍 **Implementation:** [server.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/server.js)

### 5. Relational Database Schema
* The database uses SQLite (zero-config, portable file format) with full relational integrity. Four tables are set up with Primary Keys (PK) and Foreign Keys (FK):
  * `users` — account credentials and roles.
  * `products` — product catalogs, category details, pricing, and stock.
  * `orders` — user orders linked via `user_id` FK.
  * `order_items` — mapping quantities and historical prices linked via `order_id` FK.
  * 📍 **Implementation:** [src/config/database.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/config/database.js)

### 6. SQL Safety: Parameterized Queries
* Raw string concatenation is strictly banned. Database interactions use SQL placeholders (`?`) to prevent SQL injection vulnerabilities.
  * 📍 **Implementation:** Used exclusively in all queries under [src/services/](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/services/) (`authService.js`, `productService.js`, `orderService.js`).

### 7. Modularization: Controller-Route-Service Pattern
* Separation of concerns is divided into distinct modular layers:
  * **Routes:** Receives the request and calls validation/authentication gatekeepers.
  * **Controllers:** Handles HTTP status codes, extracts arguments, and maps responses.
  * **Services:** Executes business calculations, hashes passwords, and triggers database transaction sets.
  * 📍 **Directory Map:** [src/routes/](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/routes/), [src/controllers/](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/controllers/), [src/services/](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/services/)

### 8. Bonus Challenge: Pre-Checkout Stock Check (ACID Transactions)
* The checkout routine in `orderService.js` is wrapped inside an SQL Transaction block (`BEGIN TRANSACTION`, `COMMIT`, `ROLLBACK`):
  1. It performs a stock-check for every item in the cart.
  2. If any single item's stock is insufficient (e.g., requested > stock), it throws an explicit `"Out of Stock"` error.
  3. The `catch` block catches this error and triggers a database `ROLLBACK`. This restores all stock adjustments and prevents any new orders from being logged.
  4. If all items pass stock checks, inventories are updated, records inserted, and the database changes are committed via `COMMIT`.
  * 📍 **Implementation:** [src/services/orderService.js](file:///c:/Users/phuri/Desktop/vtuber%20r%20rai%20wa/git/vtuber%20ecom/Vtuber-goods-ecom/src/services/orderService.js) (Function `createOrder`)

---

## 🎨 Premium Visual Interface

The frontend client is designed with:
* **Glassmorphism panels:** Multi-layered panels with transparent backing (`rgba`), subtle glowing border profiles, and heavy background blurs (`backdrop-filter: blur(16px)`).
* **Responsive Layouts:** Uses CSS Flexbox and Grid structures that automatically adapt between desktop monitors and smartphone screens.
* **Micro-Animations:** Hover transitions on card items, scaling buttons, and toast notifications create a dynamic, reactive application experience.
