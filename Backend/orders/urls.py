from django.urls import path
from .views import (
    CheckoutView,
    OrderListView,
    OrderDetailView,
    OrderCancelView,
    VendorOrderItemListView,
    VendorOrderItemStatusView,
    InvoiceListView,
    VendorInvoiceListView,
    InvoiceDetailView,
)

urlpatterns = [
    path('checkout/', CheckoutView.as_view(), name='order-checkout'),
    path('', OrderListView.as_view(), name='order-list'),
    path('<uuid:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<uuid:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    # Invoice URLs
    path('invoices/', InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/<uuid:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
]

# Vendor order item URLs — included under /api/vendor/ in config/urls.py
vendor_order_urlpatterns = [
    path('orders/', VendorOrderItemListView.as_view(), name='vendor-order-item-list'),
    path('orders/<uuid:item_id>/status/', VendorOrderItemStatusView.as_view(), name='vendor-order-item-status'),
    # Vendor invoice URLs
    path('invoices/', VendorInvoiceListView.as_view(), name='vendor-invoice-list'),
]
