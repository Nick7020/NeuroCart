from rest_framework import serializers
from .models import Payment, PAYMENT_METHODS


class PaymentSerializer(serializers.ModelSerializer):
    """Read-only serializer for the Payment model."""

    class Meta:
        model = Payment
        fields = (
            'id',
            'order',
            'amount',
            'status',
            'payment_method',
            'transaction_id',
            'razorpay_order_id',
            'razorpay_payment_id',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class ProcessPaymentSerializer(serializers.Serializer):
    """Input serializer for processing a payment (non-Razorpay methods)."""
    order_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=[m[0] for m in PAYMENT_METHODS])
    simulate_fail = serializers.BooleanField(default=False, required=False)


class RazorpayOrderSerializer(serializers.Serializer):
    """Input: initiate a Razorpay order for a given NeuroCart order."""
    order_id = serializers.UUIDField()


class RazorpayVerifySerializer(serializers.Serializer):
    """Input: the three tokens returned by the Razorpay checkout modal."""
    razorpay_order_id   = serializers.CharField(max_length=100)
    razorpay_payment_id = serializers.CharField(max_length=100)
    razorpay_signature  = serializers.CharField(max_length=256)
