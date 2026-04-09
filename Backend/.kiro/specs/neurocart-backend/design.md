# NeuroCart Backend — Design Document

## 1. System Architecture

### App Responsibilities

| App | Responsibility |
|-----|---------------|
| `users` | Custom user model, JWT auth, profile management |
| `vendors` | VendorProfile, verification flow, vendor dashboard |
| `products` | Category, Product, ProductImage, search/filter |
| `orders` | Order, OrderItem, checkout flow, status management |
| `payments` | Payment model, payment_service.py abstraction |
| `analytics_app` | SalesRecord, analytics queries, trending |

### Service Layer (business logic outside views)

```
services/
  order_service.py        — checkout, stock validation, order splitting, status aggregation
  payment_service.py      — payment processing, refund, rollback
  analytics_service.py    — aggregation queries, trend calculations
  recommendation_service.py — co-occurrence recommendations, vendor scoring
```

### Request → Response Data Flow

```
Client Request
  → JWT Middleware (authenticate token, attach user)
  → DRF Permission Classes (role check, resource ownership)
  → View (validate serializer, call service)
  → Service Layer (business logic, DB operations in atomic transaction)
  → Serializer (serialize response)
  → JSON Response
```

---

## 2. Database Design

### 2.1 User Model (`users` app)

```python
class User(AbstractBaseUser, PermissionsMixin):
    id            = UUIDField(primary_key=True, default=uuid4)
    email         = EmailField(unique=True)
    password      = CharField()           # hashed
    role          = CharField(choices=['customer','vendor','admin'], default='customer')
    first_name    = CharField(max_length=100, blank=True)
    last_name     = CharField(max_length=100, blank=True)
    is_active     = BooleanField(default=True)
    is_staff      = BooleanField(default=False)  # Django admin access
    created_at    = DateTimeField(auto_now_add=True)
    updated_at    = DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['role']
```

Indexes: `email` (unique), `role`, `is_active`

### 2.2 VendorProfile Model (`vendors` app)

```python
class VendorProfile(models.Model):
    id                  = UUIDField(primary_key=True, default=uuid4)
    user                = OneToOneField(User, on_delete=CASCADE, related_name='vendor_profile')
    shop_name           = CharField(max_length=255, unique=True)
    description         = TextField(blank=True)
    verification_status = CharField(choices=['pending','approved','rejected'], default='pending')
    rating              = DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_sales         = DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at          = DateTimeField(auto_now_add=True)
    updated_at          = DateTimeField(auto_now=True)
```

Indexes: `user`, `verification_status`

### 2.3 Category Model (`products` app)

```python
class Category(models.Model):
    id              = UUIDField(primary_key=True, default=uuid4)
    name            = CharField(max_length=200)
    slug            = SlugField(unique=True)
    parent_category = ForeignKey('self', null=True, blank=True, on_delete=SET_NULL, related_name='children')
    created_at      = DateTimeField(auto_now_add=True)
```

### 2.4 Product Model (`products` app)

```python
class Product(models.Model):
    id          = UUIDField(primary_key=True, default=uuid4)
    vendor      = ForeignKey(VendorProfile, on_delete=CASCADE, related_name='products')
    category    = ForeignKey(Category, on_delete=SET_NULL, null=True, related_name='products')
    name        = CharField(max_length=500)
    description = TextField()
    price       = DecimalField(max_digits=10, decimal_places=2)
    stock       = PositiveIntegerField(default=0)
    is_active   = BooleanField(default=True)
    created_at  = DateTimeField(auto_now_add=True)
    updated_at  = DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            Index(fields=['vendor']),
            Index(fields=['category']),
            Index(fields=['is_active']),
            Index(fields=['price']),
        ]
```

### 2.5 ProductImage Model (`products` app)

```python
class ProductImage(models.Model):
    id         = UUIDField(primary_key=True, default=uuid4)
    product    = ForeignKey(Product, on_delete=CASCADE, related_name='images')
    image_url  = URLField()
    is_primary = BooleanField(default=False)
    created_at = DateTimeField(auto_now_add=True)
```

### 2.6 Cart Model (`orders` app)

```python
class Cart(models.Model):
    id         = UUIDField(primary_key=True, default=uuid4)
    user       = OneToOneField(User, on_delete=CASCADE, related_name='cart')
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
```

### 2.7 CartItem Model (`orders` app)

```python
class CartItem(models.Model):
    id         = UUIDField(primary_key=True, default=uuid4)
    cart       = ForeignKey(Cart, on_delete=CASCADE, related_name='items')
    product    = ForeignKey(Product, on_delete=CASCADE)
    quantity   = PositiveIntegerField(default=1)
    added_at   = DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('cart', 'product')
```

### 2.8 Order Model (`orders` app)

```python
ORDER_STATUS = [
    ('pending', 'Pending'),
    ('confirmed', 'Confirmed'),
    ('partially_shipped', 'Partially Shipped'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('cancelled', 'Cancelled'),
    ('refunded', 'Refunded'),
]

class Order(models.Model):
    id           = UUIDField(primary_key=True, default=uuid4)
    user         = ForeignKey(User, on_delete=PROTECT, related_name='orders')
    total_amount = DecimalField(max_digits=12, decimal_places=2)
    status       = CharField(choices=ORDER_STATUS, default='pending', max_length=20)
    created_at   = DateTimeField(auto_now_add=True)
    updated_at   = DateTimeField(auto_now=True)

    class Meta:
        indexes = [Index(fields=['user', 'status']), Index(fields=['created_at'])]
```

### 2.9 OrderItem Model (`orders` app)

```python
ORDER_ITEM_STATUS = [
    ('pending', 'Pending'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('cancelled', 'Cancelled'),
]

class OrderItem(models.Model):
    id         = UUIDField(primary_key=True, default=uuid4)
    order      = ForeignKey(Order, on_delete=CASCADE, related_name='items')
    product    = ForeignKey(Product, on_delete=PROTECT)
    vendor     = ForeignKey(VendorProfile, on_delete=PROTECT)
    quantity   = PositiveIntegerField()
    unit_price = DecimalField(max_digits=10, decimal_places=2)  # snapshot at order time
    subtotal   = DecimalField(max_digits=12, decimal_places=2)  # quantity * unit_price
    status     = CharField(choices=ORDER_ITEM_STATUS, default='pending', max_length=20)

    class Meta:
        indexes = [Index(fields=['vendor', 'status']), Index(fields=['order'])]
```

### 2.10 Payment Model (`payments` app)

```python
PAYMENT_STATUS = ['pending', 'completed', 'failed', 'refunded']
PAYMENT_METHODS = ['card', 'upi', 'wallet', 'cod']

class Payment(models.Model):
    id             = UUIDField(primary_key=True, default=uuid4)
    order          = OneToOneField(Order, on_delete=CASCADE, related_name='payment')
    amount         = DecimalField(max_digits=12, decimal_places=2)
    status         = CharField(choices=PAYMENT_STATUS, default='pending', max_length=20)
    payment_method = CharField(choices=PAYMENT_METHODS, max_length=20)
    transaction_id = UUIDField(null=True, blank=True)
    created_at     = DateTimeField(auto_now_add=True)
    updated_at     = DateTimeField(auto_now=True)
```

### 2.11 Review Model (`products` app)

```python
class Review(models.Model):
    id           = UUIDField(primary_key=True, default=uuid4)
    user         = ForeignKey(User, on_delete=CASCADE, related_name='reviews')
    product      = ForeignKey(Product, on_delete=CASCADE, related_name='reviews')
    order_item   = ForeignKey(OrderItem, on_delete=SET_NULL, null=True)  # purchase verification
    rating       = PositiveSmallIntegerField()  # 1-5
    comment      = TextField(max_length=1000, blank=True)
    created_at   = DateTimeField(auto_now_add=True)
    updated_at   = DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'product')
```

### 2.12 SalesRecord Model (`analytics_app`)

```python
class SalesRecord(models.Model):
    id         = UUIDField(primary_key=True, default=uuid4)
    vendor     = ForeignKey(VendorProfile, on_delete=CASCADE, related_name='sales_records')
    order_item = OneToOneField(OrderItem, on_delete=CASCADE)
    revenue    = DecimalField(max_digits=12, decimal_places=2)
    date       = DateField()  # denormalized for fast date-range queries

    class Meta:
        indexes = [Index(fields=['vendor', 'date']), Index(fields=['date'])]
```

---

## 3. Relationship Logic

### Multi-Vendor Order Split

```
User Cart
  └── CartItem (product_A from vendor_1)
  └── CartItem (product_B from vendor_2)
  └── CartItem (product_C from vendor_1)

  → Checkout →

Order (user, total_amount)
  └── OrderItem (product_A, vendor=vendor_1, unit_price snapshot)
  └── OrderItem (product_B, vendor=vendor_2, unit_price snapshot)
  └── OrderItem (product_C, vendor=vendor_1, unit_price snapshot)
```

- vendor_1 sees OrderItems for product_A and product_C only
- vendor_2 sees OrderItem for product_B only
- Each vendor independently updates their item statuses
- Order.status is derived from the aggregate of all OrderItem statuses

### Order Status Aggregation Logic

```python
def aggregate_order_status(order):
    statuses = set(order.items.values_list('status', flat=True))
    if statuses == {'delivered'}:
        return 'delivered'
    if statuses == {'cancelled'}:
        return 'cancelled'
    if 'shipped' in statuses or 'delivered' in statuses:
        return 'partially_shipped'
    if 'processing' in statuses:
        return 'confirmed'
    return order.status  # no change
```

---

## 4. Service Layer Design

### order_service.py

```python
def checkout(user, payment_method) -> Order:
    # 1. Get cart with prefetch
    # 2. Validate all items have stock (select_for_update)
    # 3. atomic transaction:
    #    a. Create Order
    #    b. Create OrderItems (denormalize vendor, snapshot price)
    #    c. Decrement stock
    #    d. Clear cart
    #    e. Create pending Payment
    # 4. Return order

def cancel_order(order, user) -> Order:
    # 1. Validate order belongs to user
    # 2. Validate status is pending or confirmed
    # 3. atomic transaction:
    #    a. Restore stock for all items
    #    b. Update all OrderItems to cancelled
    #    c. Update Order to cancelled
    #    d. Trigger payment refund if payment was completed

def update_order_item_status(order_item, vendor, new_status) -> OrderItem:
    # 1. Validate order_item.vendor == vendor
    # 2. Validate status transition is valid
    # 3. Update OrderItem status
    # 4. Re-aggregate Order status
    # 5. If delivered, create SalesRecord
```

### payment_service.py

```python
def process_payment(order, payment_method, simulate_fail=False) -> Payment:
    # 1. Get or create Payment for order
    # 2. If simulate_fail: mark failed, return
    # 3. Generate transaction_id (UUID)
    # 4. Mark payment completed
    # 5. Update order status to confirmed
    # 6. Return payment

def refund_payment(payment) -> Payment:
    # 1. Validate payment.status == completed
    # 2. Mark payment.status = refunded
    # 3. Return payment
```

### analytics_service.py

```python
def get_admin_overview() -> dict:
    # Aggregate: total revenue, orders, customers, vendors, products

def get_sales_by_period(start_date, end_date, granularity='day') -> list:
    # SalesRecord.objects.filter(date__range=...).annotate(...)

def get_trending_products(days=7, limit=10) -> QuerySet:
    # OrderItem.objects.filter(order__created_at__gte=...).values('product')
    # .annotate(order_count=Count('id')).order_by('-order_count')[:limit]

def get_vendor_analytics(vendor) -> dict:
    # Revenue, order count, top products, daily revenue last 30 days
```

### recommendation_service.py

```python
def get_also_bought(product_id, limit=5) -> QuerySet:
    # Find orders containing this product
    # Find other products in those same orders
    # Rank by co-occurrence frequency
    # Exclude current product and out-of-stock items
    # Cache result for 1 hour

def get_vendor_performance_score(vendor) -> float:
    # score = (vendor.rating * 0.4) + (normalized_sales * 0.6)
```

---

## 5. API Endpoint Reference

### Authentication

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/auth/register` | None | Register new user |
| POST | `/api/auth/login` | None | Login, get JWT tokens |
| POST | `/api/auth/logout` | JWT | Blacklist refresh token |
| POST | `/api/auth/token/refresh` | None | Refresh access token |

### Users

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/users/me` | JWT | Get own profile |
| PUT | `/api/users/me` | JWT | Update own profile |

### Vendors

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/vendors/register` | JWT (vendor role) | Create vendor profile |
| GET | `/api/vendors/{id}` | None | Public vendor profile |
| GET | `/api/vendor/dashboard` | JWT (vendor) | Vendor dashboard stats |
| PUT | `/api/vendor/profile` | JWT (vendor) | Update vendor profile |
| GET | `/api/admin/vendors` | JWT (admin) | List all vendors |
| PATCH | `/api/admin/vendors/{id}/verify` | JWT (admin) | Approve/reject vendor |

### Categories

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/categories` | None | List all categories (tree) |
| POST | `/api/categories` | JWT (admin) | Create category |
| PUT | `/api/categories/{id}` | JWT (admin) | Update category |

### Products

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/products` | None | List products (filter/search/paginate) |
| GET | `/api/products/{id}` | None | Product detail + images + reviews |
| POST | `/api/products` | JWT (approved vendor) | Create product |
| PUT | `/api/products/{id}` | JWT (vendor owner) | Update product |
| DELETE | `/api/products/{id}` | JWT (vendor owner) | Soft-delete product |
| GET | `/api/vendor/products` | JWT (vendor) | Vendor's own products |
| GET | `/api/products/trending` | None | Trending products (last 7 days) |
| GET | `/api/products/{id}/recommendations` | None | Also-bought recommendations |

### Cart

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/cart` | JWT (customer) | Get cart with items and total |
| POST | `/api/cart/items` | JWT (customer) | Add item to cart |
| PUT | `/api/cart/items/{id}` | JWT (customer) | Update item quantity |
| DELETE | `/api/cart/items/{id}` | JWT (customer) | Remove item from cart |
| DELETE | `/api/cart/clear` | JWT (customer) | Clear entire cart |

### Orders

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/orders/checkout` | JWT (customer) | Checkout cart → create order |
| GET | `/api/orders` | JWT (customer) | Customer's order history |
| GET | `/api/orders/{id}` | JWT (customer/admin) | Order detail with items |
| POST | `/api/orders/{id}/cancel` | JWT (customer) | Cancel order |
| GET | `/api/vendor/orders` | JWT (vendor) | Vendor's order items |
| PATCH | `/api/vendor/orders/{item_id}/status` | JWT (vendor) | Update order item status |

### Payments

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| POST | `/api/payments/process` | JWT (customer) | Process payment for order |
| GET | `/api/payments/{order_id}` | JWT (customer/admin) | Get payment details |

### Reviews

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/products/{id}/reviews` | None | List product reviews |
| POST | `/api/products/{id}/reviews` | JWT (customer) | Submit review (purchase required) |
| PUT | `/api/products/{id}/reviews/{review_id}` | JWT (owner) | Update own review |
| DELETE | `/api/products/{id}/reviews/{review_id}` | JWT (owner) | Delete own review |

### Analytics

| Method | URL | Auth | Description |
|--------|-----|------|-------------|
| GET | `/api/admin/analytics/overview` | JWT (admin) | Platform overview stats |
| GET | `/api/admin/analytics/sales` | JWT (admin) | Sales by period |
| GET | `/api/admin/analytics/top-vendors` | JWT (admin) | Top vendors by revenue |
| GET | `/api/vendor/analytics` | JWT (vendor) | Vendor's own analytics |

---

## 6. Permission Matrix

| Role | Products | Cart | Orders | Vendor Dashboard | Admin Panel |
|------|----------|------|--------|-----------------|-------------|
| Anonymous | Read only | ✗ | ✗ | ✗ | ✗ |
| Customer | Read only | Full | Own orders | ✗ | ✗ |
| Vendor (approved) | Own CRUD | ✗ | Own items | Full | ✗ |
| Admin | Full | ✗ | All | All | Full |

### Custom DRF Permission Classes

```python
class IsVendor(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'vendor'

class IsApprovedVendor(BasePermission):
    def has_permission(self, request, view):
        return (request.user.role == 'vendor' and
                hasattr(request.user, 'vendor_profile') and
                request.user.vendor_profile.verification_status == 'approved')

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'admin'

class IsVendorOwner(BasePermission):
    """Object-level: vendor can only modify their own products/order items."""
    def has_object_permission(self, request, view, obj):
        return obj.vendor == request.user.vendor_profile

class IsOrderOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.user == request.user
```

---

## 7. Settings Configuration

### JWT Settings (settings.py)

```python
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

AUTH_USER_MODEL = 'users.User'
```

### Required Packages (requirements.txt)

```
Django>=4.2
djangorestframework>=3.14
djangorestframework-simplejwt>=5.3
django-cors-headers>=4.0
django-filter>=23.0
hypothesis>=6.0          # property-based testing
pytest-django>=4.7
Pillow>=10.0             # image handling
python-decouple>=3.8     # env vars
```

---

## 8. Performance Design

### Query Optimization Patterns

```python
# Product list view
Product.objects.select_related('vendor', 'category').prefetch_related('images').filter(is_active=True)

# Order detail view
Order.objects.select_related('user', 'payment').prefetch_related(
    Prefetch('items', queryset=OrderItem.objects.select_related('product', 'vendor'))
)

# Vendor order items
OrderItem.objects.select_related('order', 'product').filter(vendor=vendor)
```

### Database Indexes Summary

All FK fields are indexed by default in Django. Additional explicit indexes:
- `Product`: `(is_active, category)`, `(vendor, is_active)`, `(price)`
- `Order`: `(user, status)`, `(created_at)`
- `OrderItem`: `(vendor, status)`, `(order)`
- `SalesRecord`: `(vendor, date)`, `(date)`
- `Review`: `(product)`, `(user, product)` unique

### Checkout Concurrency

```python
# In order_service.checkout(), inside atomic():
products = Product.objects.select_for_update().filter(
    id__in=[item.product_id for item in cart_items]
)
# Validate stock, then decrement — no race condition
```

---

## 9. Correctness Properties (Property-Based Testing)

Framework: **Hypothesis** (Python)

### Property 1 — Cart Total Invariant
**Validates: Requirements 4.5**
For any cart with any set of items, cart.total must always equal the sum of (item.product.price × item.quantity) for all items.

```python
@given(st.lists(st.tuples(st.decimals(min_value=0.01, max_value=9999), st.integers(min_value=1, max_value=100))))
def test_cart_total_invariant(price_qty_pairs):
    # Build cart items with given prices and quantities
    # Assert cart.calculate_total() == sum(p * q for p, q in price_qty_pairs)
```

### Property 2 — Order Total Invariant
**Validates: Requirements 5.5**
For any order, order.total_amount must always equal the sum of all OrderItem.subtotal values.

```python
@given(st.lists(st.tuples(st.decimals(min_value=0.01), st.integers(min_value=1, max_value=50))))
def test_order_total_invariant(price_qty_pairs):
    # Build order items, assert order.total == sum(subtotals)
```

### Property 3 — Stock Non-Negativity
**Validates: Requirements 3.8, 5.3, 5.11**
After any sequence of order placements and cancellations, product.stock must never be negative.

```python
@given(st.integers(min_value=0, max_value=100), st.lists(st.integers(min_value=1, max_value=20)))
def test_stock_never_negative(initial_stock, order_quantities):
    # Place orders until stock runs out, cancel some, assert stock >= 0 always
```

### Property 4 — Review Purchase Verification
**Validates: Requirements 7.1**
A user can only submit a review for a product if there exists a delivered OrderItem linking that user to that product.

```python
@given(st.booleans())
def test_review_requires_purchase(has_delivered_order_item):
    # If has_delivered_order_item=False, review submission must raise PermissionDenied
    # If True, review submission must succeed
```

### Property 5 — Vendor Order Item Isolation
**Validates: Requirements 5.9**
A vendor can only see and update OrderItems where order_item.vendor == requesting_vendor.

```python
@given(st.uuids(), st.uuids())
def test_vendor_order_isolation(vendor_a_id, vendor_b_id):
    # Vendor A cannot retrieve or update Vendor B's order items
```

### Property 6 — Payment-Stock Coupling
**Validates: Requirements 6.4, 6.5**
Stock is decremented if and only if payment status is completed. Failed payments must not result in stock changes.

```python
@given(st.booleans())
def test_payment_stock_coupling(payment_succeeds):
    # If payment fails, stock after checkout == stock before checkout
    # If payment succeeds, stock after checkout == stock before - ordered quantity
```

---

## 10. URL Configuration

```python
# config/urls.py
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/users/', include('users.profile_urls')),
    path('api/vendors/', include('vendors.urls')),
    path('api/vendor/', include('vendors.dashboard_urls')),
    path('api/categories/', include('products.category_urls')),
    path('api/products/', include('products.urls')),
    path('api/cart/', include('orders.cart_urls')),
    path('api/orders/', include('orders.urls')),
    path('api/payments/', include('payments.urls')),
    path('api/admin/', include('analytics_app.admin_urls')),
    path('api/vendor/analytics', include('analytics_app.vendor_urls')),
]
```

---

## 11. Django Admin Configuration

Each app's `admin.py` registers models with:
- `list_display` for key fields
- `list_filter` for status/role fields
- `search_fields` for name/email fields
- `readonly_fields` for auto-generated fields (id, created_at)

---

## 12. Error Response Format

All API errors follow a consistent format:

```json
{
  "error": "DESCRIPTIVE_ERROR_CODE",
  "message": "Human-readable description",
  "details": { "field": ["error detail"] }
}
```

Success responses for lists:
```json
{
  "count": 100,
  "next": "http://...",
  "previous": null,
  "results": [...]
}
```
