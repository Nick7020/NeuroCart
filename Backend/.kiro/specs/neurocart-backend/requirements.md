# Requirements Document

## Introduction

NeuroCart is a production-grade, AI-powered multi-vendor e-commerce platform built with Django and Django REST Framework. The platform supports three user roles — customers, vendors, and administrators — and provides a complete commerce lifecycle including product discovery, cart management, multi-vendor checkout, payment processing, purchase-verified reviews, and AI-driven recommendations. The system is designed to operate at Amazon/Flipkart scale with strict correctness guarantees around stock management, payment integrity, and order consistency.

## Glossary

- **System**: The NeuroCart backend API
- **User**: Any authenticated account in the system
- **Customer**: A User with role=customer who browses and purchases products
- **Vendor**: A User with role=vendor who lists and sells products
- **Admin**: A User with role=admin who manages the platform
- **VendorProfile**: The extended profile record associated with a Vendor user
- **Product**: A sellable item listed by a Vendor
- **Cart**: A persistent shopping basket associated with a Customer
- **CartItem**: A single product-quantity entry within a Cart
- **Order**: A confirmed purchase record created at checkout
- **OrderItem**: A single product-quantity-vendor entry within an Order
- **Payment**: A financial transaction record linked to an Order
- **Review**: A rating and comment left by a Customer for a purchased Product
- **SalesRecord**: An analytics record capturing revenue and volume data
- **JWT**: JSON Web Token used for stateless authentication
- **RBAC**: Role-Based Access Control
- **PBT**: Property-Based Testing
- **Hypothesis**: The Python property-based testing library used for PBT
- **select_for_update**: A database-level row lock used to prevent race conditions
- **Co-occurrence**: Two products appearing together in the same order

---

## Requirements

### Requirement 1: User Authentication and Account Management

**User Story:** As a visitor, I want to register and authenticate securely, so that I can access role-appropriate features of the platform.

#### Acceptance Criteria

1. WHEN a visitor submits a valid email, password, and role to `/api/auth/register`, THE System SHALL create a new User account and return a 201 response with JWT access and refresh tokens.
2. WHEN a visitor submits a duplicate email to `/api/auth/register`, THE System SHALL return a 400 response with a descriptive validation error.
3. WHEN a user submits valid credentials to `/api/auth/login`, THE System SHALL return a 200 response containing a JWT access token (1-hour expiry) and a refresh token (7-day expiry).
4. WHEN a user submits invalid credentials to `/api/auth/login`, THE System SHALL return a 401 response.
5. WHEN a user submits a valid refresh token to `/api/auth/token/refresh`, THE System SHALL return a new access token.
6. WHEN a user submits an expired or invalid refresh token to `/api/auth/token/refresh`, THE System SHALL return a 401 response.
7. WHEN an authenticated user calls `POST /api/auth/logout`, THE System SHALL blacklist the provided refresh token and return a 200 response.
8. THE User model SHALL use email as the primary login identifier instead of username.
9. THE User model SHALL store a role field with exactly three valid values: customer, vendor, or admin.
10. WHEN a user submits a password shorter than 8 characters during registration, THE System SHALL return a 400 response with a validation error.

---

### Requirement 2: User Profile Management

**User Story:** As an authenticated user, I want to view and update my profile, so that I can keep my account information current.

#### Acceptance Criteria

1. WHEN an authenticated user calls `GET /api/users/me`, THE System SHALL return the user's profile data including email, first name, last name, and role.
2. WHEN an authenticated user calls `PUT /api/users/me` with valid data, THE System SHALL update the user's profile and return the updated record.
3. WHEN an unauthenticated request is made to `/api/users/me`, THE System SHALL return a 401 response.
4. WHILE a user is authenticated, THE System SHALL prevent the user from modifying their own role field via the profile endpoint.

---

### Requirement 3: Vendor Registration and Profile Management

**User Story:** As a vendor, I want to register my shop and manage my vendor profile, so that I can sell products on the platform.

#### Acceptance Criteria

1. WHEN a user with role=vendor calls `POST /api/vendors/register` with a valid shop_name, THE System SHALL create a VendorProfile with verification_status=pending and return a 201 response.
2. WHEN a vendor attempts to register a second VendorProfile, THE System SHALL return a 400 response.
3. WHEN any user calls `GET /api/vendors/{id}`, THE System SHALL return the vendor's public profile including shop_name, rating, and verification_status.
4. WHEN an authenticated vendor calls `GET /api/vendor/dashboard`, THE System SHALL return the vendor's own profile, recent orders, and summary statistics.
5. WHEN an authenticated vendor calls `PUT /api/vendor/dashboard` with valid data, THE System SHALL update the vendor's shop_name and description.
6. IF a non-vendor user attempts to access `/api/vendor/dashboard`, THEN THE System SHALL return a 403 response.

---

### Requirement 4: Admin Vendor Verification

**User Story:** As an admin, I want to approve or reject vendor applications, so that I can maintain platform quality.

#### Acceptance Criteria

1. WHEN an admin calls `GET /api/admin/vendors`, THE System SHALL return a paginated list of all VendorProfiles with their verification_status.
2. WHEN an admin calls `PATCH /api/admin/vendors/{id}/verify` with status=approved, THE System SHALL update the VendorProfile verification_status to approved.
3. WHEN an admin calls `PATCH /api/admin/vendors/{id}/verify` with status=rejected, THE System SHALL update the VendorProfile verification_status to rejected.
4. IF a non-admin user attempts to access `/api/admin/vendors`, THEN THE System SHALL return a 403 response.
5. WHILE a vendor's verification_status is pending or rejected, THE System SHALL prevent that vendor from creating new products.

---

### Requirement 5: Category Management

**User Story:** As an admin, I want to manage product categories, so that products are organized for easy discovery.

#### Acceptance Criteria

1. WHEN any user calls `GET /api/categories`, THE System SHALL return the full category tree including parent-child relationships.
2. WHEN an admin calls `POST /api/categories` with a valid name, THE System SHALL create a new category and return a 201 response.
3. WHERE a parent category is specified, THE System SHALL associate the new category as a child of the specified parent.
4. IF a non-admin user attempts to create a category, THEN THE System SHALL return a 403 response.
5. THE Category model SHALL support self-referential parent-child relationships to arbitrary depth.

---

### Requirement 6: Product Management

**User Story:** As a vendor, I want to create and manage my product listings, so that customers can discover and purchase my products.

#### Acceptance Criteria

1. WHEN an approved vendor calls `POST /api/products` with valid product data, THE System SHALL create a Product associated with that vendor and return a 201 response.
2. WHEN an approved vendor calls `PUT /api/products/{id}` for their own product, THE System SHALL update the product and return the updated record.
3. WHEN an approved vendor calls `DELETE /api/products/{id}` for their own product, THE System SHALL soft-delete the product by setting is_active=False.
4. IF a vendor attempts to modify a product they do not own, THEN THE System SHALL return a 403 response.
5. WHEN any user calls `GET /api/products`, THE System SHALL return a paginated list of active products with support for filtering by category, price range, and vendor.
6. WHEN any user calls `GET /api/products/{id}`, THE System SHALL return the full product detail including images, vendor info, and average rating.
7. WHEN an authenticated vendor calls `GET /api/vendor/products`, THE System SHALL return only that vendor's own products including inactive ones.
8. THE Product model SHALL enforce that stock quantity is never stored as a negative integer.
9. WHEN a product search query is provided, THE System SHALL filter products by name and description using case-insensitive matching.
10. THE System SHALL return products in pages of 20 items per page by default.

---

### Requirement 7: Product Images

**User Story:** As a vendor, I want to upload multiple images for my products, so that customers can see what they are buying.

#### Acceptance Criteria

1. WHEN a vendor creates or updates a product, THE System SHALL accept multiple image uploads and associate them with the product via the ProductImage model.
2. THE ProductImage model SHALL store an image URL and an is_primary flag.
3. WHEN a product is retrieved, THE System SHALL include all associated images in the response.

---

### Requirement 8: Cart Management

**User Story:** As a customer, I want to manage a persistent shopping cart, so that I can collect items before purchasing.

#### Acceptance Criteria

1. THE System SHALL automatically create a Cart for each new Customer user upon registration.
2. WHEN an authenticated customer calls `GET /api/cart`, THE System SHALL return the cart contents including all CartItems with product details and the calculated total.
3. WHEN an authenticated customer calls `POST /api/cart/items` with a valid product_id and quantity, THE System SHALL add the item to the cart or increment the quantity if the item already exists.
4. IF a customer attempts to add a product with quantity exceeding available stock, THEN THE System SHALL return a 400 response with a stock availability error.
5. WHEN an authenticated customer calls `PUT /api/cart/items/{id}` with a new quantity, THE System SHALL update the CartItem quantity.
6. WHEN an authenticated customer calls `DELETE /api/cart/items/{id}`, THE System SHALL remove that CartItem from the cart.
7. WHEN an authenticated customer calls `DELETE /api/cart/clear`, THE System SHALL remove all CartItems from the cart.
8. THE System SHALL calculate the cart total as the sum of (product.price * cartitem.quantity) for all items in the cart.
9. IF a customer attempts to add an inactive product to the cart, THEN THE System SHALL return a 400 response.

---

### Requirement 9: Order Checkout and Multi-Vendor Splitting

**User Story:** As a customer, I want to check out my cart in a single operation, so that I can purchase items from multiple vendors simultaneously.

#### Acceptance Criteria

1. WHEN an authenticated customer calls `POST /api/orders/checkout` with a non-empty cart, THE System SHALL create a single Order containing one OrderItem per cart item, each with a vendor FK.
2. WHEN checkout is initiated, THE System SHALL validate that all cart items have sufficient stock before creating the order.
3. IF any cart item has insufficient stock at checkout time, THEN THE System SHALL return a 400 response listing the out-of-stock items and SHALL NOT create any order or decrement any stock.
4. WHEN an order is successfully created, THE System SHALL decrement the stock of each purchased product by the ordered quantity using select_for_update() to prevent race conditions.
5. WHEN an order is successfully created, THE System SHALL clear the customer's cart.
6. THE Order total_amount SHALL equal the sum of (unit_price * quantity) for all OrderItems in that order.
7. THE OrderItem model SHALL store the vendor FK separately to support per-vendor order management.
8. THE OrderItem model SHALL have its own status field (pending/processing/shipped/delivered/cancelled) independent of the parent Order status.
9. THE Order status SHALL be derived from the aggregate of its OrderItem statuses according to defined aggregation rules.
10. WHEN a customer calls `GET /api/orders`, THE System SHALL return a paginated list of that customer's orders.
11. WHEN a customer calls `GET /api/orders/{id}`, THE System SHALL return the full order detail including all OrderItems grouped by vendor.
12. WHEN a customer calls `POST /api/orders/{id}/cancel` for a pending order, THE System SHALL cancel the order, restore stock for all items, and return a 200 response.
13. IF a customer attempts to cancel an order that is not in pending status, THEN THE System SHALL return a 400 response.

---

### Requirement 10: Vendor Order Management

**User Story:** As a vendor, I want to view and manage the order items assigned to me, so that I can fulfill customer orders.

#### Acceptance Criteria

1. WHEN an authenticated vendor calls `GET /api/vendor/orders`, THE System SHALL return only the OrderItems belonging to that vendor.
2. WHEN an authenticated vendor calls `PATCH /api/vendor/orders/{item_id}/status` with a valid status, THE System SHALL update that OrderItem's status.
3. IF a vendor attempts to update an OrderItem that does not belong to them, THEN THE System SHALL return a 403 response.
4. WHEN an OrderItem status is updated, THE System SHALL recalculate and update the parent Order's aggregate status.

---

### Requirement 11: Payment Processing

**User Story:** As a customer, I want to pay for my order, so that the purchase is confirmed and fulfillment begins.

#### Acceptance Criteria

1. WHEN an authenticated customer calls `POST /api/payments/process` with a valid order_id and payment_method, THE System SHALL create a Payment record and simulate payment processing via payment_service.py.
2. WHEN payment simulation succeeds, THE System SHALL update the Payment status to completed and the Order status to confirmed.
3. WHEN payment simulation fails, THE System SHALL update the Payment status to failed and SHALL NOT advance the Order status.
4. WHEN a customer calls `GET /api/payments/{order_id}`, THE System SHALL return the payment details for that order.
5. IF a customer attempts to pay for an order they do not own, THEN THE System SHALL return a 403 response.
6. THE payment_service.py module SHALL provide an abstraction layer so that the payment provider can be swapped without changing the Order or Payment models.
7. WHEN a refund is initiated for a completed payment, THE System SHALL update the Payment status to refunded and restore the Order status to cancelled.
8. THE Payment model SHALL store a transaction_id field for external reference.

---

### Requirement 12: Purchase-Verified Reviews

**User Story:** As a customer, I want to leave reviews only for products I have purchased, so that reviews are trustworthy.

#### Acceptance Criteria

1. WHEN an authenticated customer calls `POST /api/products/{id}/reviews` with a rating and comment, THE System SHALL verify that the customer has a delivered OrderItem for that product before creating the review.
2. IF a customer attempts to review a product they have not purchased and received, THEN THE System SHALL return a 403 response.
3. THE System SHALL enforce that a customer can submit at most one review per product.
4. IF a customer attempts to submit a second review for the same product, THEN THE System SHALL return a 400 response.
5. WHEN a review is created or updated, THE System SHALL recalculate and update the associated vendor's average rating.
6. WHEN any user calls `GET /api/products/{id}/reviews`, THE System SHALL return all reviews for that product with reviewer name and rating.
7. THE Review model SHALL enforce that rating is an integer between 1 and 5 inclusive.

---

### Requirement 13: Analytics and Reporting

**User Story:** As an admin, I want to view platform-wide analytics, so that I can monitor business performance.

#### Acceptance Criteria

1. WHEN an admin calls `GET /api/admin/analytics/overview`, THE System SHALL return total revenue, total orders, total customers, and total vendors.
2. WHEN an admin calls `GET /api/admin/analytics/sales` with optional date range parameters, THE System SHALL return aggregated sales data grouped by day, week, or month.
3. WHEN an admin calls `GET /api/admin/analytics/sales`, THE System SHALL include top 10 vendors by revenue and top 10 products by units sold.
4. IF a non-admin user attempts to access admin analytics endpoints, THEN THE System SHALL return a 403 response.
5. THE SalesRecord model SHALL capture order_id, vendor_id, product_id, quantity, revenue, and timestamp for each completed OrderItem.

---

### Requirement 14: Vendor Analytics

**User Story:** As a vendor, I want to view my own sales analytics, so that I can understand my business performance.

#### Acceptance Criteria

1. WHEN an authenticated vendor calls `GET /api/vendor/analytics`, THE System SHALL return that vendor's total revenue, total orders, and top 5 products by revenue.
2. THE System SHALL filter vendor analytics to include only data belonging to the requesting vendor.
3. IF a non-vendor user attempts to access `/api/vendor/analytics`, THEN THE System SHALL return a 403 response.

---

### Requirement 15: Trending Products

**User Story:** As a customer, I want to see trending products, so that I can discover popular items.

#### Acceptance Criteria

1. WHEN any user calls `GET /api/products/trending`, THE System SHALL return the top 10 products by order count within the last 7 days.
2. THE System SHALL calculate trending scores using a time-windowed count of OrderItems with status not equal to cancelled.
3. THE trending products response SHALL include product name, vendor, price, and order count within the window.

---

### Requirement 16: AI-Powered Recommendations

**User Story:** As a customer, I want to see "customers also bought" recommendations, so that I can discover related products.

#### Acceptance Criteria

1. WHEN any user calls `GET /api/products/{id}/recommendations`, THE System SHALL return up to 5 products that frequently co-occur with the given product in completed orders.
2. THE recommendation_service.py module SHALL compute co-occurrence by counting how many distinct orders contain both the target product and each candidate product.
3. THE System SHALL return recommendations sorted by co-occurrence count in descending order.
4. IF a product has no co-occurrence data, THE System SHALL return an empty recommendations list.

---

### Requirement 17: Performance and Scalability

**User Story:** As a platform operator, I want the API to perform efficiently under load, so that customers have a fast experience.

#### Acceptance Criteria

1. THE System SHALL apply select_related and prefetch_related on all list view querysets that traverse foreign key or reverse foreign key relationships.
2. THE System SHALL define database indexes on all foreign key fields and on status fields used in filtering.
3. THE System SHALL paginate all list endpoints with a default page size of 20 items.
4. THE System SHALL use Django Q objects for all multi-condition filter queries.
5. WHEN a product list query includes filters, THE System SHALL apply all filters in a single database query.

---

### Requirement 18: Security and Access Control

**User Story:** As a platform operator, I want strict access control and input validation, so that the platform is secure and data is protected.

#### Acceptance Criteria

1. THE System SHALL require a valid JWT access token for all endpoints except product listing, product detail, category listing, vendor public profile, and auth endpoints.
2. THE System SHALL implement custom permission classes: IsVendor, IsAdmin, and IsVendorOwner.
3. THE IsVendorOwner permission SHALL verify that the requesting vendor owns the resource being accessed.
4. THE System SHALL use select_for_update() when decrementing product stock during checkout to prevent concurrent overselling.
5. THE System SHALL validate all incoming request data using DRF serializers before processing.
6. THE System SHALL prevent stock from being decremented below zero under any sequence of concurrent requests.
7. WHEN a payment fails, THE System SHALL roll back any stock decrements performed during that checkout attempt.
8. THE JWT access token SHALL expire after 1 hour and the refresh token SHALL expire after 7 days.

---

### Requirement 19: Edge Case Handling

**User Story:** As a platform operator, I want the system to handle edge cases gracefully, so that data integrity is maintained under all conditions.

#### Acceptance Criteria

1. IF all items in a cart are out of stock at checkout, THEN THE System SHALL return a 400 response and SHALL NOT create an order.
2. IF some but not all items in a cart are out of stock at checkout, THEN THE System SHALL return a 400 response listing the unavailable items and SHALL NOT partially fulfill the order.
3. WHEN a payment fails after stock has been decremented, THE System SHALL restore all decremented stock quantities within the same database transaction.
4. WHEN two customers attempt to checkout the last unit of a product simultaneously, THE System SHALL allow exactly one to succeed and return a stock error to the other.
5. IF an order is cancelled after payment, THE System SHALL initiate a refund via payment_service.py and restore stock.
