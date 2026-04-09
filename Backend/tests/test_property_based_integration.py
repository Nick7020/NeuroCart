"""
NeuroCart System Integration — Property-Based Tests (Properties 3, 4, 5, 6, 8, 10, 11, 13, 14, 15, 16, 22, 23)
Uses Hypothesis with @settings(max_examples=100).
"""
import uuid
from decimal import Decimal

import pytest
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st
from rest_framework.test import APIClient

from users.models import User
from vendors.models import VendorProfile
from products.models import Category, Product, ProductImage
from orders.models import Cart, CartItem, Order, OrderItem, Invoice


# ---------------------------------------------------------------------------
# Shared helpers (duplicated here so this file is self-contained)
# ---------------------------------------------------------------------------

def _make_user(role='customer', suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return User.objects.create_user(
        email=f'{role}_{suffix}@test.com',
        password='pass1234',
        role=role,
    )


def _make_vendor_profile(user, suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return VendorProfile.objects.create(
        user=user,
        shop_name=f'Shop_{suffix}',
        verification_status='approved',
    )


def _make_category(suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return Category.objects.create(name=f'Cat_{suffix}', slug=f'cat-{suffix}')


def _make_product(vendor, price='10.00', stock=100, suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return Product.objects.create(
        vendor=vendor,
        category=_make_category(suffix),
        name=f'Product_{suffix}',
        description='Test product',
        price=Decimal(str(price)),
        stock=stock,
        is_active=True,
    )


def _make_order(customer, total='50.00', status='pending', shipping_address=None):
    return Order.objects.create(
        user=customer,
        total_amount=Decimal(str(total)),
        status=status,
        shipping_address=shipping_address,
    )


def _make_order_item(order, product, vendor, status='pending', qty=1, price='10.00'):
    price_dec = Decimal(str(price))
    return OrderItem.objects.create(
        order=order,
        product=product,
        vendor=vendor,
        quantity=qty,
        unit_price=price_dec,
        subtotal=price_dec * qty,
        status=status,
    )


def _admin_client():
    admin = _make_user(role='admin', suffix=uuid.uuid4().hex[:8])
    client = APIClient()
    client.force_authenticate(user=admin)
    return client, admin


def _vendor_client(suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=suffix)
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    client = APIClient()
    client.force_authenticate(user=vendor_user)
    return client, vendor_user, vendor


def _customer_client(suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    customer = _make_user(role='customer', suffix=suffix)
    client = APIClient()
    client.force_authenticate(user=customer)
    return client, customer


# ---------------------------------------------------------------------------
# Property 3 — CartItem serializer includes id
# Feature: neurocart-system-integration, Property 3: CartItem serializer includes id
# Validates: Requirements 2.1, 2.4, 2.5
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(qty=st.integers(min_value=1, max_value=20))
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_3_cart_item_serializer_includes_id(qty):
    # Feature: neurocart-system-integration, Property 3: CartItem serializer includes id
    from orders.cart_serializers import CartItemSerializer

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    product = _make_product(vendor, price='9.99', stock=qty + 10, suffix=suffix)
    customer = _make_user(role='customer', suffix=suffix)
    cart = Cart.objects.create(user=customer)
    cart_item = CartItem.objects.create(cart=cart, product=product, quantity=qty)

    data = CartItemSerializer(cart_item).data

    assert 'id' in data, "CartItemSerializer must include 'id' field"
    assert str(data['id']) == str(cart_item.id), "Serialized 'id' must equal the CartItem UUID PK"


# ---------------------------------------------------------------------------
# Property 4 — Status values are lowercase end-to-end
# Feature: neurocart-system-integration, Property 4: Status values are lowercase end-to-end
# Validates: Requirements 3.3, 3.4, 3.7, 10.1, 10.4
# ---------------------------------------------------------------------------

VALID_LOWERCASE_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
UPPERCASE_VARIANTS = [s.upper() for s in VALID_LOWERCASE_STATUSES]

@pytest.mark.django_db
@given(
    uppercase_status=st.sampled_from(UPPERCASE_VARIANTS),
    lowercase_status=st.sampled_from(VALID_LOWERCASE_STATUSES),
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_4_status_case_validation(uppercase_status, lowercase_status):
    # Feature: neurocart-system-integration, Property 4: Status values are lowercase end-to-end
    from orders.serializers import OrderItemStatusUpdateSerializer

    # Uppercase must be rejected
    bad_serializer = OrderItemStatusUpdateSerializer(data={'new_status': uppercase_status})
    assert not bad_serializer.is_valid(), (
        f"Uppercase status '{uppercase_status}' should be rejected by OrderItemStatusUpdateSerializer"
    )

    # Lowercase must be accepted (transition validation is skipped when no order_item in context)
    good_serializer = OrderItemStatusUpdateSerializer(data={'new_status': lowercase_status})
    assert good_serializer.is_valid(), (
        f"Lowercase status '{lowercase_status}' should be accepted by OrderItemStatusUpdateSerializer. "
        f"Errors: {good_serializer.errors}"
    )


# ---------------------------------------------------------------------------
# Property 5 — Admin analytics overview shape
# Feature: neurocart-system-integration, Property 5: Admin analytics overview shape
# Validates: Requirements 4.1, 4.2, 4.3, 4.4
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(
    num_customers=st.integers(min_value=0, max_value=3),
    num_products=st.integers(min_value=0, max_value=3),
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_5_admin_analytics_overview_shape(num_customers, num_products):
    # Feature: neurocart-system-integration, Property 5: Admin analytics overview shape
    from services.analytics_service import get_admin_overview

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)

    for i in range(num_customers):
        _make_user(role='customer', suffix=f'{suffix}_c{i}')

    for i in range(num_products):
        _make_product(vendor, suffix=f'{suffix}_p{i}')

    result = get_admin_overview()

    # Top-level keys
    assert 'kpis' in result, "get_admin_overview() must return 'kpis' key"
    assert 'salesTrend' in result, "get_admin_overview() must return 'salesTrend' key"
    assert 'orderStatus' in result, "get_admin_overview() must return 'orderStatus' key"
    assert 'vendorStats' in result, "get_admin_overview() must return 'vendorStats' key"

    # kpis sub-keys
    kpis = result['kpis']
    for key in ('revenue', 'orders', 'customers', 'products'):
        assert key in kpis, f"kpis must contain '{key}'"

    # salesTrend is a list
    assert isinstance(result['salesTrend'], list), "salesTrend must be a list"

    # orderStatus is a list
    assert isinstance(result['orderStatus'], list), "orderStatus must be a list"

    # vendorStats is a list
    assert isinstance(result['vendorStats'], list), "vendorStats must be a list"


# ---------------------------------------------------------------------------
# Property 6 — Vendor stats shape and counting invariants
# Feature: neurocart-system-integration, Property 6: Vendor stats shape and counting invariants
# Validates: Requirements 4.5, 14.1, 14.2, 14.3
# ---------------------------------------------------------------------------

ACCEPTED_STATUSES = ('processing', 'shipped', 'delivered')

@pytest.mark.django_db
@given(
    item_statuses=st.lists(
        st.sampled_from(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        min_size=1,
        max_size=8,
    )
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_6_vendor_stats_counting_invariants(item_statuses):
    # Feature: neurocart-system-integration, Property 6: Vendor stats shape and counting invariants
    from services.analytics_service import get_admin_overview

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    product = _make_product(vendor, suffix=suffix)
    customer = _make_user(role='customer', suffix=f'c{suffix}')

    expected_accepted = 0
    expected_rejected = 0

    for i, item_status in enumerate(item_statuses):
        order = _make_order(customer, total='10.00', status='confirmed')
        _make_order_item(order, product, vendor, status=item_status)
        if item_status in ACCEPTED_STATUSES:
            expected_accepted += 1
        elif item_status == 'cancelled':
            expected_rejected += 1

    result = get_admin_overview()
    vendor_stats = result['vendorStats']

    # Find this vendor's entry
    vendor_entry = next(
        (v for v in vendor_stats if v['vendorName'] == vendor.shop_name), None
    )
    assert vendor_entry is not None, f"Vendor '{vendor.shop_name}' must appear in vendorStats"

    # Check required keys
    for key in ('vendorName', 'orders', 'revenue', 'accepted', 'rejected'):
        assert key in vendor_entry, f"vendorStats entry must contain '{key}'"

    # Check counting invariants
    assert vendor_entry['accepted'] == expected_accepted, (
        f"accepted count mismatch: expected {expected_accepted}, got {vendor_entry['accepted']}"
    )
    assert vendor_entry['rejected'] == expected_rejected, (
        f"rejected count mismatch: expected {expected_rejected}, got {vendor_entry['rejected']}"
    )


# ---------------------------------------------------------------------------
# Property 8 — Admin user management state transitions
# Feature: neurocart-system-integration, Property 8: Admin user management state transitions
# Validates: Requirements 5.3, 5.4
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(role=st.sampled_from(['customer', 'vendor']))
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_8_block_unblock_state_transitions(role):
    # Feature: neurocart-system-integration, Property 8: Admin user management state transitions
    suffix = uuid.uuid4().hex[:8]
    target_user = _make_user(role=role, suffix=suffix)
    if role == 'vendor':
        _make_vendor_profile(target_user, suffix=suffix)

    assert target_user.is_active is True, "User should start active"

    client, _ = _admin_client()

    # Block
    block_resp = client.post(f'/api/users/{target_user.id}/block/')
    assert block_resp.status_code == 200, f"Block should return 200, got {block_resp.status_code}"
    target_user.refresh_from_db()
    assert target_user.is_active is False, "User should be inactive after block"

    # Unblock
    unblock_resp = client.post(f'/api/users/{target_user.id}/unblock/')
    assert unblock_resp.status_code == 200, f"Unblock should return 200, got {unblock_resp.status_code}"
    target_user.refresh_from_db()
    assert target_user.is_active is True, "User should be active again after unblock (inverse operation)"


# ---------------------------------------------------------------------------
# Property 10 — Shipping address round-trip
# Feature: neurocart-system-integration, Property 10: Shipping address round-trip
# Validates: Requirements 6.2, 6.3, 6.5
# ---------------------------------------------------------------------------

_address_strategy = st.fixed_dictionaries({
    'name': st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd', 'Zs'))),
    'phone': st.from_regex(r'[6-9]\d{9}', fullmatch=True),
    'street': st.text(min_size=1, max_size=100, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd', 'Zs', 'Po'))),
    'city': st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Zs'))),
    'state': st.text(min_size=1, max_size=50, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Zs'))),
    'pincode': st.from_regex(r'[1-9]\d{5}', fullmatch=True),
})

@pytest.mark.django_db
@given(address=_address_strategy)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_10_shipping_address_round_trip(address):
    # Feature: neurocart-system-integration, Property 10: Shipping address round-trip
    from services.order_service import checkout

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    product = _make_product(vendor, price='20.00', stock=50, suffix=suffix)
    customer = _make_user(role='customer', suffix=suffix)
    cart = Cart.objects.create(user=customer)
    CartItem.objects.create(cart=cart, product=product, quantity=1)

    order = checkout(customer, 'cod', shipping_address=address)

    order.refresh_from_db()
    assert order.shipping_address == address, (
        f"Shipping address round-trip failed: submitted {address}, got {order.shipping_address}"
    )


# ---------------------------------------------------------------------------
# Property 11 — Invoice auto-creation on processing transition
# Feature: neurocart-system-integration, Property 11: Invoice auto-creation on processing transition
# Validates: Requirements 7.2
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(num_items=st.integers(min_value=1, max_value=5))
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_11_invoice_auto_creation_on_processing(num_items):
    # Feature: neurocart-system-integration, Property 11: Invoice auto-creation on processing transition
    from services.order_service import update_order_item_status

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    customer = _make_user(role='customer', suffix=f'c{suffix}')
    order = _make_order(customer, total='100.00', status='confirmed')

    items = []
    for i in range(num_items):
        product = _make_product(vendor, price='10.00', stock=50, suffix=f'{suffix}_p{i}')
        item = _make_order_item(order, product, vendor, status='pending')
        items.append(item)

    # Transition each item to processing — each should create exactly one invoice
    for item in items:
        invoices_before = Invoice.objects.filter(order=order, vendor=vendor).count()
        update_order_item_status(item, vendor, 'processing')
        invoices_after = Invoice.objects.filter(order=order, vendor=vendor).count()
        # Invoice is created once per (order, vendor) pair — subsequent transitions don't duplicate
        assert invoices_after >= 1, "At least one invoice must exist after transitioning to processing"
        assert invoices_after <= invoices_before + 1, "At most one new invoice per transition"

    # Verify exactly one invoice exists for this (order, vendor) pair
    total_invoices = Invoice.objects.filter(order=order, vendor=vendor).count()
    assert total_invoices == 1, (
        f"Exactly one invoice should exist for (order, vendor) pair, got {total_invoices}"
    )

    invoice = Invoice.objects.get(order=order, vendor=vendor)
    assert invoice.invoice_number.startswith('INV-'), "Invoice number must start with 'INV-'"


# ---------------------------------------------------------------------------
# Property 13 — Admin orders list shape and filtering
# Feature: neurocart-system-integration, Property 13: Admin orders list shape and filtering
# Validates: Requirements 8.2, 8.3
# ---------------------------------------------------------------------------

ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']

@pytest.mark.django_db
@given(
    statuses=st.lists(st.sampled_from(ORDER_STATUSES), min_size=1, max_size=6),
    filter_status=st.sampled_from(ORDER_STATUSES),
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_13_admin_orders_list_shape_and_filtering(statuses, filter_status):
    # Feature: neurocart-system-integration, Property 13: Admin orders list shape and filtering
    suffix = uuid.uuid4().hex[:8]
    customer = _make_user(role='customer', suffix=suffix)

    for i, s in enumerate(statuses):
        _make_order(customer, total='25.00', status=s)

    client, _ = _admin_client()
    resp = client.get(f'/api/admin/orders/?status={filter_status}')
    assert resp.status_code == 200, f"Admin orders endpoint returned {resp.status_code}"

    data = resp.json()
    results = data.get('results', data) if isinstance(data, dict) else data

    # All returned orders must have the filtered status
    for order_data in results:
        assert order_data['status'] == filter_status, (
            f"Order with status '{order_data['status']}' returned when filtering for '{filter_status}'"
        )

    # Check required fields on each result
    for order_data in results:
        for field in ('id', 'user', 'total_amount', 'status', 'item_count', 'created_at'):
            assert field in order_data, f"Admin order response missing field '{field}'"


# ---------------------------------------------------------------------------
# Property 14 — Product primary image field
# Feature: neurocart-system-integration, Property 14: Product primary image field
# Validates: Requirements 9.1, 17.3
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(
    num_images=st.integers(min_value=1, max_value=5),
    primary_index=st.integers(min_value=0, max_value=4),
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_14_product_primary_image_field(num_images, primary_index):
    # Feature: neurocart-system-integration, Property 14: Product primary image field
    from products.serializers import ProductListSerializer

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    product = _make_product(vendor, suffix=suffix)

    # Clamp primary_index to valid range
    actual_primary_index = primary_index % num_images

    image_urls = []
    for i in range(num_images):
        url = f'https://example.com/img_{suffix}_{i}.jpg'
        is_primary = (i == actual_primary_index)
        ProductImage.objects.create(product=product, image_url=url, is_primary=is_primary)
        image_urls.append(url)

    data = ProductListSerializer(product).data

    assert 'primary_image' in data, "ProductListSerializer must include 'primary_image' field"
    expected_url = image_urls[actual_primary_index]
    assert data['primary_image'] == expected_url, (
        f"primary_image should be '{expected_url}', got '{data['primary_image']}'"
    )


# ---------------------------------------------------------------------------
# Property 15 — Order item status transition graph
# Feature: neurocart-system-integration, Property 15: Order item status transition graph
# Validates: Requirements 10.2, 10.3
# ---------------------------------------------------------------------------

VALID_TRANSITIONS = {
    'pending': {'processing', 'cancelled'},
    'processing': {'shipped', 'cancelled'},
    'shipped': {'delivered'},
    'delivered': set(),
    'cancelled': set(),
}

ALL_STATUSES = list(VALID_TRANSITIONS.keys())

@pytest.mark.django_db
@given(
    current_status=st.sampled_from(ALL_STATUSES),
    target_status=st.sampled_from(ALL_STATUSES),
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_15_order_item_status_transition_graph(current_status, target_status):
    # Feature: neurocart-system-integration, Property 15: Order item status transition graph
    from services.order_service import update_order_item_status

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    product = _make_product(vendor, suffix=suffix)
    customer = _make_user(role='customer', suffix=f'c{suffix}')
    order = _make_order(customer, status='confirmed')
    item = _make_order_item(order, product, vendor, status=current_status)

    is_valid_transition = target_status in VALID_TRANSITIONS[current_status]

    if is_valid_transition:
        updated = update_order_item_status(item, vendor, target_status)
        assert updated.status == target_status, (
            f"Valid transition {current_status} -> {target_status} should succeed"
        )
    else:
        with pytest.raises((ValidationError, Exception)):
            update_order_item_status(item, vendor, target_status)


# ---------------------------------------------------------------------------
# Property 16 — Chatbot reply for any message
# Feature: neurocart-system-integration, Property 16: Chatbot reply for any message
# Validates: Requirements 11.2, 11.4
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(message=st.text(min_size=1, max_size=200, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd', 'Zs', 'Po', 'Pd'))))
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_16_chatbot_reply_for_any_message(message):
    # Feature: neurocart-system-integration, Property 16: Chatbot reply for any message
    from ai_app.views import _get_bot_reply

    reply = _get_bot_reply(message)

    assert isinstance(reply, str), "Chatbot reply must be a string"
    assert len(reply) > 0, f"Chatbot reply must be non-empty for message: {repr(message)}"


# ---------------------------------------------------------------------------
# Property 22 — Product image round-trip
# Feature: neurocart-system-integration, Property 22: Product image round-trip
# Validates: Requirements 17.2, 17.3
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(
    image_urls=st.lists(
        st.from_regex(r'https://example\.com/img_[a-z0-9]{8}\.jpg', fullmatch=True),
        min_size=1,
        max_size=5,
        unique=True,
    )
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_22_product_image_round_trip(image_urls):
    # Feature: neurocart-system-integration, Property 22: Product image round-trip
    from products.serializers import ProductCreateUpdateSerializer, ProductListSerializer

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    category = _make_category(suffix=suffix)

    serializer = ProductCreateUpdateSerializer(data={
        'name': f'RoundTrip_{suffix}',
        'description': 'Round-trip test product',
        'price': '19.99',
        'stock': 10,
        'category': str(category.id),
        'is_active': True,
        'images': image_urls,
    })
    assert serializer.is_valid(), f"ProductCreateUpdateSerializer errors: {serializer.errors}"

    product = serializer.save(vendor=vendor)

    # Retrieve via ProductListSerializer (same as GET /api/products/{id}/)
    list_data = ProductListSerializer(product).data

    assert 'primary_image' in list_data, "ProductListSerializer must include 'primary_image'"
    assert list_data['primary_image'] == image_urls[0], (
        f"primary_image should equal first submitted URL '{image_urls[0]}', "
        f"got '{list_data['primary_image']}'"
    )


# ---------------------------------------------------------------------------
# Property 23 — Vendor dashboard shape and pending_orders invariant
# Feature: neurocart-system-integration, Property 23: Vendor dashboard shape and pending_orders invariant
# Validates: Requirements 18.1, 18.2, 18.3
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(
    item_statuses=st.lists(
        st.sampled_from(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        min_size=0,
        max_size=8,
    )
)
@settings(max_examples=100, deadline=None,
          suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_property_23_vendor_dashboard_pending_orders_invariant(item_statuses):
    # Feature: neurocart-system-integration, Property 23: Vendor dashboard shape and pending_orders invariant
    from vendors.views import VendorDashboardView

    suffix = uuid.uuid4().hex[:8]
    vendor_user = _make_user(role='vendor', suffix=f'v{suffix}')
    vendor = _make_vendor_profile(vendor_user, suffix=suffix)
    product = _make_product(vendor, suffix=suffix)
    customer = _make_user(role='customer', suffix=f'c{suffix}')

    expected_pending = 0
    for i, s in enumerate(item_statuses):
        order = _make_order(customer, total='10.00', status='confirmed')
        _make_order_item(order, product, vendor, status=s)
        if s == 'pending':
            expected_pending += 1

    view = VendorDashboardView()
    dashboard_data = view._build_dashboard(vendor)

    # Shape check
    for key in ('shop_name', 'total_revenue', 'order_count', 'pending_orders', 'top_products'):
        assert key in dashboard_data, f"Vendor dashboard must contain '{key}'"

    assert dashboard_data['shop_name'] == vendor.shop_name, "shop_name must match vendor's shop_name"
    assert dashboard_data['pending_orders'] == expected_pending, (
        f"pending_orders should be {expected_pending}, got {dashboard_data['pending_orders']}"
    )

    top_products = dashboard_data['top_products']
    assert isinstance(top_products, list), "top_products must be a list"
    assert len(top_products) <= 5, f"top_products must contain at most 5 entries, got {len(top_products)}"
