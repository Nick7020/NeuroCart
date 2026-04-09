from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Sum, Count
from django.shortcuts import get_object_or_404

from .models import VendorProfile
from .serializers import (
    VendorProfileSerializer,
    VendorPublicSerializer,
    VendorVerificationSerializer,
    VendorDashboardSerializer,
)
from users.permissions import IsVendor, IsApprovedVendor, IsAdmin


class VendorRegisterView(APIView):
    """POST /api/vendors/register — vendor role required."""
    permission_classes = [IsAuthenticated, IsVendor]

    def post(self, request):
        if hasattr(request.user, 'vendor_profile'):
            return Response(
                {'error': 'VENDOR_PROFILE_EXISTS', 'message': 'You already have a vendor profile.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = VendorProfileSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class VendorPublicDetailView(generics.RetrieveAPIView):
    """GET /api/vendors/{id} — public."""
    queryset = VendorProfile.objects.all()
    serializer_class = VendorPublicSerializer
    permission_classes = [AllowAny]
    lookup_field = 'id'


class VendorDashboardView(APIView):
    """GET /api/vendor/dashboard — approved vendor only."""
    permission_classes = [IsAuthenticated, IsApprovedVendor]

    def get(self, request):
        vendor = request.user.vendor_profile
        dashboard_data = self._build_dashboard(vendor)
        serializer = VendorDashboardSerializer(dashboard_data)
        return Response(serializer.data)

    def _build_dashboard(self, vendor):
        # Attempt to pull live order data; gracefully degrade if models not yet migrated.
        try:
            from orders.models import OrderItem

            qs = OrderItem.objects.filter(vendor=vendor)
            agg = qs.aggregate(
                total_revenue=Sum('subtotal'),
                order_count=Count('order', distinct=True),
            )

            pending_orders = qs.filter(status='pending').count()

            top_products = list(
                qs.values('product__id', 'product__name')
                .annotate(revenue=Sum('subtotal'))
                .order_by('-revenue')[:5]
            )
        except Exception:
            agg = {'total_revenue': None, 'order_count': 0}
            pending_orders = 0
            top_products = []

        return {
            'shop_name': vendor.shop_name,
            'total_revenue': agg.get('total_revenue') or '0.00',
            'order_count': agg.get('order_count') or 0,
            'pending_orders': pending_orders,
            'top_products': top_products,
        }


class VendorProfileUpdateView(generics.UpdateAPIView):
    """PUT /api/vendor/profile — approved vendor only."""
    serializer_class = VendorProfileSerializer
    permission_classes = [IsAuthenticated, IsApprovedVendor]

    def get_object(self):
        return self.request.user.vendor_profile


class AdminVendorListView(generics.ListAPIView):
    """GET /api/admin/vendors — admin only."""
    queryset = VendorProfile.objects.select_related('user').order_by('-created_at')
    serializer_class = VendorProfileSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class AdminVendorVerifyView(generics.UpdateAPIView):
    """PATCH /api/admin/vendors/{id}/verify — admin only."""
    queryset = VendorProfile.objects.all()
    serializer_class = VendorVerificationSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ['patch']
    lookup_field = 'id'
