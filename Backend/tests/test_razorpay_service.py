"""
Unit tests for services/payment_service.py — Razorpay integration.

Covers:
  - create_razorpay_order: success, wrong user, non-pending order
  - verify_and_capture_payment: valid sig, invalid sig, idempotency
  - handle_webhook_event: payment.captured idempotency, invalid signature
  - refund_payment: success, non-completed payment guard
"""
import hashlib
import hmac
import json
import uuid
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest
from django.core.exceptions import PermissionDenied, ValidationError
from django.test import override_settings

from orders.models import Order
from payments.models import Payment
from users.models import User

# ---------------------------------------------------------------------------
# Constants used across tests
# ---------------------------------------------------------------------------
TEST_KEY_SECRET = "test_secret_key"
TEST_WEBHOOK_SECRET = "test_webhook_secret"
RAZORPAY_SETTINGS = {
    "RAZORPAY_KEY_ID": "rzp_test_key_id",
    "RAZORPAY_KEY_SECRET": TEST_KEY_SECRET,
    "RAZORPAY_WEBHOOK_SECRET": TEST_WEBHOOK_SECRET,
}


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def customer(db):
    suffix = uuid.uuid4().hex[:8]
    return User.objects.create_user(
        email=f"customer_{suffix}@test.com",
        password="pass1234",
        role="customer",
    )


@pytest.fixture
def other_user(db):
    suffix = uuid.uuid4().hex[:8]
    return User.objects.create_user(
        email=f"other_{suffix}@test.com",
        password="pass1234",
        role="customer",
    )


@pytest.fixture
def pending_order(db, customer):
    return Order.objects.create(
        user=customer,
        total_amount=Decimal("500.00"),
        status="pending",
    )


@pytest.fixture
def confirmed_order(db, customer):
    return Order.objects.create(
        user=customer,
        total_amount=Decimal("500.00"),
        status="confirmed",
    )


@pytest.fixture
def payment_with_razorpay_order(db, pending_order):
    """A Payment that already has a razorpay_order_id (post create-order step)."""
    return Payment.objects.create(
        order=pending_order,
        amount=pending_order.total_amount,
        status="pending",
        payment_method="razorpay",
        razorpay_order_id="order_test123",
    )


@pytest.fixture
def completed_payment(db, pending_order):
    return Payment.objects.create(
        order=pending_order,
        amount=pending_order.total_amount,
        status="completed",
        payment_method="razorpay",
        razorpay_order_id="order_test_completed",
        razorpay_payment_id="pay_test_completed",
        razorpay_signature="sig_completed",
    )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_signature(order_id: str, payment_id: str, secret: str = TEST_KEY_SECRET) -> str:
    """Compute the correct HMAC-SHA256 signature for verify_and_capture_payment."""
    key_bytes = secret.encode()
    msg_bytes = f"{order_id}|{payment_id}".encode()
    return hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest()


def _make_webhook_body_and_sig(event: str, razorpay_order_id: str) -> tuple[bytes, str]:
    """Build a minimal webhook payload and its HMAC signature."""
    payload = {
        "event": event,
        "payload": {
            "payment": {
                "entity": {
                    "order_id": razorpay_order_id,
                }
            }
        },
    }
    raw_body = json.dumps(payload).encode()
    key_bytes = TEST_WEBHOOK_SECRET.encode()
    sig = hmac.new(key_bytes, raw_body, hashlib.sha256).hexdigest()
    return raw_body, sig


# ---------------------------------------------------------------------------
# create_razorpay_order tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_create_razorpay_order_success(pending_order, customer):
    """Mock razorpay.Client; assert razorpay_order_id is persisted on the Payment."""
    from services.payment_service import create_razorpay_order

    fake_razorpay_order = {"id": "order_abc123", "amount": 50000, "currency": "INR"}

    mock_client = MagicMock()
    mock_client.order.create.return_value = fake_razorpay_order

    with patch("services.payment_service._razorpay_client", return_value=mock_client):
        result = create_razorpay_order(pending_order, customer)

    assert result["id"] == "order_abc123"

    payment = Payment.objects.get(order=pending_order)
    assert payment.razorpay_order_id == "order_abc123"
    assert payment.payment_method == "razorpay"

    # Verify the API was called with correct paise amount
    mock_client.order.create.assert_called_once_with({
        "amount": 50000,  # 500.00 INR * 100
        "currency": "INR",
        "receipt": str(pending_order.id),
        "payment_capture": 1,
    })


@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_create_razorpay_order_wrong_user(pending_order, other_user):
    """Assert PermissionDenied is raised when the order belongs to a different user."""
    from services.payment_service import create_razorpay_order

    with pytest.raises(PermissionDenied):
        create_razorpay_order(pending_order, other_user)


@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_create_razorpay_order_not_pending(confirmed_order, customer):
    """Assert ValidationError with ORDER_NOT_PAYABLE when order is not pending."""
    from services.payment_service import create_razorpay_order

    with pytest.raises(ValidationError) as exc_info:
        create_razorpay_order(confirmed_order, customer)

    error = exc_info.value
    # ValidationError message_dict or message should contain ORDER_NOT_PAYABLE
    error_str = str(error)
    assert "ORDER_NOT_PAYABLE" in error_str


# ---------------------------------------------------------------------------
# verify_and_capture_payment tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_verify_valid_signature(payment_with_razorpay_order, pending_order):
    """Compute correct HMAC; assert Payment completed and Order confirmed."""
    from services.payment_service import verify_and_capture_payment

    razorpay_order_id = "order_test123"
    razorpay_payment_id = "pay_xyz789"
    sig = _make_signature(razorpay_order_id, razorpay_payment_id)

    payment = verify_and_capture_payment(razorpay_order_id, razorpay_payment_id, sig)

    assert payment.status == "completed"
    assert payment.razorpay_payment_id == razorpay_payment_id
    assert payment.razorpay_signature == sig

    pending_order.refresh_from_db()
    assert pending_order.status == "confirmed"


@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_verify_invalid_signature(payment_with_razorpay_order, pending_order):
    """Assert ValidationError raised on bad signature; DB must remain unchanged."""
    from services.payment_service import verify_and_capture_payment

    razorpay_order_id = "order_test123"
    razorpay_payment_id = "pay_xyz789"
    bad_sig = "0" * 64  # wrong signature

    with pytest.raises(ValidationError) as exc_info:
        verify_and_capture_payment(razorpay_order_id, razorpay_payment_id, bad_sig)

    assert "Invalid Razorpay signature" in str(exc_info.value)

    # DB must be unchanged
    payment_with_razorpay_order.refresh_from_db()
    assert payment_with_razorpay_order.status == "pending"
    assert payment_with_razorpay_order.razorpay_payment_id is None

    pending_order.refresh_from_db()
    assert pending_order.status == "pending"


@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_verify_idempotent(payment_with_razorpay_order, pending_order):
    """Call verify twice with the same valid signature; assert no duplicate writes."""
    from services.payment_service import verify_and_capture_payment

    razorpay_order_id = "order_test123"
    razorpay_payment_id = "pay_idempotent"
    sig = _make_signature(razorpay_order_id, razorpay_payment_id)

    payment1 = verify_and_capture_payment(razorpay_order_id, razorpay_payment_id, sig)
    first_updated_at = payment1.updated_at

    payment2 = verify_and_capture_payment(razorpay_order_id, razorpay_payment_id, sig)

    # Both calls return the same payment
    assert payment1.id == payment2.id
    assert payment2.status == "completed"

    # Order is confirmed after both calls
    pending_order.refresh_from_db()
    assert pending_order.status == "confirmed"

    # No extra Payment records created
    assert Payment.objects.filter(order=pending_order).count() == 1


# ---------------------------------------------------------------------------
# handle_webhook_event tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_webhook_captured_idempotent(payment_with_razorpay_order, pending_order):
    """Send payment.captured twice; assert final state is correct and no duplicates."""
    from services.payment_service import handle_webhook_event

    raw_body, sig = _make_webhook_body_and_sig("payment.captured", "order_test123")

    ok1, msg1 = handle_webhook_event(raw_body, sig)
    ok2, msg2 = handle_webhook_event(raw_body, sig)

    assert ok1 is True and msg1 == "OK"
    assert ok2 is True and msg2 == "OK"

    payment_with_razorpay_order.refresh_from_db()
    assert payment_with_razorpay_order.status == "completed"

    pending_order.refresh_from_db()
    assert pending_order.status == "confirmed"

    # Still only one Payment record
    assert Payment.objects.filter(order=pending_order).count() == 1


@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_webhook_invalid_signature(payment_with_razorpay_order):
    """Assert returns (False, 'INVALID_WEBHOOK_SIGNATURE') on bad webhook sig."""
    from services.payment_service import handle_webhook_event

    raw_body, _ = _make_webhook_body_and_sig("payment.captured", "order_test123")
    bad_sig = "deadbeef" * 8  # wrong signature

    result, code = handle_webhook_event(raw_body, bad_sig)

    assert result is False
    assert code == "INVALID_WEBHOOK_SIGNATURE"

    # DB must be unchanged
    payment_with_razorpay_order.refresh_from_db()
    assert payment_with_razorpay_order.status == "pending"


# ---------------------------------------------------------------------------
# refund_payment tests
# ---------------------------------------------------------------------------

@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_refund_success(completed_payment):
    """Mock Razorpay refund API; assert payment status becomes 'refunded'."""
    from services.payment_service import refund_payment

    mock_client = MagicMock()
    mock_client.payment.refund.return_value = {"id": "rfnd_test123"}

    with patch("services.payment_service._razorpay_client", return_value=mock_client):
        result = refund_payment(completed_payment)

    assert result.status == "refunded"

    # Verify refund was called with correct paise amount
    expected_paise = int(completed_payment.amount * 100)
    mock_client.payment.refund.assert_called_once_with(
        completed_payment.razorpay_payment_id,
        {"amount": expected_paise},
    )

    completed_payment.refresh_from_db()
    assert completed_payment.status == "refunded"


@pytest.mark.django_db
@override_settings(**RAZORPAY_SETTINGS)
def test_refund_not_completed(payment_with_razorpay_order):
    """Assert ValidationError raised when payment is not completed."""
    from services.payment_service import refund_payment

    assert payment_with_razorpay_order.status == "pending"

    with pytest.raises(ValidationError) as exc_info:
        refund_payment(payment_with_razorpay_order)

    assert "Cannot refund payment with status" in str(exc_info.value)
    assert "pending" in str(exc_info.value)
