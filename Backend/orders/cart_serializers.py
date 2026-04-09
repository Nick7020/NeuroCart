from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'quantity', 'subtotal', 'added_at')
        read_only_fields = ('id', 'added_at')

    def get_subtotal(self, obj):
        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ('id', 'items', 'total', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_total(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['total'] = str(data['total'])
        return data


class AddCartItemSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        from products.models import Product
        try:
            product = Product.objects.get(id=attrs['product_id'], is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError({'product_id': 'Product not found or unavailable.'})

        if product.stock <= 0:
            raise serializers.ValidationError({'product_id': 'This product is out of stock.'})

        # Check combined quantity (existing cart item + new request) against stock
        request = self.context.get('request')
        existing_qty = 0
        if request:
            cart = Cart.objects.filter(user=request.user).first()
            if cart:
                existing = CartItem.objects.filter(cart=cart, product=product).first()
                existing_qty = existing.quantity if existing else 0

        combined_qty = existing_qty + attrs['quantity']
        if combined_qty > product.stock:
            raise serializers.ValidationError(
                {'quantity': f'Only {product.stock} units available (you already have {existing_qty} in cart).'}
            )

        attrs['product'] = product
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)

    def validate(self, attrs):
        cart_item = self.context.get('cart_item')
        if cart_item and attrs['quantity'] > cart_item.product.stock:
            raise serializers.ValidationError(
                {'quantity': f'Only {cart_item.product.stock} units available.'}
            )
        return attrs
