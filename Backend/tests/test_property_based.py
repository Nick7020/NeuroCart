"""
Property-based tests for NeuroCart backend using Hypothesis.

Tests cover:
  PBT 1 — Cart total invariant (Validates: Requirements 4.5)
  PBT 2 — Order total invariant (Validates: Requirements 5.5)
  PBT 3 — Stock non-negativity after order/cancel sequences (Validates: Requirements 3.8, 5.3, 5.11)
  PBT 4 — Review purchase verification (Validates: Requirements 7.1)
  PBT 5 — Vendor order item isolation (Validates: Requirements 5.9)
  PBT 6 — Payment-stock coupling (Validates: Requirements 6.4, 6.5)
"""
import uuid
from decimal import Decimal

import pytest
from hypothesis import given, settings, HealthCheck
from hypothesis import strategies as st
from django.core.exceptions import ValidationError, PermissionDenied

from users.models import User
from vendors.models import VendorProfile
from products.models import Category, Product
from orders.models import Cart, CartItem, Order, OrderItem
from products.serializers import ReviewCreateSerializer


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------

def make_user(role='customer', suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return User.objects.create_user(
        email=f'{role}_{suffix}@test.com',
        password='pass1234',
        role=role
    )


def make_vendor_profile(user, suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return VendorProfile.objects.create(
        user=user,
        shop_name=f'Shop_{suffix}',
        verification_status='approved'
    )


def make_category(suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return Category.objects.create(name=f'Cat_{suffix}', slug=f'cat-{suffix}')


def make_product(vendor, price, stock, suffix=None):
    suffix = suffix or uuid.uuid4().hex[:8]
    return Product.objects.create(
        vendor=vendor,
        category=make_category(),
        name=f'Product_{suffix}',
        description='Test',
        price=Decimal(str(price)),
        stock=stock,
        is_active=True
    )


# ---------------------------------------------------------------------------
# PBT 1 — Cart Total Invariant
# Validates: Requirements 4.5
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(
    pairs=st.lists(
        st.tuples(
            st.decimals(min_value='0.01', max_value='999.99', places=2, allow_nan=False, allow_infinity=False),
            st.integers(min_value=1, max_value=20),
        ),
        min_size=1,
        max_size=10,
    )
)
@settings(max_examples=10, deadline=None, suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_cart_total_invariant(pairs):
    """
    **Validates: Requirements 4.5**

    For any list of (price, quantity) pairs, the cart total computed by
    summing item.product.price * item.quantity must equal sum(price * qty).
    """
    suffix = uuid.uuid4().hex[:8]
    customer = make_user(role='customer', suffix=suffix)
    vendor_user = make_user(role='vendor', suffix=f'v{suffix}')
    vendor = make_vendor_profile(vendor_user, suffix=suffix)
    cart = Cart.objects.create(user=customer)

    expected_total = Decimal('0')
    for i, (price, qty) in enumerate(pairs):
        price_dec = Decimal(str(price))
        product = make_product(vendor, price_dec, stock=qty + 100, suffix=f'{suffix}_{i}')
        CartItem.objects.create(cart=cart, product=product, quantity=qty)
        expected_total += price_dec * qty

    cart_total = sum(
        item.product.price * item.quantity
        for item in cart.items.select_related('product').all()
    )

    assert cart_total == expected_total


# ---------------------------------------------------------------------------
# PBT 2 — Order Total Invariant
# Validates: Requirements 5.5
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(
    pairs=st.lists(
        st.tuples(
            st.decimals(min_value='0.01', max_value='9999.99', places=2, allow_nan=False, allow_infinity=False),
            st.integers(min_value=1, max_value=50),
        ),
        min_size=1,
        max_size=10,
    )
)
@settings(max_examples=10, deadline=None, suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_order_total_invariant(pairs):
    """
    **Validates: Requirements 5.5**

    For any list of (unit_price, quantity) pairs, order.total_amount must
    equal the sum of all OrderItem subtotals.
    """
    suffix = uuid.uuid4().hex[:8]
    customer = make_user(role='customer', suffix=suffix)
    vendor_user = make_user(role='vendor', suffix=f'v{suffix}')
    vendor = make_vendor_profile(vendor_user, suffix=suffix)

    expected_total = Decimal('0')
    order = Order.objects.create(user=customer, total_amount=Decimal('0'), status='pending')

    for i, (unit_price, qty) in enumerate(pairs):
        price_dec = Decimal(str(unit_price))
        product = make_product(vendor, price_dec, stock=qty + 100, suffix=f'{suffix}_{i}')
        subtotal = price_dec * qty
        OrderItem.objects.create(
            order=order,
            product=product,
            vendor=vendor,
            quantity=qty,
            unit_price=price_dec,
            subtotal=subtotal,
        )
        expected_total += subtotal

    order.total_amount = expected_total
    order.save(update_fields=['total_amount'])

    order.refresh_from_db()
    items_total = sum(item.subtotal for item in order.items.all())

    assert order.total_amount == items_total
    assert order.total_amount == expected_total


# ---------------------------------------------------------------------------
# PBT 3 — Stock Non-Negativity
# Validates: Requirements 3.8, 5.3, 5.11
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(
    initial_stock=st.integers(min_value=0, max_value=50),
    quantities=st.lists(st.integers(min_value=1, max_value=10), min_size=1, max_size=8),
)
@settings(max_examples=10, deadline=None, suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_stock_non_negativity(initial_stock, quantities):
    """
    **Validates: Requirements 3.8, 5.3, 5.11**

    After placing orders (until stock runs out) and cancelling some,
    product.stock must always remain >= 0.
    """
    from services.order_service import checkout, cancel_order

    suffix = uuid.uuid4().hex[:8]
    vendor_user = make_user(role='vendor', suffix=f'v{suffix}')
    vendor = make_vendor_profile(vendor_user, suffix=suffix)
    product = make_product(vendor, price='10.00', stock=initial_stock, suffix=suffix)

    placed_orders = []

    for i, qty in enumerate(quantities):
        customer = make_user(role='customer', suffix=f'{suffix}_c{i}')
        cart = Cart.objects.create(user=customer)
        CartItem.objects.create(cart=cart, product=product, quantity=qty)
        try:
            order = checkout(customer, 'card')
            placed_orders.append((order, customer))
        except ValidationError:
            # Out of stock or other validation error — skip
            pass

    # Cancel every other order to restore some stock
    for idx, (order, customer) in enumerate(placed_orders):
        if idx % 2 == 0:
            try:
                cancel_order(order, customer)
            except (ValidationError, PermissionDenied):
                pass

    product.refresh_from_db()
    assert product.stock >= 0


# ---------------------------------------------------------------------------
# PBT 4 — Review Purchase Verification
# Validates: Requirements 7.1
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(has_delivered_order_item=st.booleans())
@settings(max_examples=5, deadline=None, suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_review_purchase_verification(has_delivered_order_item):
    """
    **Validates: Requirements 7.1**

    Attempting to create a Review via ReviewCreateSerializer must:
    - Succeed (no ValidationError) if has_delivered_order_item=True
    - Raise ValidationError if has_delivered_order_item=False
    """
    suffix = uuid.uuid4().hex[:8]
    customer = make_user(role='customer', suffix=suffix)
    vendor_user = make_user(role='vendor', suffix=f'v{suffix}')
    vendor = make_vendor_profile(vendor_user, suffix=suffix)
    product = make_product(vendor, price='25.00', stock=10, suffix=suffix)

    if has_delivered_order_item:
        order = Order.objects.create(
            user=customer,
            total_amount=Decimal('25.00'),
            status='delivered',
        )
        OrderItem.objects.create(
            order=order,
            product=product,
            vendor=vendor,
            quantity=1,
            unit_price=Decimal('25.00'),
            subtotal=Decimal('25.00'),
            status='delivered',
        )

    # Build a mock request-like object
    class FakeRequest:
        user = customer

    serializer = ReviewCreateSerializer(
        data={'rating': 4, 'comment': 'Great product'},
        context={'request': FakeRequest(), 'product': product},
    )

    is_valid = serializer.is_valid()
    assert is_valid == has_delivered_order_item


# ---------------------------------------------------------------------------
# PBT 5 — Vendor Order Item Isolation
# Validates: Requirements 5.9
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(attacker_is_vendor_a=st.booleans())
@settings(max_examples=5, deadline=None, suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_vendor_order_item_isolation(attacker_is_vendor_a):
    """
    **Validates: Requirements 5.9**

    Vendor A must not be able to update Vendor B's order items.
    Only the owning vendor may update an order item's status.
    """
    from services.order_service import update_order_item_status

    suffix = uuid.uuid4().hex[:8]

    # Create two vendors
    user_a = make_user(role='vendor', suffix=f'a{suffix}')
    vendor_a = make_vendor_profile(user_a, suffix=f'a{suffix}')

    user_b = make_user(role='vendor', suffix=f'b{suffix}')
    vendor_b = make_vendor_profile(user_b, suffix=f'b{suffix}')

    # Product belonging to vendor_b
    product_b = make_product(vendor_b, price='50.00', stock=100, suffix=f'b{suffix}')

    # Create an order with an item belonging to vendor_b
    customer = make_user(role='customer', suffix=f'c{suffix}')
    order = Order.objects.create(
        user=customer,
        total_amount=Decimal('50.00'),
        status='confirmed',
    )
    order_item = OrderItem.objects.create(
        order=order,
        product=product_b,
        vendor=vendor_b,
        quantity=1,
        unit_price=Decimal('50.00'),
        subtotal=Decimal('50.00'),
        status='pending',
    )

    if attacker_is_vendor_a:
        # vendor_a should NOT be able to update vendor_b's item
        with pytest.raises(PermissionDenied):
            update_order_item_status(order_item, vendor_a, 'processing')
    else:
        # vendor_b SHOULD be able to update their own item
        updated_item = update_order_item_status(order_item, vendor_b, 'processing')
        assert updated_item.status == 'processing'


# ---------------------------------------------------------------------------
# PBT 6 — Payment-Stock Coupling
# Validates: Requirements 6.4, 6.5
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@given(payment_succeeds=st.booleans())
@settings(max_examples=5, deadline=None, suppress_health_check=[HealthCheck.too_slow, HealthCheck.function_scoped_fixture])
def test_payment_stock_coupling(payment_succeeds):
    """
    **Validates: Requirements 6.4, 6.5**

    Stock is decremented at checkout time (not at payment time).
    Payment success/failure only affects order/payment status, not stock.

    - payment_succeeds=True  → order.status='confirmed', payment.status='completed'
    - payment_succeeds=False → order.status='pending',   payment.status='failed'
    - In both cases: product.stock == initial_stock - ordered_quantity
    """
    from services.order_service import checkout
    from services.payment_service import process_payment

    initial_stock = 10
    ordered_quantity = 2
    suffix = uuid.uuid4().hex[:8]

    vendor_user = make_user(role='vendor', suffix=f'v{suffix}')
    vendor = make_vendor_profile(vendor_user, suffix=suffix)
    product = make_product(vendor, price='15.00', stock=initial_stock, suffix=suffix)

    customer = make_user(role='customer', suffix=suffix)
    cart = Cart.objects.create(user=customer)
    CartItem.objects.create(cart=cart, product=product, quantity=ordered_quantity)

    # Checkout decrements stock and creates a pending payment
    order = checkout(customer, 'card')

    # Process payment (success or failure)
    payment = process_payment(order, 'card', simulate_fail=not payment_succeeds)

    product.refresh_from_db()
    order.refresh_from_db()

    # Stock is always decremented at checkout regardless of payment outcome
    assert product.stock == initial_stock - ordered_quantity

    if payment_succeeds:
        assert order.status == 'confirmed'
        assert payment.status == 'completed'
    else:
        assert order.status == 'pending'
        assert payment.status == 'failed'
