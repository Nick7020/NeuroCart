from datetime import date

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsAdmin, IsApprovedVendor
from services.analytics_service import (
    get_admin_overview,
    get_sales_by_period,
    get_top_vendors,
    get_top_products,
    get_vendor_analytics,
)
from .serializers import (
    AdminOverviewSerializer,
    SalesByPeriodSerializer,
    VendorAnalyticsSerializer,
)


class AdminOverviewView(APIView):
    """GET /api/admin/analytics/overview — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ['get']

    def get(self, request):
        data = get_admin_overview()
        serializer = AdminOverviewSerializer(data)
        return Response(serializer.data)


class AdminSalesView(APIView):
    """GET /api/admin/analytics/sales?start=&end=&granularity= — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ['get']

    def get(self, request):
        start = request.query_params.get('start')
        end = request.query_params.get('end')
        granularity = request.query_params.get('granularity', 'day')

        if granularity not in ('day', 'week', 'month'):
            return Response(
                {'detail': "granularity must be one of: day, week, month"},
                status=400,
            )

        try:
            start_date = date.fromisoformat(start) if start else date.today().replace(day=1)
            end_date = date.fromisoformat(end) if end else date.today()
        except ValueError:
            return Response(
                {'detail': 'Invalid date format. Use YYYY-MM-DD.'},
                status=400,
            )

        records = get_sales_by_period(start_date, end_date, granularity)
        serializer = SalesByPeriodSerializer(records, many=True)
        return Response(serializer.data)


class AdminTopVendorsView(APIView):
    """GET /api/admin/analytics/top-vendors — admin only."""
    permission_classes = [IsAuthenticated, IsAdmin]
    http_method_names = ['get']

    def get(self, request):
        top_vendors = get_top_vendors(limit=10)
        top_products = get_top_products(limit=10)
        return Response({
            'top_vendors': top_vendors,
            'top_products': top_products,
        })


class VendorAnalyticsView(APIView):
    """GET /api/vendor/analytics — approved vendor only."""
    permission_classes = [IsAuthenticated, IsApprovedVendor]
    http_method_names = ['get']

    def get(self, request):
        vendor = request.user.vendor_profile
        data = get_vendor_analytics(vendor)
        serializer = VendorAnalyticsSerializer(data)
        return Response(serializer.data)
