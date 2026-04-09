# NeuroCart Backend — Requirements

## Overview

NeuroCart is a production-grade, AI-powered multi-vendor e-commerce platform built with Django and Django REST Framework. It supports customers browsing and purchasing products from multiple vendors in a single checkout, vendors managing their storefronts, and admins overseeing the entire marketplace.

---

## 1. Authentication & User Management

### User Stories

- As a new user, I want to register with my email and password so I can access the platform.
- As a registered user, I want to log in and receive a JWT token so I can make authenticated requests.
- As an authenticated user, I want to refresh my access token so I stay logged in without re-entering credentials.
- As a user, I want to view and update my profile information.
- As an admin, I want to assign roles to users so I can control access levels.

### Acceptance Criteria

1.1 Registration requires a unique email, password (min 8 chars), and role (customer or vendor).
1.2 Passwords are hashed using Django's built-in PBKDF2 hasher; plaintext passwords are never stored.
1.3 Login returns an access token (1-hour expiry) and a refresh token (7-day expiry).
1.4 Token refresh endpoint accepts a valid refresh token and returns a new access token.
1.5 Unauthenticated requests to protected endpoints return HTTP 401.
1.6 Users can only update their own profile; admins can update any profile.
1.7 Role field is immutable after registration except by admin.
1.8 Inactive users (is_active=False) cannot log in.

---

## 2. Vendor System

### User Stories

- As a vendor, I want to register my shop so I can start selling products.
- As a vendor, I want to view my dashboard showing total sales, orders, and top products.
- As an admin, I want to approve or reject vendor applications so only legitimate sellers operate.
- As a customer, I want to view a vendor's public profile and rating.

### Acceptance Criteria

2.1 A user with role=vendor can create a VendorProfile with shop_name and description.
2.2 Newly created vendor profiles have verification_status=pending by default.
2.3 Only admin can change verification_status to approved or rejected.
2.4 Only approved vendors can create or update products.
2.5 Vendor dashboard returns: total revenue, total orders, order item count, top 5 products by revenue.
2.6 Vendor rating is the average of all ratings across all their products' reviews.
2.7 A user can only have one VendorProfile.
2.8 Rejected vendors cannot list products but can re-apply (admin resets to pending).

---

## 3. Product & Category System

### User Stories

- As a vendor, I want to create, update, and delete my products so I can manage my catalog.
- As a customer, I want to browse products filtered by category, price range, and vendor.
- As a customer, I want to search products by name or description.
- As an admin, I want to manage product categories including nested sub-categories.

### Acceptance Criteria

3.1 Categories support a self-referential parent_category field for unlimited nesting depth.
3.2 Products have: name, description, price (positive decimal), stock (non-negative integer), category, is_active, created_at, updated_at.
3.3 Vendors can only create/update/delete their own products.
3.4 Inactive products (is_active=False) are hidden from public listings but visible to the owning vendor.
3.5 Product listings support filtering by: category (including sub-categories), price_min, price_max, vendor_id, in_stock (boolean).
3.6 Product listings support full-text search on name and description fields.
3.7 All product list endpoints are paginated (default 20 items/page, max 100).
3.8 Stock cannot be set to a negative value via API.
3.9 Products support multiple images; one image can be marked as primary.
3.10 Deleting a product with existing order items soft-deletes (is_active=False) rather than hard-deletes.

---

## 4. Cart System

### User Stories

- As a customer, I want to add products to my cart so I can purchase them later.
- As a customer, I want to update item quantities or remove items from my cart.
- As a customer, I want to see my cart total before checkout.

### Acceptance Criteria

4.1 Each authenticated customer has exactly one cart (created on first item add).
4.2 Adding a product that already exists in the cart increments the quantity.
4.3 Cart item quantity must be between 1 and the product's available stock.
4.4 Attempting to add an out-of-stock product returns HTTP 400 with a descriptive error.
4.5 Cart total is always the sum of (product.price × quantity) for all active cart items.
4.6 Removing the last item from a cart leaves the cart empty (not deleted).
4.7 Cart clear endpoint removes all items in one operation.
4.8 Cart reflects real-time product prices (no price snapshot at add time in MVP).
4.9 Inactive or deleted products in cart are excluded from total and flagged in response.

---

## 5. Order System (Multi-Vendor)

### User Stories

- As a customer, I want to checkout my cart and create an order so I can receive my products.
- As a customer, I want to view my order history and individual order details.
- As a customer, I want to cancel a pending order.
- As a vendor, I want to see only the order items that belong to my products.
- As a vendor, I want to update the fulfillment status of my order items.

### Acceptance Criteria

5.1 Checkout validates that all cart items have sufficient stock before creating any order.
5.2 If any item is out of stock, the entire checkout is rejected with item-level error details.
5.3 On successful checkout: Order is created, OrderItems are created (one per cart item with vendor denormalized), stock is decremented, cart is cleared.
5.4 Each OrderItem records: product, vendor, quantity, unit_price (snapshot at order time), subtotal, and its own status.
5.5 Order total_amount equals the sum of all OrderItem subtotals.
5.6 Order status transitions: pending → confirmed (on payment) → shipped → delivered → cancelled/refunded.
5.7 OrderItem status transitions (vendor-controlled): pending → processing → shipped → delivered.
5.8 Order status auto-aggregates: all items delivered → order=delivered; any item cancelled → order reflects partial state.
5.9 Vendors can only update status of OrderItems belonging to their own products.
5.10 Customers can cancel an order only when order status is pending or confirmed.
5.11 Cancellation triggers stock restoration for all order items.
5.12 Concurrent checkout race conditions are prevented using select_for_update() on product stock.

---

## 6. Payment System

### User Stories

- As a customer, I want to pay for my order using a simulated payment so the order is confirmed.
- As a customer, I want a refund when I cancel a confirmed order.
- As an admin, I want to view payment records for all orders.

### Acceptance Criteria

6.1 Each order has exactly one Payment record.
6.2 Payment methods supported: card, upi, wallet, cod.
6.3 Simulated payment: POST /api/payments/process with order_id and payment_method → marks payment completed → updates order to confirmed.
6.4 Payment failure (simulated by passing fail=true) leaves order in pending status and does NOT decrement stock.
6.5 Stock is only decremented after payment is confirmed (not at order creation).
6.6 Refund flow: cancel order → payment status → refunded → stock restored.
6.7 Payment service is abstracted via payment_service.py to allow future Razorpay/Stripe integration.
6.8 Transaction IDs are generated as UUIDs for simulated payments.

---

## 7. Review System

### User Stories

- As a customer, I want to review a product I purchased so I can share my experience.
- As a customer, I want to read reviews for a product before buying.
- As a vendor, I want my overall rating to reflect my product quality.

### Acceptance Criteria

7.1 A user can only review a product if they have a delivered OrderItem for that product.
7.2 A user can submit only one review per product (unique constraint on user + product).
7.3 Rating must be an integer between 1 and 5 inclusive.
7.4 Review comment is optional (max 1000 characters).
7.5 Vendor rating is automatically recalculated as the average of all ratings across all their products after each review submission.
7.6 Reviews are publicly readable without authentication.
7.7 A user can update or delete their own review.
7.8 Review response includes: reviewer username (not email), rating, comment, created_at.

---

## 8. Analytics System

### User Stories

- As an admin, I want to see platform-wide revenue, order counts, and top performers.
- As a vendor, I want to see my own revenue trends and top-selling products.
- As a customer, I want to see trending products on the homepage.

### Acceptance Criteria

8.1 Admin analytics overview returns: total revenue, total orders, total customers, total vendors, total products.
8.2 Admin sales analytics supports time range filtering (daily, weekly, monthly, custom date range).
8.3 Admin analytics returns top 10 vendors by revenue and top 10 products by units sold.
8.4 Vendor analytics returns: own total revenue, order count, top 5 products, revenue by day for last 30 days.
8.5 Trending products are calculated based on order frequency in the last 7 days (configurable window).
8.6 SalesRecord is created for each delivered OrderItem to enable historical analytics.
8.7 Analytics endpoints are read-only and require appropriate role permissions.

---

## 9. Recommendation & AI Features

### User Stories

- As a customer, I want to see "customers also bought" recommendations on product pages.
- As a customer, I want to see trending products on the homepage.

### Acceptance Criteria

9.1 "Customers also bought" is computed from order co-occurrence: products frequently ordered together.
9.2 Recommendations return up to 5 products, excluding the current product and out-of-stock items.
9.3 Trending products endpoint returns top 10 products by order count in the last 7 days.
9.4 Vendor performance score = (average_rating × 0.4) + (normalized_sales_volume × 0.6), used for vendor ranking.
9.5 Recommendation results are cached (Django cache framework, 1-hour TTL) to avoid repeated heavy queries.

---

## 10. Performance Requirements

10.1 All list views use select_related/prefetch_related to avoid N+1 queries.
10.2 Database indexes are defined on: all FK fields, order.status, order.user, order_item.vendor, product.category, product.is_active.
10.3 All list endpoints support pagination (PageNumberPagination, 20/page default, configurable via query param).
10.4 Complex filtering uses Django Q objects; no raw SQL in views.
10.5 Checkout uses database transactions (atomic) to ensure consistency.

---

## 11. Security Requirements

11.1 All non-public endpoints require JWT authentication.
11.2 Custom DRF permissions: IsVendor, IsAdmin, IsVendorOwner (resource-level), IsCustomer.
11.3 Vendors cannot access other vendors' products, orders, or analytics.
11.4 Customers cannot access vendor-only or admin-only endpoints.
11.5 All input is validated through DRF serializers; no raw request.data access in views.
11.6 CORS is configured (currently open for development; restrict in production).
11.7 Secret key and database credentials must be moved to environment variables for production.
11.8 Rate limiting should be applied to auth endpoints (login, register) to prevent brute force.

---

## 12. Admin Capabilities

12.1 Admin can view all users, vendors, products, orders, payments, and reviews.
12.2 Admin can approve/reject vendor applications.
12.3 Admin can deactivate any user account.
12.4 Admin can view platform-wide analytics dashboard.
12.5 Django admin panel is configured for all models with search, filter, and list_display.
