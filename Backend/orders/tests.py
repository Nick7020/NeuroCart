"""
Unit tests for the orders app.

Covers:
- Cart add / update / remove / clear  (Requirements 4.1–4.7)
- Checkout creates order with correct items and total  (Requirements 5.1–5.5)
- Out-of-stock checkout returns 400  (Requirement 5.2)
- Cart is cleared after successful checkout  (Requirement 5.3)
- Order cancel restores stock  (Requirements 5.10–5.11)
"""
from decimal import Decimal

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import User
from vendors.models import VendorProfile
from products.models import Product, Category
from orders.models import Cart, CartItem, Order, OrderItem


# ---------------------------------------------------------------------------
# Helpers / fixtures
# ---------------------------------------------------------------------------

def make_customer(email="customer@test.com", password="pass1234"):
    return User.objects.create_user(email=email, password=password, role="customer")


def make_vendor_user(email="vendor@test.com", password="pass1234"):
    user = User.objects.create_user(email=email, password=password, role="vendor")
    vendor = VendorProfile.objects.create(
        user=user,
        shop_name="Test Shop",
        verification_status="approved",
    )
    return user, vendor


def make_category():
    return Category.objects.create(name="Electronics", slug="electronics")


def make_product(vendor, category, name="Widget", price="10.00", stock=10):
    return Product.objects.create(
        vendor=vendor,
        category=category,
        name=name,
        description="A test product",
        price=Decimal(price),
        stock=stock,
        is_active=True,
    )


# ---------------------------------------------------------------------------
# Cart tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestCartAdd:
    """POST /api/cart/items — add item or increment quantity."""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category)
        self.client.force_authenticate(user=self.customer)
        self.url = reverse("cart-item-add")

    def test_add_item_creates_cart_and_item(self):
        """Req 4.1 — cart is created on first item add."""
        resp = self.client.post(self.url, {"product_id": str(self.product.id), "quantity": 2})
        assert resp.status_code == 200
        assert Cart.objects.filter(user=self.customer).exists()
        assert CartItem.objects.filter(cart__user=self.customer, product=self.product).exists()

    def test_add_same_product_increments_quantity(self):
        """Req 4.2 — adding an existing product increments quantity."""
        self.client.post(self.url, {"product_id": str(self.product.id), "quantity": 2})
        self.client.post(self.url, {"product_id": str(self.product.id), "quantity": 3})
        item = CartItem.objects.get(cart__user=self.customer, product=self.product)
        assert item.quantity == 5

    def test_add_out_of_stock_returns_400(self):
        """Req 4.4 — adding an out-of-stock product returns 400."""
        self.product.stock = 0
        self.product.save()
        resp = self.client.post(self.url, {"product_id": str(self.product.id), "quantity": 1})
        assert resp.status_code == 400

    def test_add_quantity_exceeding_stock_returns_400(self):
        """Req 4.3 — quantity cannot exceed available stock."""
        resp = self.client.post(self.url, {"product_id": str(self.product.id), "quantity": 999})
        assert resp.status_code == 400

    def test_cart_total_reflects_items(self):
        """Req 4.5 — cart total equals sum of price × quantity."""
        self.client.post(self.url, {"product_id": str(self.product.id), "quantity": 3})
        resp = self.client.get(reverse("cart-detail"))
        assert resp.status_code == 200
        expected_total = Decimal("10.00") * 3
        assert Decimal(str(resp.data["total"])) == expected_total

    def test_unauthenticated_add_returns_401(self):
        self.client.force_authenticate(user=None)
        resp = self.client.post(self.url, {"product_id": str(self.product.id), "quantity": 1})
        assert resp.status_code == 401


@pytest.mark.django_db
class TestCartUpdate:
    """PUT /api/cart/items/{id} — update item quantity."""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category, stock=10)
        self.client.force_authenticate(user=self.customer)
        # Seed a cart item
        self.cart = Cart.objects.create(user=self.customer)
        self.item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

    def test_update_quantity(self):
        url = reverse("cart-item-update", kwargs={"pk": self.item.pk})
        resp = self.client.put(url, {"quantity": 5})
        assert resp.status_code == 200
        self.item.refresh_from_db()
        assert self.item.quantity == 5

    def test_update_quantity_exceeding_stock_returns_400(self):
        url = reverse("cart-item-update", kwargs={"pk": self.item.pk})
        resp = self.client.put(url, {"quantity": 999})
        assert resp.status_code == 400

    def test_update_nonexistent_item_returns_404(self):
        import uuid
        url = reverse("cart-item-update", kwargs={"pk": uuid.uuid4()})
        resp = self.client.put(url, {"quantity": 1})
        assert resp.status_code == 404


@pytest.mark.django_db
class TestCartRemove:
    """DELETE /api/cart/items/{id} — remove a single item."""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category)
        self.client.force_authenticate(user=self.customer)
        self.cart = Cart.objects.create(user=self.customer)
        self.item = CartItem.objects.create(cart=self.cart, product=self.product, quantity=2)

    def test_remove_item(self):
        url = reverse("cart-item-delete", kwargs={"pk": self.item.pk})
        resp = self.client.delete(url)
        assert resp.status_code == 200
        assert not CartItem.objects.filter(pk=self.item.pk).exists()

    def test_remove_returns_updated_cart(self):
        url = reverse("cart-item-delete", kwargs={"pk": self.item.pk})
        resp = self.client.delete(url)
        assert resp.status_code == 200
        assert resp.data["items"] == []

    def test_remove_other_users_item_returns_404(self):
        other = make_customer(email="other@test.com")
        self.client.force_authenticate(user=other)
        url = reverse("cart-item-delete", kwargs={"pk": self.item.pk})
        resp = self.client.delete(url)
        assert resp.status_code == 404


@pytest.mark.django_db
class TestCartClear:
    """DELETE /api/cart/clear — remove all items."""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category)
        self.client.force_authenticate(user=self.customer)
        self.cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=self.cart, product=self.product, quantity=3)

    def test_clear_removes_all_items(self):
        """Req 4.7 — clear endpoint removes all items."""
        resp = self.client.delete(reverse("cart-clear"))
        assert resp.status_code == 200
        assert CartItem.objects.filter(cart=self.cart).count() == 0

    def test_clear_returns_empty_cart(self):
        resp = self.client.delete(reverse("cart-clear"))
        assert resp.data["items"] == []
        assert Decimal(str(resp.data["total"])) == Decimal("0")


# ---------------------------------------------------------------------------
# Checkout tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestCheckout:
    """POST /api/orders/checkout"""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category, price="25.00", stock=10)
        self.client.force_authenticate(user=self.customer)
        self.url = reverse("order-checkout")

    def _seed_cart(self, quantity=2):
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=quantity)
        return cart

    def test_checkout_creates_order(self):
        """Req 5.1/5.3 — successful checkout creates an Order."""
        self._seed_cart(quantity=2)
        resp = self.client.post(self.url, {"payment_method": "cod"})
        assert resp.status_code == 201
        assert Order.objects.filter(user=self.customer).exists()

    def test_checkout_creates_order_items(self):
        """Req 5.3 — OrderItems are created for each cart item."""
        self._seed_cart(quantity=2)
        resp = self.client.post(self.url, {"payment_method": "cod"})
        assert resp.status_code == 201
        order = Order.objects.get(user=self.customer)
        assert order.items.count() == 1

    def test_checkout_order_total_is_correct(self):
        """Req 5.5 — order total equals sum of OrderItem subtotals."""
        self._seed_cart(quantity=3)
        resp = self.client.post(self.url, {"payment_method": "cod"})
        assert resp.status_code == 201
        order = Order.objects.get(user=self.customer)
        expected_total = Decimal("25.00") * 3
        assert order.total_amount == expected_total

    def test_checkout_records_unit_price_snapshot(self):
        """Req 5.4 — OrderItem.unit_price is snapshotted at order time."""
        self._seed_cart(quantity=1)
        self.client.post(self.url, {"payment_method": "cod"})
        order = Order.objects.get(user=self.customer)
        item = order.items.first()
        assert item.unit_price == Decimal("25.00")

    def test_checkout_decrements_stock(self):
        """Req 5.3 — stock is decremented after checkout."""
        self._seed_cart(quantity=4)
        self.client.post(self.url, {"payment_method": "cod"})
        self.product.refresh_from_db()
        assert self.product.stock == 6  # 10 - 4

    def test_checkout_clears_cart(self):
        """Req 5.3 — cart is cleared after successful checkout."""
        cart = self._seed_cart(quantity=2)
        self.client.post(self.url, {"payment_method": "cod"})
        assert CartItem.objects.filter(cart=cart).count() == 0

    def test_checkout_out_of_stock_returns_400(self):
        """Req 5.2 — checkout rejected with 400 if any item is out of stock."""
        self._seed_cart(quantity=2)
        self.product.stock = 0
        self.product.save()
        resp = self.client.post(self.url, {"payment_method": "cod"})
        assert resp.status_code == 400

    def test_checkout_out_of_stock_does_not_create_order(self):
        """Req 5.1 — no order is created when stock validation fails."""
        self._seed_cart(quantity=2)
        self.product.stock = 0
        self.product.save()
        self.client.post(self.url, {"payment_method": "cod"})
        assert not Order.objects.filter(user=self.customer).exists()

    def test_checkout_empty_cart_returns_400(self):
        Cart.objects.create(user=self.customer)  # empty cart
        resp = self.client.post(self.url, {"payment_method": "cod"})
        assert resp.status_code == 400

    def test_checkout_invalid_payment_method_returns_400(self):
        self._seed_cart(quantity=1)
        resp = self.client.post(self.url, {"payment_method": "bitcoin"})
        assert resp.status_code == 400

    def test_checkout_multiple_items_total(self):
        """Req 5.5 — total is correct with multiple distinct products."""
        product2 = make_product(
            self.vendor, self.category, name="Gadget", price="15.00", stock=5
        )
        cart = Cart.objects.create(user=self.customer)
        CartItem.objects.create(cart=cart, product=self.product, quantity=2)
        CartItem.objects.create(cart=cart, product=product2, quantity=3)
        resp = self.client.post(self.url, {"payment_method": "card"})
        assert resp.status_code == 201
        order = Order.objects.get(user=self.customer)
        expected = Decimal("25.00") * 2 + Decimal("15.00") * 3
        assert order.total_amount == expected


# ---------------------------------------------------------------------------
# Order cancel tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestOrderCancel:
    """POST /api/orders/{id}/cancel"""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category, price="20.00", stock=10)
        self.client.force_authenticate(user=self.customer)

    def _create_order(self, quantity=2, order_status="pending"):
        order = Order.objects.create(
            user=self.customer,
            total_amount=Decimal("20.00") * quantity,
            status=order_status,
        )
        OrderItem.objects.create(
            order=order,
            product=self.product,
            vendor=self.vendor,
            quantity=quantity,
            unit_price=Decimal("20.00"),
            subtotal=Decimal("20.00") * quantity,
            status="pending",
        )
        return order

    def test_cancel_pending_order_succeeds(self):
        """Req 5.10 — customer can cancel a pending order."""
        order = self._create_order(quantity=2, order_status="pending")
        url = reverse("order-cancel", kwargs={"pk": order.pk})
        resp = self.client.post(url)
        assert resp.status_code == 200
        order.refresh_from_db()
        assert order.status == "cancelled"

    def test_cancel_confirmed_order_succeeds(self):
        """Req 5.10 — customer can cancel a confirmed order."""
        order = self._create_order(quantity=2, order_status="confirmed")
        url = reverse("order-cancel", kwargs={"pk": order.pk})
        resp = self.client.post(url)
        assert resp.status_code == 200
        order.refresh_from_db()
        assert order.status == "cancelled"

    def test_cancel_restores_stock(self):
        """Req 5.11 — cancellation restores stock for all order items."""
        order = self._create_order(quantity=3, order_status="pending")
        url = reverse("order-cancel", kwargs={"pk": order.pk})
        self.client.post(url)
        self.product.refresh_from_db()
        assert self.product.stock == 13  # 10 + 3

    def test_cancel_shipped_order_returns_400(self):
        """Req 5.10 — cannot cancel a shipped order."""
        order = self._create_order(quantity=2, order_status="shipped")
        url = reverse("order-cancel", kwargs={"pk": order.pk})
        resp = self.client.post(url)
        assert resp.status_code == 400

    def test_cancel_delivered_order_returns_400(self):
        """Req 5.10 — cannot cancel a delivered order."""
        order = self._create_order(quantity=2, order_status="delivered")
        url = reverse("order-cancel", kwargs={"pk": order.pk})
        resp = self.client.post(url)
        assert resp.status_code == 400

    def test_cancel_other_users_order_returns_403(self):
        """Only the order owner can cancel."""
        order = self._create_order(quantity=1, order_status="pending")
        other = make_customer(email="other@test.com")
        self.client.force_authenticate(user=other)
        url = reverse("order-cancel", kwargs={"pk": order.pk})
        resp = self.client.post(url)
        assert resp.status_code == 403
