from rest_framework import serializers
from .models import VendorProfile


class VendorProfileSerializer(serializers.ModelSerializer):
    """For vendor create/update operations."""
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = VendorProfile
        fields = ('id', 'user', 'shop_name', 'description', 'verification_status',
                  'rating', 'total_sales', 'created_at', 'updated_at')
        read_only_fields = ('id', 'verification_status', 'rating', 'total_sales',
                            'created_at', 'updated_at')

    def validate_shop_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Shop name cannot be blank.')
        return value


class VendorPublicSerializer(serializers.ModelSerializer):
    """Read-only public view of a vendor profile."""
    class Meta:
        model = VendorProfile
        fields = ('id', 'shop_name', 'description', 'verification_status',
                  'rating', 'created_at')
        read_only_fields = fields


class VendorVerificationSerializer(serializers.ModelSerializer):
    """Admin-only: update verification_status."""
    verification_status = serializers.ChoiceField(
        choices=['pending', 'approved', 'rejected']
    )

    class Meta:
        model = VendorProfile
        fields = ('verification_status',)


class VendorDashboardSerializer(serializers.Serializer):
    """Stats response for vendor dashboard (read-only, not model-bound)."""
    shop_name = serializers.CharField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    order_count = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    top_products = serializers.ListField(child=serializers.DictField())
