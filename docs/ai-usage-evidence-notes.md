# Rockwear AI Usage Evidence Notes

Generated during the current AI-assisted review session for the SWP391 AI Usage Report.

## Week 1 - Item 1: RDS Document Review And Use Case Summary

### AI Output Summary

The RDS describes Rockwear - Clothing Store as a clothing shop website with both customer-facing shopping functions and dashboard-based management functions.

Main actors:

- Guest: browses public pages, registers, logs in, searches products, and views public product/category information.
- Customer: uses shopping features such as cart, checkout, order history, vouchers, reviews, wishlist, and profile-related actions.
- Staff: handles operational dashboard tasks such as order processing, stock import, supplier/product management, review support, sales, and notifications.
- Admin: manages accounts, employee account creation, master data, reports/statistics, and broader dashboard functions.

Main feature groups:

- Register, employee account registration, login, Google login, logout, forgot/reset password.
- Product browsing and product management.
- Category, brand, and variation management.
- Cart, checkout, order placement, order history, and order status handling.
- Voucher/discount, sale, stock, supplier, review, account, notification, and statistics management.

### Student Validation Note

The summary should be checked against the RDS actor list, use case overview, screen authorization section, and overall functionality section. Generic e-commerce wording should be removed, while Rockwear-specific modules such as stock, supplier, voucher/sale, review, and dashboard statistics should be kept.

Manual checks:

- Confirm the exact number of feature groups.
- Confirm role permissions for major screens.
- Confirm use case names and any duplicated or renamed modules.

## Week 1 - Item 2: Business Rule Extraction

### AI Output Summary

Important validation, security, and business rules found in the RDS/SDS scope:

- Register: username and email should be unique; passwords should satisfy strength requirements; customer registration should require email confirmation before full account activation.
- Employee account registration: only admin should create staff accounts; employee email must be unique; generated or assigned credentials should follow password rules.
- Login: user credentials must be validated; disabled or unconfirmed accounts should not be allowed to authenticate normally.
- Google login: Google-authenticated accounts must be handled separately from normal username/password registration to avoid duplicate email conflicts.
- Password and security: passwords should be hashed before storage; JWT tokens should be generated after successful authentication and checked for protected endpoints.
- Order: order placement should verify cart content, selected payment method, shipping method, user information, and stock availability.
- Voucher/discount: voucher code, status, usage condition, customer eligibility, and discount validity period should be checked before applying to checkout.
- Stock: stock import should update stock variation quantity and create transaction history so later stock movements can be audited.

### Student Validation Note

The extracted rules should be compared with RDS business rule tables and backend code paths such as authentication, order, discount, and stock services/controllers. Rules that are too generic should be rewritten into project-specific notes.

Manual checks:

- Check exact business rule IDs in the RDS where available.
- Verify whether each rule is implemented in code or only documented.
- Confirm edge cases such as duplicate Google email, invalid voucher, insufficient stock, and disabled account login.

## Week 1 - Item 3: SDS Package And Architecture Understanding

### AI Output Summary

The SDS and source code show a Spring Boot backend with a layered structure:

- rest: exposes HTTP API endpoints for auth, product, order, discount, stock, review, notification, statistics, and other modules.
- service: contains business logic and coordinates repositories, DTOs, utilities, and external services.
- repo: contains Spring Data repositories and specifications for database access.
- entity: represents database-backed domain models such as product, user, order, discount, stock, brand, category, and review.
- dto: transfers data between frontend/API requests and backend services.
- security: handles JWT authentication, authorization configuration, and request filtering.
- config/util: contains payment, recommendation, Google, scheduler, JWT, and supporting utility classes.

The frontend is a React application with route definitions, page components, layout components, and service files that call backend APIs through Axios.

### Student Validation Note

This architecture summary should be validated against the actual folder structure and source files, especially package names and controller/service counts.

Manual checks:

- Confirm controller, service, entity, repository, and DTO counts.
- Confirm whether each package listed in SDS exists in the current backend.
- Confirm frontend route/page/service mapping before using the summary in the report.

## Week 1 - Item 4: Database And Schema Review

### AI Output Summary

The database/entity model supports a clothing store domain with key areas:

- Product catalog: product, product variation, variation single, category, brand, color, size, and product status.
- Shopping and orders: cart, order, order status, order variation single, payment method, shipping method.
- Discounts and sales: discount, discount status, discount type, user discount, sale, sale status, sale type, sale product.
- Inventory: stock, stock variation, transaction, transaction type, and provider.
- Users and engagement: user, role, rank, review, comment, comment parent, wishlist, notification, notification user.

### Student Validation Note

The database summary should be checked against `schema.dbml`, entity classes, and SDS table descriptions. Relationship details should not be accepted without manual PK/FK verification.

Manual checks:

- Confirm primary keys and composite keys.
- Confirm foreign keys between order/cart/product/stock entities.
- Confirm whether table names in SDS match current entity names.

## Week 1 - Item 5: Diagram Review And Consistency Checking

### AI Output Summary

The project contains many draw.io diagrams for use cases, class diagrams, and sequence diagrams. The diagrams should be checked for consistency with the current RDS/SDS and codebase.

Recommended checks:

- Actor names should match Guest, Customer, Staff, and Admin.
- Use case names should match the RDS naming.
- Class diagrams should use real controller, service, DTO, repository, and entity names from code.
- Sequence diagrams should follow the actual route from frontend action to controller, service, repository, database, and response.
- Diagrams should avoid outdated module names, duplicated flows, and unclear wiring.

### Student Validation Note

The diagram review should be performed manually because AI can identify likely consistency issues but cannot fully guarantee visual layout correctness.

Manual checks:

- Open selected draw.io diagrams and compare with RDS/SDS.
- Check text positioning and connector wiring.
- Regenerate or fix only diagrams that are required for the final submission.

## Week 2 - Item 1: Codebase Onboarding And Module Mapping

### AI Output Summary

The codebase contains a Spring Boot backend and React frontend. The backend has REST controllers for authentication, product, category, brand, variation, cart, order, checkout, discount, sale, stock, supplier/provider, review/comment, notification, account, wishlist, recommendation, payment, rank, and statistics. The frontend contains route definitions, user-facing pages, dashboard pages, and service files for calling APIs.

### Student Validation Note

The module mapping should be checked against route definitions, frontend service files, and backend controller request mappings.

Manual checks:

- Confirm frontend pages that are actually routed.
- Confirm API base paths in service files.
- Confirm unused or duplicate frontend pages before presenting module counts.

## Week 2 - Item 2: Authentication Flow Review

### AI Output Summary

The authentication flow includes normal login, registration, email confirmation, Google login callback, forgot password, reset password, JWT token generation, and protected route handling. Backend authentication is centered around `AuthRestController`, security configuration, JWT utilities, and request filtering. Frontend pages handle login/register/reset flows and protected routing.

### Student Validation Note

The authentication flow should be verified against backend security configuration and frontend protected route code. OAuth/JWT edge cases should be checked manually because AI may miss security configuration details.

Manual checks:

- Confirm login, register, confirm registration, Google callback, forgot password, reset password, and token endpoints.
- Confirm protected route behavior by role.
- Confirm disabled or unconfirmed account behavior.

## Week 2 - Item 3: Product, Order, And Stock Flow Review

### AI Output Summary

The product/order/stock flows connect customer-facing shopping actions with backend inventory and order management:

- Product browsing/search uses product APIs and frontend shop/product pages.
- Cart and checkout use cart, checkout, discount, payment, and order APIs.
- Order placement checks order data and stock-related conditions before creating or updating order records.
- Stock import and adjustment update stock variation quantities and record transaction history.
- Dashboard pages allow staff/admin to inspect orders, stock, and related product information.

### Student Validation Note

The flow summary should be compared with controller/service code and frontend pages. AI output should be corrected where it assumes a generic e-commerce flow that is not implemented in this project.

Manual checks:

- Confirm product search and product detail endpoints.
- Confirm cart and checkout service calls.
- Confirm order creation and payment callback behavior.
- Confirm stock import/adjustment updates transaction history.
