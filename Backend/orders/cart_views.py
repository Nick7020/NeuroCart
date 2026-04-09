from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Prefetch

from .models import Cart, CartItem
from .cart_serializers import (
    AddCartItemSerializer,
    CartSerializer,
    UpdateCartItemSerializer,
)
from users.permissions import IsCustomer


class CartDetailView(APIView):
    """GET /api/cart — get or create cart, return with total."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart = Cart.objects.prefetch_related(
            Prefetch('items', queryset=CartItem.objects.select_related('product'))
        ).get(pk=cart.pk)
        serializer = CartSerializer(cart)
        return Response(serializer.data)


class CartItemAddView(APIView):
    """POST /api/cart/items — add item or increment quantity if already in cart."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        product = serializer.validated_data['product']
        quantity = serializer.validated_data['quantity']

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity},
        )

        if not created:
            new_qty = cart_item.quantity + quantity
            if new_qty > product.stock:
                return Response(
                    {'detail': f'Only {product.stock} units available.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            cart_item.quantity = new_qty
            cart_item.save(update_fields=['quantity'])

        cart.refresh_from_db()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemUpdateView(APIView):
    """PUT /api/cart/items/{id} — update item quantity."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def put(self, request, pk):
        try:
            cart_item = CartItem.objects.select_related('product').get(
                pk=pk, cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UpdateCartItemSerializer(
            data=request.data, context={'cart_item': cart_item}
        )
        serializer.is_valid(raise_exception=True)

        cart_item.quantity = serializer.validated_data['quantity']
        cart_item.save(update_fields=['quantity'])

        cart = cart_item.cart
        return Response(CartSerializer(cart).data)


class CartItemDeleteView(APIView):
    """DELETE /api/cart/items/{id} — remove a single item from cart."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.select_related('cart').get(pk=pk, cart__user=request.user)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

        cart_id = cart_item.cart_id
        cart_item.delete()

        cart = Cart.objects.prefetch_related(
            Prefetch('items', queryset=CartItem.objects.select_related('product'))
        ).get(pk=cart_id)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartClearView(APIView):
    """DELETE /api/cart/clear — remove all items from cart."""
    permission_classes = [IsAuthenticated, IsCustomer]

    def delete(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart.items.all().delete()
        # Re-fetch with prefetch so CartSerializer doesn't hit N+1 (items will be empty)
        cart = Cart.objects.prefetch_related(
            Prefetch('items', queryset=CartItem.objects.select_related('product'))
        ).get(pk=cart.pk)
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
