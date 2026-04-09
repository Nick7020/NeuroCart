"""
Payment service — Razorpay integration + refund/rollback.
"""
import hmac
import hashlib
import json
import logging
import razorpay
from decimal import Decimal
from uuid import uuid4

from django.conf import settings
from django.db import transaction
from django.core.exceptions import ValidationError, PermissionDenied

logger = logging.getLogger('payments')


def _razorpay_client():
    return razorpay.Client(
        auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
    )


# ---------------------------------------------------------------------------
# Razorpay order creation (Step 1 of the two-step flow)
# ---------------------------------------------------------------------------

def create_razorpay_order(order, user):
    """
    Creates a Razorpay order for the given NeuroCart Order.
    Razorpay amounts are in the smallest currency unit (paise for INR).
    Returns the Razorpay order dict: { id, amount, currency, ... }

    Raises:
        PermissionDenied: if order.user != user
        ValidationError: if order.status != 'pending' (code ORDER_NOT_PAYABLE)
        ValidationError: if the Razorpay API call fails
    """
    from payments.models import Payment

    # Ownership check
    if order.user != user:
        raise PermissionDenied("You do not have permission to pay for this order.")

    # Order must be in pending state
    if order.status != 'pending':
        raise ValidationError(
            {'code': 'ORDER_NOT_PAYABLE',
             'detail': f"Order status is '{order.status}'; only 'pending' orders can be paid."}
        )

    # Convert amount using Decimal to avoid floating-point errors
    amount_paise = int(Decimal(str(order.total_amount)) * 100)

    client = _razorpay_client()
    logger.debug(
        "Creating Razorpay order for NeuroCart order %s, amount=%d paise",
        order.id, amount_paise,
    )

    try:
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": str(order.id),
            "payment_capture": 1,  # auto-capture on success
        })
    except razorpay.errors.BadRequestError as exc:
        logger.error(
            "Razorpay API error while creating order for NeuroCart order %s: %s",
            order.id, exc,
        )
        raise ValidationError(str(exc)) from exc
    except Exception as exc:
        logger.error(
            "Unexpected error while creating Razorpay order for NeuroCart order %s: %s",
            order.id, exc,
        )
        raise ValidationError(str(exc)) from exc

    logger.debug(
        "Razorpay order created: razorpay_order_id=%s for NeuroCart order %s",
        razorpay_order.get('id'), order.id,
    )

    # Persist the razorpay_order_id so we can verify later
    payment, _ = Payment.objects.get_or_create(
        order=order,
        defaults={
            'amount': order.total_amount,
            'status': 'pending',
            'payment_method': 'razorpay',
        }
    )
    payment.razorpay_order_id = razorpay_order['id']
    payment.save(update_fields=['razorpay_order_id'])

    return razorpay_order


# ---------------------------------------------------------------------------
# Signature verification + payment capture (Step 2 of the two-step flow)
# ---------------------------------------------------------------------------

def verify_and_capture_payment(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    """
    Verifies the Razorpay webhook signature and marks the payment as completed.
    Raises ValidationError on signature mismatch or if payment record not found.
    Returns the Payment instance.
    """
    from payments.models import Payment

    # 1. Verify HMAC-SHA256 signature (constant-time comparison prevents timing attacks)
    key_bytes = settings.RAZORPAY_KEY_SECRET.encode()
    msg_bytes = f"{razorpay_order_id}|{razorpay_payment_id}".encode()
    expected = hmac.new(key_bytes, msg_bytes, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, razorpay_signature):
        raise ValidationError("Invalid Razorpay signature. Payment verification failed.")

    # 2. Update payment record atomically
    with transaction.atomic():
        try:
            payment = Payment.objects.select_for_update().get(
                razorpay_order_id=razorpay_order_id
            )
        except Payment.DoesNotExist:
            raise ValidationError("PAYMENT_NOT_FOUND")

        # Idempotency: skip writes if already completed
        if payment.status == 'completed':
            return payment

        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = 'completed'
        payment.save(update_fields=['razorpay_payment_id', 'razorpay_signature', 'status'])

        order = payment.order
        order.status = 'confirmed'
        order.save(update_fields=['status'])

    return payment


# ---------------------------------------------------------------------------
# Refund
# ---------------------------------------------------------------------------

def refund_payment(payment):
    """
    Issues a full refund via Razorpay and marks the payment as refunded.
    Raises ValidationError if payment is not completed or has no Razorpay payment ID.
    """
    if payment.status != 'completed':
        raise ValidationError(
            f"Cannot refund payment with status '{payment.status}'. "
            "Only completed payments can be refunded."
        )

    if not payment.razorpay_payment_id:
        raise ValidationError("No Razorpay payment ID found. Cannot issue refund.")

    client = _razorpay_client()
    amount_paise = int(payment.amount * 100)
    client.payment.refund(payment.razorpay_payment_id, {"amount": amount_paise})

    payment.status = 'refunded'
    payment.save(update_fields=['status'])
    return payment


# ---------------------------------------------------------------------------
# Legacy simulate helper (kept for non-Razorpay methods / tests)
# ---------------------------------------------------------------------------

def get_or_create_payment(order, payment_method):
    from payments.models import Payment
    return Payment.objects.get_or_create(
        order=order,
        defaults={
            'amount': order.total_amount,
            'status': 'pending',
            'payment_method': payment_method,
        }
    )


def process_payment(order, payment_method, simulate_fail=False):
    """Simulated payment for non-Razorpay methods (COD, etc.)."""
    with transaction.atomic():
        payment, _ = get_or_create_payment(order, payment_method)

        if simulate_fail:
            payment.status = 'failed'
            payment.save(update_fields=['status'])
            return payment

        payment.transaction_id = uuid4()
        payment.status = 'completed'
        payment.save(update_fields=['transaction_id', 'status'])

        order.status = 'confirmed'
        order.save(update_fields=['status'])

    return payment


# ---------------------------------------------------------------------------
# Webhook event handling (Razorpay server-to-server callbacks)
# ---------------------------------------------------------------------------

def handle_webhook_event(raw_body: bytes, signature: str):
    """
    Validates the Razorpay webhook signature and processes the event.

    Signature verification uses HMAC-SHA256(key=RAZORPAY_WEBHOOK_SECRET, msg=raw_body)
    with constant-time comparison to prevent timing attacks.

    Supported events:
        payment.captured  — idempotently sets Payment → completed, Order → confirmed
        payment.failed    — idempotently sets Payment → failed, Order stays pending

    Returns:
        (True,  "OK")                        on success
        (False, "INVALID_WEBHOOK_SIGNATURE") on signature mismatch
    """
    from payments.models import Payment

    # 1. Verify HMAC-SHA256 signature (constant-time to prevent timing attacks)
    key_bytes = settings.RAZORPAY_WEBHOOK_SECRET.encode()
    expected = hmac.new(key_bytes, raw_body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, signature):
        logger.error(
            "Webhook signature mismatch — expected=%s received=%s",
            expected, signature,
        )
        return False, "INVALID_WEBHOOK_SIGNATURE"

    # 2. Parse JSON payload
    try:
        payload = json.loads(raw_body)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.error("Webhook payload is not valid JSON: %s", exc)
        return False, "INVALID_WEBHOOK_SIGNATURE"

    event = payload.get("event")
    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    razorpay_order_id = payment_entity.get("order_id")

    logger.debug(
        "Webhook received: event=%s razorpay_order_id=%s",
        event, razorpay_order_id,
    )

    # 3. Dispatch on event type
    if event == "payment.captured":
        with transaction.atomic():
            try:
                payment = Payment.objects.select_for_update().get(
                    razorpay_order_id=razorpay_order_id
                )
            except Payment.DoesNotExist:
                logger.error(
                    "Webhook payment.captured: no Payment found for razorpay_order_id=%s",
                    razorpay_order_id,
                )
                return True, "OK"

            # Idempotency: skip if already completed
            if payment.status != "completed":
                payment.status = "completed"
                payment.save(update_fields=["status"])

                order = payment.order
                if order.status != "confirmed":
                    order.status = "confirmed"
                    order.save(update_fields=["status"])

                logger.debug(
                    "Webhook payment.captured: Payment %s → completed, Order %s → confirmed",
                    payment.id, order.id,
                )

    elif event == "payment.failed":
        with transaction.atomic():
            try:
                payment = Payment.objects.select_for_update().get(
                    razorpay_order_id=razorpay_order_id
                )
            except Payment.DoesNotExist:
                logger.error(
                    "Webhook payment.failed: no Payment found for razorpay_order_id=%s",
                    razorpay_order_id,
                )
                return True, "OK"

            # Idempotency: skip if already failed
            if payment.status != "failed":
                payment.status = "failed"
                payment.save(update_fields=["status"])

                logger.debug(
                    "Webhook payment.failed: Payment %s → failed (Order %s stays pending)",
                    payment.id, payment.order_id,
                )
    else:
        logger.debug("Webhook event '%s' not handled — ignoring", event)

    return True, "OK"
