from django.urls import path
from .views import InvoiceListView, InvoiceDetailView

urlpatterns = [
    path('', InvoiceListView.as_view(), name='invoice-list'),
    path('<uuid:pk>/', InvoiceDetailView.as_view(), name='invoice-detail'),
]
