from django.urls import path
from vendors.views import AdminVendorListView, AdminVendorVerifyView
from analytics_app.views import AdminOverviewView, AdminSalesView, AdminTopVendorsView
from orders.views import AdminOrderListView

urlpatterns = [
    path('vendors', AdminVendorListView.as_view(), name='admin-vendor-list'),
    path('vendors/<uuid:id>/verify', AdminVendorVerifyView.as_view(), name='admin-vendor-verify'),
    path('analytics/overview', AdminOverviewView.as_view(), name='admin-analytics-overview'),
    path('analytics/sales', AdminSalesView.as_view(), name='admin-analytics-sales'),
    path('analytics/top-vendors', AdminTopVendorsView.as_view(), name='admin-analytics-top-vendors'),
    path('orders/', AdminOrderListView.as_view(), name='admin-order-list'),
]
