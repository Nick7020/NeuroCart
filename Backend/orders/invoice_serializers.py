from rest_framework import serializers
from .models import Invoice
from .serializers import OrderDetailSerializer


class InvoiceSerializer(serializers.ModelSerializer):
    order = OrderDetailSerializer(read_only=True)
    vendor = serializers.CharField(source='vendor.shop_name', read_only=True)

    class Meta:
        model = Invoice
        fields = ('id', 'invoice_number', 'order', 'vendor', 'issued_at', 'total_amount')
        read_only_fields = fields
