from rest_framework import serializers


class AdminOverviewSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    total_vendors = serializers.IntegerField()
    total_products = serializers.IntegerField()


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
