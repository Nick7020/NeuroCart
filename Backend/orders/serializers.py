from rest_framework import serializers
from .models import Order, OrderItem, Invoice, ORDER_ITEM_STATUS
from products.serializers import ProductListSerializer
from vendors.serializers import VendorPublicSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """OrderItem with nested product and vendor info."""
    product = ProductListSerializer(read_only=True)
    vendor = VendorPublicSerializer(read_only=True)
    order = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ('id', 'order', 'product', 'vendor', 'quantity', 'unit_price', 'subtotal', 'status')
        read_only_fields = fields

    def get_order(self, obj):
        return {
            'id': obj.order.id,
            'created_at': obj.order.created_at,
            'user': {
                'first_name': obj.order.user.first_name,
                'last_name': obj.order.user.last_name,
            }
        }


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
        fields = ('id', 'total_amount', 'status', 'shipping_address', 'items', 'created_at', 'updated_at')
        read_only_fields = fields


class CheckoutSerializer(serializers.Serializer):
    """Input serializer for checkout — validates payment_method."""
    PAYMENT_METHOD_CHOICES = ['card', 'upi', 'wallet', 'cod']

    payment_method   = serializers.ChoiceField(choices=PAYMENT_METHOD_CHOICES)
    shipping_address = serializers.DictField(required=False, allow_null=True, default=None)


class AdminOrderListSerializer(serializers.ModelSerializer):
    """Serializer for admin order list — includes user email and item count."""
    user = serializers.EmailField(source='user.email', read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'total_amount', 'status', 'item_count', 'created_at')
        read_only_fields = fields


class OrderItemStatusUpdateSerializer(serializers.Serializer):
    """Input serializer for vendor updating an order item's status."""
    VALID_TRANSITIONS = {
        'pending': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
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


class InvoiceSerializer(serializers.ModelSerializer):
    """Serializer for invoice display."""
    vendor_name = serializers.CharField(source='vendor.business_name', read_only=True)
    customer_name = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.ImageField(source='product.image', read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'vendor_name', 'customer_name', 'product_name',
            'product_image', 'quantity', 'unit_price', 'subtotal', 'tax_amount',
            'total_amount', 'status', 'generated_at', 'due_date'
        ]
        read_only_fields = fields

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}".strip()
