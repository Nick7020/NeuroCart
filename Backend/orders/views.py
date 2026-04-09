from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404
from django.db.models import Count, Prefetch

from .models import Order, OrderItem, Invoice
from .serializers import (
    CheckoutSerializer,
    OrderListSerializer,
    OrderDetailSerializer,
    OrderItemSerializer,
    OrderItemStatusUpdateSerializer,
    AdminOrderListSerializer,
)
from .invoice_serializers import InvoiceSerializer
from services import order_service
from users.permissions import IsCustomer, IsApprovedVendor, IsAdmin, IsOrderOwner


class CheckoutView(APIView):
    """POST /api/orders/checkout — customer only."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            order = order_service.checkout(
                user=request.user,
                payment_method=serializer.validated_data['payment_method'],
                shipping_address=serializer.validated_data.get('shipping_address'),
            )
        except ValidationError as e:
            return Response(
                {'error': 'CHECKOUT_FAILED', 'details': e.message_dict if hasattr(e, 'message_dict') else e.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """GET /api/orders — customer's own orders, paginated."""
    serializer_class = OrderListSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def get_queryset(self):
        return (
            Order.objects
            .filter(user=self.request.user)
            .annotate(item_count=Count('items'))
            .order_by('-created_at')
        )


class OrderDetailView(generics.RetrieveAPIView):
    """GET /api/orders/{id} — customer (own) or admin."""
    serializer_class = OrderDetailSerializer
    permission_classes = [IsAuthenticated, IsOrderOwner]

    def get_queryset(self):
        items_qs = OrderItem.objects.select_related('product', 'vendor')
        return Order.objects.select_related('user').prefetch_related(
            Prefetch('items', queryset=items_qs)
        )

    def get_object(self):
        obj = get_object_or_404(self.get_queryset(), pk=self.kwargs['pk'])
        # Admins bypass object-level ownership check
        if self.request.user.role != 'admin':
            self.check_object_permissions(self.request, obj)
        return obj


class OrderCancelView(APIView):
    """POST /api/orders/{pk}/cancel — customer only."""
    permission_classes = [IsAuthenticated, IsCustomer, IsOrderOwner]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        self.check_object_permissions(request, order)

        try:
            order = order_service.cancel_order(order=order, user=request.user)
        except PermissionDenied as e:
            return Response({'error': 'PERMISSION_DENIED', 'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response(
                {'error': 'CANCEL_FAILED', 'message': e.messages[0] if e.messages else str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(OrderDetailSerializer(order).data)


class VendorOrderItemListView(generics.ListAPIView):
    """GET /api/vendor/orders — vendor's order items, filterable by status."""
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated, IsApprovedVendor]

    def get_queryset(self):
        vendor = self.request.user.vendor_profile
        qs = (
            OrderItem.objects
            .filter(vendor=vendor)
            .select_related('order', 'product', 'vendor', 'order__user')
            .order_by('-order__created_at')
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class VendorOrderItemStatusView(APIView):
    """PATCH /api/vendor/orders/{item_id}/status — vendor updates item status."""
    permission_classes = [IsAuthenticated, IsApprovedVendor]

    def patch(self, request, item_id):
        vendor = request.user.vendor_profile
        order_item = get_object_or_404(OrderItem, pk=item_id, vendor=vendor)

        serializer = OrderItemStatusUpdateSerializer(
            data=request.data,
            context={'order_item': order_item},
        )
        serializer.is_valid(raise_exception=True)

        try:
            order_item = order_service.update_order_item_status(
                order_item=order_item,
                vendor=vendor,
                new_status=serializer.validated_data['new_status'],
            )
        except PermissionDenied as e:
            return Response({'error': 'PERMISSION_DENIED', 'message': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except ValidationError as e:
            return Response(
                {'error': 'STATUS_UPDATE_FAILED', 'message': e.messages[0] if e.messages else str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(OrderItemSerializer(order_item).data)


class AdminOrderListView(generics.ListAPIView):
    """GET /api/admin/orders/ — admin-only, paginated list of all orders."""
    serializer_class = AdminOrderListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        qs = (
            Order.objects
            .select_related('user')
            .annotate(item_count=Count('items'))
            .order_by('-created_at')
        )
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class InvoiceListView(generics.ListAPIView):
    """GET /api/invoices/ — admin-only, paginated list of all invoices."""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return (
            Invoice.objects
            .select_related('order', 'vendor')
            .prefetch_related('order__items__product', 'order__items__vendor')
            .order_by('-issued_at')
        )


class InvoiceDetailView(generics.RetrieveAPIView):
    """GET /api/invoices/{pk}/ — admin or the owning vendor."""
    serializer_class = InvoiceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Invoice.objects.select_related('order', 'vendor').prefetch_related(
            'order__items__product', 'order__items__vendor'
        )

    def get_object(self):
        invoice = get_object_or_404(self.get_queryset(), pk=self.kwargs['pk'])
        user = self.request.user
        if user.role == 'admin':
            return invoice
        # Approved vendors can only see their own invoices
        if user.role == 'vendor':
            try:
                vendor_profile = user.vendor_profile
                if invoice.vendor_id == vendor_profile.id:
                    return invoice
            except Exception:
                pass
        from rest_framework.exceptions import PermissionDenied as DRFPermissionDenied
        raise DRFPermissionDenied("You do not have permission to view this invoice.")
