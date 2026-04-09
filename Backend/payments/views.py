from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404

from orders.models import Order
from payments.models import Payment
from payments.serializers import PaymentSerializer, ProcessPaymentSerializer
from services.payment_service import process_payment
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
