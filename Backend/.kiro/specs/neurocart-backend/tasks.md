 # NeuroCart Backend — Implementation Tasks

## Task Format
- `[ ]` = Not started
- `[-]` = In progress
- `[x]` = Completed

---

## Task 1: Project Setup & Configuration

- [x] 1.1 Create `requirements.txt` with all dependencies (Django, DRF, simplejwt, django-filter, hypothesis, pytest-django, python-decouple, Pillow, django-cors-headers)
- [x] 1.2 Update `config/settings.py`:
  - Set `AUTH_USER_MODEL = 'users.User'`
  - Configure `SIMPLE_JWT` (1hr access, 7day refresh, blacklist enabled)
  - Configure `REST_FRAMEWORK` (JWT auth, IsAuthenticated default, PageNumberPagination 20/page, django-filter backend)
  - Add `rest_framework_simplejwt.token_blacklist` to INSTALLED_APPS
  - Move SECRET_KEY and DB config to environment variables via python-decouple
- [x] 1.3 Create `config/urls.py` with all app URL includes (auth, users, vendors, products, cart, orders, payments, analytics)
- [x] 1.4 Create `services/` directory at project root with `__init__.py`, `order_service.py`, `payment_service.py`, `analytics_service.py`, `recommendation_service.py` (empty stubs)
- [x] 1.5 Create `.env.example` file with all required environment variables

**Done criteria:** `python manage.py check` passes with no errors; JWT settings are loaded correctly.

---

## Task 2: Users App

- [x] 2.1 Implement `users/models.py`:
  - Custom `User` model extending `AbstractBaseUser` + `PermissionsMixin`
  - Fields: id (UUID), email (unique), role (customer/vendor/admin), first_name, last_name, is_active, is_staff, created_at, updated_at
  - Custom `UserManager` with `create_user` and `create_superuser`
- [x] 2.2 Create and run migrations for users app
- [x] 2.3 Implement `users/serializers.py`:
  - `UserRegistrationSerializer` (email, password, role validation)
  - `UserLoginSerializer` (email, password)
  - `UserProfileSerializer` (read/update own profile)
- [x] 2.4 Implement `users/views.py`:
  - `RegisterView` (POST /api/auth/register)
  - `LoginView` (POST /api/auth/login → return JWT pair)
  - `LogoutView` (POST /api/auth/logout → blacklist refresh token)
  - `TokenRefreshView` (POST /api/auth/token/refresh)
  - `UserProfileView` (GET/PUT /api/users/me)
- [x] 2.5 Implement `users/urls.py` and `users/profile_urls.py`
- [x] 2.6 Implement `users/permissions.py` with `IsVendor`, `IsApprovedVendor`, `IsAdmin`, `IsCustomer`, `IsVendorOwner`, `IsOrderOwner`
- [x] 2.7 Register `User` model in `users/admin.py` with list_display, search_fields, list_filter

**Done criteria:** Register, login, logout, token refresh, and profile endpoints all return correct responses; unauthenticated requests to /api/users/me return 401.

---

## Task 3: Vendors App

- [x] 3.1 Implement `vendors/models.py`:
  - `VendorProfile` model (id UUID, user OneToOne, shop_name unique, description, verification_status, rating, total_sales, created_at, updated_at)
- [x] 3.2 Create and run migrations for vendors app
- [x] 3.3 Implement `vendors/serializers.py`:
  - `VendorProfileSerializer` (create/update)
  - `VendorPublicSerializer` (read-only public view)
  - `VendorVerificationSerializer` (admin: update verification_status)
  - `VendorDashboardSerializer` (stats response)
- [x] 3.4 Implement `vendors/views.py`:
  - `VendorRegisterView` (POST /api/vendors/register — vendor role required)
  - `VendorPublicDetailView` (GET /api/vendors/{id} — public)
  - `VendorDashboardView` (GET /api/vendor/dashboard — approved vendor)
  - `VendorProfileUpdateView` (PUT /api/vendor/profile — approved vendor)
  - `AdminVendorListView` (GET /api/admin/vendors — admin)
  - `AdminVendorVerifyView` (PATCH /api/admin/vendors/{id}/verify — admin)
- [x] 3.5 Implement `vendors/urls.py` and `vendors/dashboard_urls.py`
- [x] 3.6 Register `VendorProfile` in `vendors/admin.py`

**Done criteria:** Vendor registration creates profile with pending status; admin can approve; approved vendor can access dashboard; unapproved vendor gets 403 on product creation.

---

## Task 4: Categories & Products App

- [x] 4.1 Implement `products/models.py`:
  - `Category` model (id UUID, name, slug, parent_category self-FK nullable)
  - `Product` model (id UUID, vendor FK, category FK, name, description, price, stock, is_active, created_at, updated_at) with Meta indexes
  - `ProductImage` model (id UUID, product FK, image_url, is_primary)
  - `Review` model (id UUID, user FK, product FK, order_item FK, rating 1-5, comment, unique_together user+product)
- [x] 4.2 Create and run migrations for products app
- [x] 4.3 Implement `products/serializers.py`:
  - `CategorySerializer` (with nested children)
  - `ProductImageSerializer`
  - `ProductListSerializer` (lightweight for list views)
  - `ProductDetailSerializer` (full detail with images and review summary)
  - `ProductCreateUpdateSerializer` (vendor write operations)
  - `ReviewSerializer` (create/read)
- [x] 4.4 Implement `products/filters.py` using django-filter:
  - Filter by: category (include sub-categories), price_min, price_max, vendor_id, in_stock
  - Search on: name, description
- [x] 4.5 Implement `products/views.py`:
  - `CategoryListView` (GET /api/categories — public, tree structure)
  - `CategoryCreateView` (POST /api/categories — admin)
  - `ProductListView` (GET /api/products — public, with filter/search/pagination, select_related)
  - `ProductDetailView` (GET /api/products/{id} — public, with images + reviews)
  - `ProductCreateView` (POST /api/products — approved vendor)
  - `ProductUpdateView` (PUT /api/products/{id} — vendor owner)
  - `ProductDeleteView` (DELETE /api/products/{id} — vendor owner, soft-delete)
  - `VendorProductListView` (GET /api/vendor/products — vendor's own)
  - `TrendingProductsView` (GET /api/products/trending — public)
  - `ProductRecommendationsView` (GET /api/products/{id}/recommendations — public)
  - `ReviewCreateView` (POST /api/products/{id}/reviews — customer, purchase verified)
  - `ReviewListView` (GET /api/products/{id}/reviews — public)
- [x] 4.6 Implement `products/urls.py` and `products/category_urls.py`
- [x] 4.7 Register all models in `products/admin.py`

**Done criteria:** Product list returns paginated results with filter/search working; vendor can only CRUD own products; soft-delete sets is_active=False; trending endpoint returns products ordered by recent order count.

---

## Task 5: Cart App

- [x] 5.1 Add `Cart` and `CartItem` models to `orders/models.py`:
  - `Cart` (id UUID, user OneToOne, created_at, updated_at)
  - `CartItem` (id UUID, cart FK, product FK, quantity, added_at, unique_together cart+product)
- [x] 5.2 Create migrations
- [x] 5.3 Implement `orders/cart_serializers.py`:
  - `CartItemSerializer` (with product detail nested)
  - `CartSerializer` (with items, total calculated field)
  - `AddCartItemSerializer` (product_id, quantity — validates stock)
  - `UpdateCartItemSerializer` (quantity — validates stock)
- [x] 5.4 Implement cart views in `orders/cart_views.py`:
  - `CartDetailView` (GET /api/cart — get or create cart, return with total)
  - `CartItemAddView` (POST /api/cart/items — add or increment)
  - `CartItemUpdateView` (PUT /api/cart/items/{id} — update quantity)
  - `CartItemDeleteView` (DELETE /api/cart/items/{id} — remove item)
  - `CartClearView` (DELETE /api/cart/clear — remove all items)
- [x] 5.5 Implement `orders/cart_urls.py`

**Done criteria:** Cart total always equals sum of price×qty; adding out-of-stock product returns 400; adding existing product increments quantity; clear removes all items.

---

## Task 6: Orders App + order_service.py

- [x] 6.1 Add `Order` and `OrderItem` models to `orders/models.py` with all status choices and Meta indexes
- [x] 6.2 Create migrations
- [x] 6.3 Implement `services/order_service.py`:
  - `checkout(user, payment_method)` — full atomic checkout flow with select_for_update
  - `cancel_order(order, user)` — validate, restore stock, update statuses atomically
  - `update_order_item_status(order_item, vendor, new_status)` — validate ownership, update, re-aggregate order status
  - `aggregate_order_status(order)` — derive order status from item statuses
  - `create_sales_record(order_item)` — called when item is delivered
.- [x] 6.4 Implement `orders/serializers.py`:
  - `OrderItemSerializer` (with product and vendor info)
  - `OrderListSerializer` (lightweight)
  - `OrderDetailSerializer` (full with items)
  - `CheckoutSerializer` (payment_method input)
  - `OrderItemStatusUpdateSerializer` (new_status input with validation)
- [x] 6.5 Implement `orders/views.py`:
  - `CheckoutView` (POST /api/orders/checkout — customer)
  - `OrderListView` (GET /api/orders — customer's own, paginated)
  - `OrderDetailView` (GET /api/orders/{id} — customer/admin)
  - `OrderCancelView` (POST /api/orders/{id}/cancel — customer)
  - `VendorOrderItemListView` (GET /api/vendor/orders — vendor's items, filterable by status)
  - `VendorOrderItemStatusView` (PATCH /api/vendor/orders/{item_id}/status — vendor)
- [x] 6.6 Implement `orders/urls.py`
- [x] 6.7 Register Order and OrderItem in `orders/admin.py`

**Done criteria:** Checkout creates order with correct items and total; stock is decremented; cart is cleared; out-of-stock checkout returns 400 with item-level errors; vendor sees only own items; concurrent checkout does not oversell stock.

---

## Task 7: Payments App + payment_service.py

- [x] 7.1 Implement `payments/models.py`:
  - `Payment` model (id UUID, order OneToOne, amount, status, payment_method, transaction_id UUID nullable, created_at, updated_at)
- [x] 7.2 Create migrations
- [x] 7.3 Implement `services/payment_service.py`:
  - `process_payment(order, payment_method, simulate_fail=False)` — simulate payment, update order status
  - `refund_payment(payment)` — mark refunded
  - `get_or_create_payment(order, payment_method)` — idempotent payment creation
- [x] 7.4 Implement `payments/serializers.py`:
  - `PaymentSerializer` (read)
  - `ProcessPaymentSerializer` (order_id, payment_method, simulate_fail)
- [x] 7.5 Implement `payments/views.py`:
  - `ProcessPaymentView` (POST /api/payments/process — customer)
  - `PaymentDetailView` (GET /api/payments/{order_id} — customer/admin)
- [x] 7.6 Implement `payments/urls.py`
- [x] 7.7 Register Payment in `payments/admin.py`

**Done criteria:** Successful payment marks order as confirmed; failed payment leaves order pending and does not change stock; refund on cancel marks payment as refunded.

---

## Task 8: Reviews App

- [x] 8.1 Review model is already in `products/models.py` (Task 4.1) — verify it's correct
- [x] 8.2 Implement purchase verification logic in `products/serializers.py` ReviewSerializer:
  - On create: check that user has a delivered OrderItem for the product
  - Raise ValidationError if not purchased
- [x] 8.3 Implement review views (already scaffolded in Task 4.5):
  - `ReviewCreateView` — enforce one review per user per product
  - `ReviewUpdateView` (PUT /api/products/{id}/reviews/{review_id} — owner only)
  - `ReviewDeleteView` (DELETE /api/products/{id}/reviews/{review_id} — owner only)
- [x] 8.4 Implement vendor rating recalculation signal in `products/signals.py`:
  - On Review post_save and post_delete: recalculate vendor.rating as average of all product ratings
- [x] 8.5 Register signals in `products/apps.py`

**Done criteria:** Review submission fails if user has no delivered order item for product; duplicate review returns 400; vendor rating updates after each review; reviewer's email is not exposed in response.

---

## Task 9: Analytics App + analytics_service.py

- [x] 9.1 Implement `analytics_app/models.py`:
  - `SalesRecord` (id UUID, vendor FK, order_item OneToOne, revenue, date DateField) with Meta indexes
- [ ] 9.2 Create migrations
- [ ] 9.3 Implement `services/analytics_service.py`:
  - `get_admin_overview()` — total revenue, orders, customers, vendors, products
  - `get_sales_by_period(start_date, end_date, granularity)` — daily/weekly/monthly breakdown
  - `get_top_vendors(limit=10)` — by total revenue
  - `get_top_products(limit=10)` — by units sold
  - `get_vendor_analytics(vendor)` — own revenue, order count, top products, daily revenue last 30 days
  - `get_trending_products(days=7, limit=10)` — by order frequency
- [ ] 9.4 Implement `analytics_app/serializers.py`:
  - `AdminOverviewSerializer`
  - `SalesByPeriodSerializer`
  - `VendorAnalyticsSerializer`
- [ ] 9.5 Implement `analytics_app/views.py`:
  - `AdminOverviewView` (GET /api/admin/analytics/overview — admin)
  - `AdminSalesView` (GET /api/admin/analytics/sales?start=&end=&granularity= — admin)
  - `AdminTopVendorsView` (GET /api/admin/analytics/top-vendors — admin)
  - `VendorAnalyticsView` (GET /api/vendor/analytics — vendor)
- [ ] 9.6 Implement `analytics_app/admin_urls.py` and `analytics_app/vendor_urls.py`
- [ ] 9.7 Register SalesRecord in `analytics_app/admin.py`
- [ ] 9.8 Hook SalesRecord creation into `order_service.create_sales_record()` (called when OrderItem status → delivered)

**Done criteria:** Admin overview returns correct aggregated totals; vendor analytics only shows own data; SalesRecord is created for each delivered order item; trending products reflect last 7 days of orders.

---

## Task 10: Recommendation Service

- [ ] 10.1 Implement `services/recommendation_service.py`:
  - `get_also_bought(product_id, limit=5)` — order co-occurrence algorithm
  - `get_vendor_performance_score(vendor)` — weighted score formula
  - Cache results using Django's cache framework (1-hour TTL)
- [ ] 10.2 Wire `ProductRecommendationsView` (Task 4.5) to call `recommendation_service.get_also_bought()`
- [ ] 10.3 Configure Django cache backend in settings.py (LocMemCache for dev, Redis-ready interface)

**Done criteria:** Recommendations endpoint returns up to 5 co-purchased products; out-of-stock products are excluded; results are cached; vendor performance score is calculated correctly.

---

## Task 11: Performance Optimization

- [ ] 11.1 Audit all list views and add `select_related` / `prefetch_related` where missing:
  - ProductListView: select_related('vendor', 'category'), prefetch_related('images')
  - OrderDetailView: select_related('user', 'payment'), prefetch_related items with select_related
  - VendorOrderItemListView: select_related('order', 'product', 'order__user')
- [ ] 11.2 Verify all Meta.indexes are defined on models (review Task 2-9 models)
- [ ] 11.3 Ensure all list endpoints use `PageNumberPagination` and respect `page_size` query param
- [ ] 11.4 Add `django-debug-toolbar` to dev dependencies for query count monitoring
- [ ] 11.5 Ensure checkout uses `select_for_update()` on product stock (verify Task 6.3)

**Done criteria:** No list view generates more than O(1) queries regardless of result count (N+1 eliminated); all list endpoints return paginated responses.

---

## Task 12: Security Hardening

- [ ] 12.1 Apply correct permission classes to every view (cross-check against permission matrix in design.md)
- [ ] 12.2 Ensure all write serializers validate: positive price, non-negative stock, rating 1-5, quantity >= 1
- [ ] 12.3 Add `IsVendorOwner` object-level permission to ProductUpdateView and ProductDeleteView
- [ ] 12.4 Add `IsOrderOwner` object-level permission to OrderDetailView and OrderCancelView
- [ ] 12.5 Ensure vendor analytics/dashboard views filter by `request.user.vendor_profile` (no vendor_id param injection)
- [ ] 12.6 Add `throttle_classes` to RegisterView and LoginView (AnonRateThrottle: 10/min)
- [ ] 12.7 Update CORS settings: restrict `CORS_ALLOWED_ORIGINS` to known frontend origins (not CORS_ALLOW_ALL_ORIGINS)
- [ ] 12.8 Ensure SECRET_KEY is loaded from environment variable (not hardcoded)

**Done criteria:** All permission tests pass; vendor cannot access another vendor's data; customer cannot access vendor/admin endpoints; rate limiting is active on auth endpoints.

---

## Task 13: Admin Panel Configuration

- [ ] 13.1 `users/admin.py`: UserAdmin with list_display=(email, role, is_active), list_filter=(role, is_active), search_fields=(email,)
- [ ] 13.2 `vendors/admin.py`: VendorProfileAdmin with list_display=(shop_name, verification_status, rating), list_filter=(verification_status,), actions=[approve_vendor, reject_vendor]
- [ ] 13.3 `products/admin.py`: ProductAdmin with list_display=(name, vendor, price, stock, is_active), list_filter=(category, is_active), search_fields=(name,); CategoryAdmin with list_display=(name, parent_category)
- [ ] 13.4 `orders/admin.py`: OrderAdmin with list_display=(id, user, total_amount, status, created_at), list_filter=(status,); OrderItemAdmin with list_display=(order, product, vendor, status)
- [ ] 13.5 `payments/admin.py`: PaymentAdmin with list_display=(order, amount, status, payment_method), list_filter=(status,)
- [ ] 13.6 `analytics_app/admin.py`: SalesRecordAdmin with list_display=(vendor, revenue, date), list_filter=(date,)

**Done criteria:** All models visible and searchable in Django admin; vendor approval action works from admin panel.

---

## Task 14: Testing (Unit + Property-Based)

- [ ] 14.1 Configure `pytest.ini` / `setup.cfg` for pytest-django with `DJANGO_SETTINGS_MODULE`
- [ ] 14.2 Write unit tests for `users` app:
  - Registration with valid/invalid data
  - Login returns JWT tokens
  - Inactive user cannot login
  - Profile update restricted to own profile
- [ ] 14.3 Write unit tests for `vendors` app:
  - Vendor registration creates pending profile
  - Unapproved vendor cannot create products
  - Admin can approve/reject vendor
- [ ] 14.4 Write unit tests for `products` app:
  - Product CRUD by vendor owner
  - Non-owner vendor cannot update product
  - Product filter/search returns correct results
  - Soft-delete sets is_active=False
- [ ] 14.5 Write unit tests for `orders` app:
  - Cart add/update/remove/clear
  - Checkout creates order with correct items and total
  - Out-of-stock checkout returns 400
  - Cart is cleared after successful checkout
  - Order cancel restores stock
- [ ] 14.6 Write unit tests for `payments` app:
  - Successful payment confirms order
  - Failed payment leaves order pending
  - Refund marks payment as refunded
- [ ] 14.7 Write unit tests for `reviews` app:
  - Review requires delivered order item
  - Duplicate review returns 400
  - Vendor rating recalculates after review
- [ ] 14.8 Write property-based tests using Hypothesis:
  - **PBT 1** — Cart total invariant (Validates: Requirements 4.5)
  - **PBT 2** — Order total invariant (Validates: Requirements 5.5)
  - **PBT 3** — Stock non-negativity after order/cancel sequences (Validates: Requirements 3.8, 5.3, 5.11)
  - **PBT 4** — Review purchase verification (Validates: Requirements 7.1)
  - **PBT 5** — Vendor order item isolation (Validates: Requirements 5.9)
  - **PBT 6** — Payment-stock coupling (Validates: Requirements 6.4, 6.5)
- [ ] 14.9 Ensure all tests pass with `pytest --tb=short`

**Done criteria:** All unit tests pass; all 6 property-based tests pass with Hypothesis default settings (100 examples each); test coverage >= 80% on service layer.
