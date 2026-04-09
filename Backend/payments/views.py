from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError, PermissionDenied

from orders.models import Order
from payments.models import Payment
from payments.serializers import (
    PaymentSerializer,
    ProcessPaymentSerializer,
    RazorpayOrderSerializer,
    RazorpayVerifySerializer,
)
from services.payment_service import (
    process_payment,
    create_razorpay_order,
    verify_and_capture_payment,
    handle_webhook_event,
)
from users.permissions import IsCustomer, IsAdmin


class ProcessPaymentView(APIView):
    """
    POST /api/payments/process
    Customer processes payment for a pending order.
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = ProcessPaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']
        payment_method = serializer.validated_data['payment_method']
        simulate_fail = serializer.validated_data.get('simulate_fail', False)

        order = get_object_or_404(Order, id=order_id, user=request.user)

        if order.status not in ('pending',):
            return Response(
                {'error': 'ORDER_NOT_PAYABLE', 'message': 'Only pending orders can be paid.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment = process_payment(order, payment_method, simulate_fail=simulate_fail)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)


class RazorpayCreateOrderView(APIView):
    """
    POST /api/payments/razorpay/create-order/
    Initiates a Razorpay order for a pending NeuroCart order.
    Returns the Razorpay order details needed by the frontend checkout modal.
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = RazorpayOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        order_id = serializer.validated_data['order_id']
        order = get_object_or_404(Order, id=order_id)

        try:
            razorpay_order = create_razorpay_order(order, request.user)
        except PermissionDenied as exc:
            return Response(
                {'error': 'FORBIDDEN', 'message': str(exc)},
                status=status.HTTP_403_FORBIDDEN,
            )
        except ValidationError as exc:
            # ORDER_NOT_PAYABLE → 400; Razorpay API failure → 502
            messages = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            first = messages[0] if isinstance(messages, list) else messages
            if isinstance(first, dict) and first.get('code') == 'ORDER_NOT_PAYABLE':
                return Response(
                    {'error': 'ORDER_NOT_PAYABLE', 'message': first.get('detail', str(exc))},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {'error': 'RAZORPAY_ERROR', 'message': str(exc)},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response(
            {
                'razorpay_order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'key_id': settings.RAZORPAY_KEY_ID,
            },
            status=status.HTTP_200_OK,
        )


class RazorpayVerifyView(APIView):
    """
    POST /api/payments/razorpay/verify/
    Verifies the Razorpay payment signature and marks the payment as completed.
    """
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = RazorpayVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = verify_and_capture_payment(
                razorpay_order_id=serializer.validated_data['razorpay_order_id'],
                razorpay_payment_id=serializer.validated_data['razorpay_payment_id'],
                razorpay_signature=serializer.validated_data['razorpay_signature'],
            )
        except ValidationError as exc:
            detail = exc.message_dict if hasattr(exc, 'message_dict') else exc.messages
            return Response({'error': detail}, status=status.HTTP_400_BAD_REQUEST)

        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)


class RazorpayWebhookView(APIView):
    """
    POST /api/payments/razorpay/webhook/
    Handles async Razorpay webhook events (payment.captured, payment.failed).
    No authentication required — open to Razorpay servers, validated via HMAC signature.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        raw_body = request.body
        signature = request.META.get('HTTP_X_RAZORPAY_SIGNATURE', '')

        success, message = handle_webhook_event(raw_body, signature)

        if not success:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'status': 'ok'}, status=status.HTTP_200_OK)


class PaymentDetailView(APIView):
    """
    GET /api/payments/{order_id}
    Customer or admin retrieves payment details for an order.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)

        # Customers can only view their own order's payment
        if request.user.role == 'customer' and order.user != request.user:
            return Response(
                {'error': 'FORBIDDEN', 'message': 'You do not have permission to view this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Vendors have no access to payment details
        if request.user.role not in ('customer', 'admin'):
            return Response(
                {'error': 'FORBIDDEN', 'message': 'You do not have permission to view this payment.'},
                status=status.HTTP_403_FORBIDDEN,
            )

        payment = get_object_or_404(Payment, order=order)
        return Response(PaymentSerializer(payment).data, status=status.HTTP_200_OK)
