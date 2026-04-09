from django.urls import path
from .views import ProcessPaymentView, PaymentDetailView, RazorpayCreateOrderView, RazorpayVerifyView, RazorpayWebhookView

urlpatterns = [
    path('process/', ProcessPaymentView.as_view(), name='payment-process'),
    path('razorpay/create-order/', RazorpayCreateOrderView.as_view(), name='razorpay-create-order'),
    path('razorpay/verify/', RazorpayVerifyView.as_view(), name='razorpay-verify'),
    path('razorpay/webhook/', RazorpayWebhookView.as_view(), name='razorpay-webhook'),
    path('<uuid:order_id>/', PaymentDetailView.as_view(), name='payment-detail'),
]
