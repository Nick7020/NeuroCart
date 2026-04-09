from rest_framework import serializers
from .models import Order, OrderItem, ORDER_ITEM_STATUS
from products.serializers import ProductListSerializer
from vendors.serializers import VendorPublicSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """OrderItem with nested product and vendor info."""
    product = ProductListSerializer(read_only=True)
    vendor = VendorPublicSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'vendor', 'quantity', 'unit_price', 'subtotal', 'status')
        read_only_fields = fields


class OrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for order list views."""
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'total_amount', 'status', 'item_count', 'created_at', 'updated_at')
        read_only_fields = fields


class OrderDetailSerializer(serializers.ModelSerializer):
    """Full order detail with all items."""
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'total_amount', 'status', 'items', 'created_at', 'updated_at')
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    """Input serializer for checkout — validates payment_method."""
    PAYMENT_METHOD_CHOICES = ['card', 'upi', 'wallet', 'cod']

    payment_method = serializers.ChoiceField(choices=PAYMENT_METHOD_CHOICES)


class OrderItemStatusUpdateSerializer(serializers.Serializer):
    """Input serializer for vendor updating an order item's status."""
    VALID_TRANSITIONS = {
        'pending': ['processing'],
        'processing': ['shipped'],
        'shipped': ['delivered'],
        'delivered': [],
        'cancelled': [],
    }

    new_status = serializers.ChoiceField(
        choices=[s[0] for s in ORDER_ITEM_STATUS]
    )

    def validate_new_status(self, value):
        order_item = self.context.get('order_item')
        if order_item:
            allowed = self.VALID_TRANSITIONS.get(order_item.status, [])
            if value not in allowed:
                raise serializers.ValidationError(
                    f"Cannot transition from '{order_item.status}' to '{value}'. "
                    f"Allowed transitions: {allowed or 'none'}."
                )
        return value
