from django.urls import path
from vendors.views import AdminVendorListView, AdminVendorVerifyView

urlpatterns = [
    path('vendors', AdminVendorListView.as_view(), name='admin-vendor-list'),
    path('vendors/<uuid:id>/verify', AdminVendorVerifyView.as_view(), name='admin-vendor-verify'),
]
