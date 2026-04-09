from django.urls import path
from .views import VendorRegisterView, VendorPublicDetailView

urlpatterns = [
    path('register', VendorRegisterView.as_view(), name='vendor-register'),
    path('<uuid:id>', VendorPublicDetailView.as_view(), name='vendor-public-detail'),
]
