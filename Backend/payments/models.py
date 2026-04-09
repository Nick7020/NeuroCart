from django.db import models
from uuid import uuid4

PAYMENT_STATUS = [
    ('pending', 'Pending'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ('refunded', 'Refunded'),
]

PAYMENT_METHODS = [
    ('card', 'Card'),
    ('upi', 'UPI'),
    ('wallet', 'Wallet'),
    ('cod', 'Cash on Delivery'),
    ('razorpay', 'Razorpay'),
]


class Payment(models.Model):
    id                  = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    order               = models.OneToOneField(
                            'orders.Order',
                            on_delete=models.CASCADE,
                            related_name='payment'
                          )
    amount              = models.DecimalField(max_digits=12, decimal_places=2)
    status              = models.CharField(choices=PAYMENT_STATUS, default='pending', max_length=20)
    payment_method      = models.CharField(choices=PAYMENT_METHODS, max_length=20)
    transaction_id      = models.UUIDField(null=True, blank=True)  # kept for non-Razorpay methods
    razorpay_order_id   = models.CharField(max_length=100, null=True, blank=True)  # order_xxxxx
    razorpay_payment_id = models.CharField(max_length=100, null=True, blank=True)  # pay_xxxxx
    razorpay_signature  = models.CharField(max_length=256, null=True, blank=True)
    # Future: Razorpay Route (vendor split payments)
    razorpay_transfer_id    = models.CharField(max_length=100, null=True, blank=True)
    vendor_payout_status    = models.CharField(max_length=50,  null=True, blank=True)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment({self.id}, order={self.order_id}, {self.status})"
