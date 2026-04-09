"""
Payment service — payment processing, refund, rollback.
Abstracted to allow future Razorpay/Stripe integration.
"""
from uuid import uuid4
from django.db import transaction
from django.core.exceptions import ValidationError


def get_or_create_payment(order, payment_method):
    """
    Idempotent payment creation.
    Returns (payment, created) tuple — reuses existing Payment if one already exists for the order.
    """
    from payments.models import Payment

    payment, created = Payment.objects.get_or_create(
        order=order,
        defaults={
            'amount': order.total_amount,
            'status': 'pending',
            'payment_method': payment_method,
        }
    )
    return payment, created


def process_payment(order, payment_method, simulate_fail=False):
    """
    Simulate payment processing.
    - Gets or creates a Payment record for the order.
    - If simulate_fail=True: marks payment as failed, leaves order pending.
    - Otherwise: marks payment completed, updates order to confirmed.
    Returns the Payment instance.
    """
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


def refund_payment(payment):
    """
    Mark a completed payment as refunded.
    Raises ValidationError if payment is not in completed status.
    Returns the updated Payment instance.
    """
    if payment.status != 'completed':
        raise ValidationError(
            f"Cannot refund payment with status '{payment.status}'. "
            "Only completed payments can be refunded."
        )

    payment.status = 'refunded'
    payment.save(update_fields=['status'])
    return payment
