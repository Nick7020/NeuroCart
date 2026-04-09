"""
Unit tests for the payments app.

Covers:
- Successful payment confirms order  (Requirements 6.3)
- Failed payment leaves order pending  (Requirement 6.4)
- Refund marks payment as refunded  (Requirement 6.6)
- API endpoints: ProcessPaymentView, PaymentDetailView
"""
from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.urls import reverse
from rest_framework.test import APIClient

from users.models import User
from vendors.models import VendorProfile
from products.models import Product, Category
from orders.models import Order, OrderItem
from payments.models import Payment
from services.payment_service import process_payment, refund_payment


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_customer(email="customer@test.com", password="pass1234"):
    return User.objects.create_user(email=email, password=password, role="customer")


def make_vendor_user(email="vendor@test.com", password="pass1234", shop_name="Test Shop"):
    user = User.objects.create_user(email=email, password=password, role="vendor")
    vendor = VendorProfile.objects.create(
        user=user,
        shop_name=shop_name,
        verification_status="approved",
    )
    return user, vendor


def make_category():
    return Category.objects.create(name="Electronics", slug="electronics")


def make_product(vendor, category, price="50.00", stock=10):
    return Product.objects.create(
        vendor=vendor,
        category=category,
        name="Test Product",
        description="A test product",
        price=Decimal(price),
        stock=stock,
        is_active=True,
    )


def make_order(customer, total="100.00", status="pending"):
    return Order.objects.create(
        user=customer,
        total_amount=Decimal(total),
        status=status,
    )


def make_order_with_item(customer, vendor, product, quantity=2):
    """Create a pending order with one order item."""
    total = product.price * quantity
    order = Order.objects.create(
        user=customer,
        total_amount=total,
        status="pending",
    )
    OrderItem.objects.create(
        order=order,
        product=product,
        vendor=vendor,
        quantity=quantity,
        unit_price=product.price,
        subtotal=total,
        status="pending",
    )
    return order


# ---------------------------------------------------------------------------
# Service-layer tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestProcessPaymentService:
    """Direct tests of services/payment_service.process_payment()."""

    def setup_method(self):
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category)

    def test_successful_payment_creates_payment_record(self):
        """Req 6.1 — each order has exactly one Payment record after processing."""
        order = make_order(self.customer)
        payment = process_payment(order, "card")
        assert Payment.objects.filter(order=order).count() == 1
        assert payment.order == order

    def test_successful_payment_status_is_completed(self):
        """Req 6.3 — successful payment marks payment as completed."""
        order = make_order(self.customer)
        payment = process_payment(order, "card")
        assert payment.status == "completed"

    def test_successful_payment_sets_transaction_id(self):
        """Req 6.8 — transaction_id is a UUID set on successful payment."""
        order = make_order(self.customer)
        payment = process_payment(order, "upi")
        assert payment.transaction_id is not None

    def test_successful_payment_confirms_order(self):
        """Req 6.3 — successful payment updates order status to confirmed."""
        order = make_order(self.customer)
        process_payment(order, "card")
        order.refresh_from_db()
        assert order.status == "confirmed"

    def test_failed_payment_status_is_failed(self):
        """Req 6.4 — simulate_fail=True marks payment as failed."""
        order = make_order(self.customer)
        payment = process_payment(order, "card", simulate_fail=True)
        assert payment.status == "failed"

    def test_failed_payment_leaves_order_pending(self):
        """Req 6.4 — failed payment does NOT change order status."""
        order = make_order(self.customer)
        process_payment(order, "card", simulate_fail=True)
        order.refresh_from_db()
        assert order.status == "pending"

    def test_failed_payment_has_no_transaction_id(self):
        """Req 6.4 — failed payment does not generate a transaction_id."""
        order = make_order(self.customer)
        payment = process_payment(order, "card", simulate_fail=True)
        assert payment.transaction_id is None

    def test_process_payment_is_idempotent(self):
        """Req 6.1 — calling process_payment twice reuses the same Payment record."""
        order = make_order(self.customer)
        process_payment(order, "card")
        process_payment(order, "card")
        assert Payment.objects.filter(order=order).count() == 1

    def test_payment_amount_matches_order_total(self):
        """Payment amount is set from order.total_amount."""
        order = make_order(self.customer, total="250.00")
        payment = process_payment(order, "wallet")
        assert payment.amount == Decimal("250.00")

    def test_all_payment_methods_accepted(self):
        """Req 6.2 — card, upi, wallet, cod are all valid payment methods."""
        for method in ("card", "upi", "wallet", "cod"):
            customer = make_customer(email=f"{method}@test.com")
            order = make_order(customer)
            payment = process_payment(order, method)
            assert payment.payment_method == method


@pytest.mark.django_db
class TestRefundPaymentService:
    """Direct tests of services/payment_service.refund_payment()."""

    def setup_method(self):
        self.customer = make_customer()

    def test_refund_completed_payment_marks_refunded(self):
        """Req 6.6 — refund_payment sets status to refunded."""
        order = make_order(self.customer)
        payment = process_payment(order, "card")
        refunded = refund_payment(payment)
        assert refunded.status == "refunded"

    def test_refund_persists_to_db(self):
        """Refund status is saved to the database."""
        order = make_order(self.customer)
        payment = process_payment(order, "card")
        refund_payment(payment)
        payment.refresh_from_db()
        assert payment.status == "refunded"

    def test_refund_pending_payment_raises_error(self):
        """Cannot refund a payment that is still pending."""
        order = make_order(self.customer)
        payment, _ = Payment.objects.get_or_create(
            order=order,
            defaults={"amount": order.total_amount, "status": "pending", "payment_method": "card"},
        )
        with pytest.raises(ValidationError):
            refund_payment(payment)

    def test_refund_failed_payment_raises_error(self):
        """Cannot refund a payment that failed."""
        order = make_order(self.customer)
        payment = process_payment(order, "card", simulate_fail=True)
        with pytest.raises(ValidationError):
            refund_payment(payment)

    def test_refund_already_refunded_payment_raises_error(self):
        """Cannot refund a payment that is already refunded."""
        order = make_order(self.customer)
        payment = process_payment(order, "card")
        refund_payment(payment)
        with pytest.raises(ValidationError):
            refund_payment(payment)


# ---------------------------------------------------------------------------
# API endpoint tests — ProcessPaymentView
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestProcessPaymentView:
    """POST /api/payments/process"""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category)
        self.client.force_authenticate(user=self.customer)
        self.url = reverse("payment-process")

    def test_successful_payment_returns_200(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        assert resp.status_code == 200

    def test_successful_payment_response_has_completed_status(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        assert resp.data["status"] == "completed"

    def test_successful_payment_response_has_transaction_id(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        assert resp.data["transaction_id"] is not None

    def test_successful_payment_confirms_order(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        order.refresh_from_db()
        assert order.status == "confirmed"

    def test_failed_payment_returns_200_with_failed_status(self):
        """Req 6.4 — simulate_fail=True returns failed payment."""
        order = make_order_with_item(self.customer, self.vendor, self.product)
        resp = self.client.post(
            self.url,
            {"order_id": str(order.id), "payment_method": "card", "simulate_fail": True},
        )
        assert resp.status_code == 200
        assert resp.data["status"] == "failed"

    def test_failed_payment_leaves_order_pending(self):
        """Req 6.4 — order stays pending after failed payment."""
        order = make_order_with_item(self.customer, self.vendor, self.product)
        self.client.post(
            self.url,
            {"order_id": str(order.id), "payment_method": "card", "simulate_fail": True},
        )
        order.refresh_from_db()
        assert order.status == "pending"

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        order = make_order_with_item(self.customer, self.vendor, self.product)
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        assert resp.status_code == 401

    def test_vendor_cannot_process_payment(self):
        """Only customers can process payments."""
        vendor_user, _ = make_vendor_user(email="v2@test.com", shop_name="Other Shop")
        self.client.force_authenticate(user=vendor_user)
        order = make_order_with_item(self.customer, self.vendor, self.product)
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        assert resp.status_code == 403

    def test_customer_cannot_pay_other_users_order(self):
        """Customer can only pay their own orders."""
        other = make_customer(email="other@test.com")
        order = make_order_with_item(other, self.vendor, self.product)
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        assert resp.status_code == 404

    def test_already_confirmed_order_returns_400(self):
        """Cannot pay an already-confirmed order."""
        order = make_order(self.customer, status="confirmed")
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "card"})
        assert resp.status_code == 400

    def test_invalid_payment_method_returns_400(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        resp = self.client.post(self.url, {"order_id": str(order.id), "payment_method": "bitcoin"})
        assert resp.status_code == 400

    def test_missing_order_id_returns_400(self):
        resp = self.client.post(self.url, {"payment_method": "card"})
        assert resp.status_code == 400


# ---------------------------------------------------------------------------
# API endpoint tests — PaymentDetailView
# ---------------------------------------------------------------------------

@pytest.mark.django_db
class TestPaymentDetailView:
    """GET /api/payments/{order_id}"""

    def setup_method(self):
        self.client = APIClient()
        self.customer = make_customer()
        _, self.vendor = make_vendor_user()
        self.category = make_category()
        self.product = make_product(self.vendor, self.category)
        self.client.force_authenticate(user=self.customer)

    def _process_and_get_url(self, order):
        process_payment(order, "card")
        return reverse("payment-detail", kwargs={"order_id": order.id})

    def test_customer_can_view_own_payment(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        url = self._process_and_get_url(order)
        resp = self.client.get(url)
        assert resp.status_code == 200
        assert resp.data["status"] == "completed"

    def test_response_contains_expected_fields(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        url = self._process_and_get_url(order)
        resp = self.client.get(url)
        for field in ("id", "order", "amount", "status", "payment_method", "transaction_id"):
            assert field in resp.data

    def test_customer_cannot_view_other_users_payment(self):
        other = make_customer(email="other@test.com")
        order = make_order_with_item(other, self.vendor, self.product)
        url = self._process_and_get_url(order)
        resp = self.client.get(url)
        assert resp.status_code == 403

    def test_admin_can_view_any_payment(self):
        admin = User.objects.create_user(email="admin@test.com", password="pass1234", role="admin")
        order = make_order_with_item(self.customer, self.vendor, self.product)
        url = self._process_and_get_url(order)
        self.client.force_authenticate(user=admin)
        resp = self.client.get(url)
        assert resp.status_code == 200

    def test_vendor_cannot_view_payment(self):
        vendor_user, _ = make_vendor_user(email="v2@test.com", shop_name="Other Shop")
        order = make_order_with_item(self.customer, self.vendor, self.product)
        url = self._process_and_get_url(order)
        self.client.force_authenticate(user=vendor_user)
        resp = self.client.get(url)
        assert resp.status_code == 403

    def test_unauthenticated_returns_401(self):
        order = make_order_with_item(self.customer, self.vendor, self.product)
        url = self._process_and_get_url(order)
        self.client.force_authenticate(user=None)
        resp = self.client.get(url)
        assert resp.status_code == 401

    def test_nonexistent_order_returns_404(self):
        import uuid
        url = reverse("payment-detail", kwargs={"order_id": uuid.uuid4()})
        resp = self.client.get(url)
        assert resp.status_code == 404
