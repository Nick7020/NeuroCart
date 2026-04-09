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
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


class ProcessPaymentSerializer(serializers.Serializer):
    """Input serializer for processing a payment."""
    order_id = serializers.UUIDField()
    payment_method = serializers.ChoiceField(choices=[m[0] for m in PAYMENT_METHODS])
    simulate_fail = serializers.BooleanField(default=False, required=False)
