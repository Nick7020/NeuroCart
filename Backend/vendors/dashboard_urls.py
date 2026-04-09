from django.urls import path
from .views import VendorDashboardView, VendorProfileUpdateView
from products.views import VendorProductListView

urlpatterns = [
    path('dashboard', VendorDashboardView.as_view(), name='vendor-dashboard'),
    path('profile', VendorProfileUpdateView.as_view(), name='vendor-profile-update'),
    path('products', VendorProductListView.as_view(), name='vendor-product-list'),
]
