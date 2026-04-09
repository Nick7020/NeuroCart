from django.urls import path
from .views import ProcessPaymentView, PaymentDetailView

urlpatterns = [
    path('process/', ProcessPaymentView.as_view(), name='payment-process'),
    path('<uuid:order_id>/', PaymentDetailView.as_view(), name='payment-detail'),
]
