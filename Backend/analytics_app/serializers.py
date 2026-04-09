from rest_framework import serializers


# --- Admin Overview nested serializers ---

class KpisSerializer(serializers.Serializer):
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    orders = serializers.IntegerField()
    customers = serializers.IntegerField()
    products = serializers.IntegerField()


class SalesTrendItemSerializer(serializers.Serializer):
    date = serializers.CharField()  # ISO date string YYYY-MM-DD
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    orders = serializers.IntegerField()


class OrderStatusItemSerializer(serializers.Serializer):
    status = serializers.CharField()
    count = serializers.IntegerField()


class VendorStatSerializer(serializers.Serializer):
    vendorName = serializers.CharField()
    orders = serializers.IntegerField()
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    accepted = serializers.IntegerField()
    rejected = serializers.IntegerField()


class AdminOverviewSerializer(serializers.Serializer):
    kpis = KpisSerializer()
    salesTrend = SalesTrendItemSerializer(many=True)
    orderStatus = OrderStatusItemSerializer(many=True)
    vendorStats = VendorStatSerializer(many=True)
    # Top-level vendor KPI fields for AdminDashboard vendor cards
    vendorRevenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    vendorOrders = serializers.IntegerField()
    totalVendors = serializers.IntegerField()


class SalesByPeriodSerializer(serializers.Serializer):
    period = serializers.DateTimeField()
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_orders = serializers.IntegerField()


class TopProductSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    product_name = serializers.CharField()
    units_sold = serializers.IntegerField()


class DailyRevenueSerializer(serializers.Serializer):
    date = serializers.DateTimeField()
    revenue = serializers.DecimalField(max_digits=14, decimal_places=2)


class VendorAnalyticsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    order_count = serializers.IntegerField()
    top_products = TopProductSerializer(many=True)
    daily_revenue = DailyRevenueSerializer(many=True)
