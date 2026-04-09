from rest_framework import serializers
from django.db.models import Avg
from .models import Category, Product, ProductImage, Review


class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'parent_category', 'children', 'created_at')
        read_only_fields = ('id', 'created_at')

    def get_children(self, obj):
        return CategorySerializer(obj.children.all(), many=True).data


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ('id', 'image_url', 'is_primary')
        read_only_fields = ('id',)


class ProductListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    vendor_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'price', 'stock', 'is_active', 'vendor_name',
                  'category_name', 'primary_image', 'created_at')

    def get_primary_image(self, obj):
        img = obj.images.filter(is_primary=True).first()
        return img.image_url if img else None


class ReviewSerializer(serializers.ModelSerializer):
    reviewer_username = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'reviewer_username', 'rating', 'comment', 'created_at')
        read_only_fields = ('id', 'reviewer_username', 'created_at')

    def get_reviewer_username(self, obj):
        return obj.user.get_full_name() or obj.user.email.split('@')[0]

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        product = self.context.get('product')
        if request and product:
            from orders.models import OrderItem
            has_delivered = OrderItem.objects.filter(
                order__user=request.user,
                product=product,
                status='delivered'
            ).exists()
            if not has_delivered:
                raise serializers.ValidationError(
                    'You can only review products you have purchased and received.'
                )
        return attrs


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ('rating', 'comment')

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value

    def validate(self, attrs):
        request = self.context.get('request')
        product = self.context.get('product')
        if request and product:
            from orders.models import OrderItem
            has_delivered = OrderItem.objects.filter(
                order__user=request.user,
                product=product,
                status='delivered'
            ).exists()
            if not has_delivered:
                raise serializers.ValidationError(
                    'You can only review products you have purchased and received.'
                )
        return attrs


class ReviewUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating an existing review (no purchase re-verification)."""
    class Meta:
        model = Review
        fields = ('rating', 'comment')

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Rating must be between 1 and 5.')
        return value


class ProductDetailSerializer(serializers.ModelSerializer):
    """Full detail with images and review summary."""
    vendor_name = serializers.CharField(source='vendor.shop_name', read_only=True)
    vendor_id = serializers.UUIDField(source='vendor.id', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.SerializerMethodField()
    review_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'stock', 'is_active',
                  'vendor_id', 'vendor_name', 'category_name', 'images',
                  'average_rating', 'review_count', 'reviews', 'created_at', 'updated_at')

    def get_average_rating(self, obj):
        result = obj.reviews.aggregate(avg=Avg('rating'))
        return result['avg']

    def get_review_count(self, obj):
        return obj.reviews.count()


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Vendor write operations."""
    class Meta:
        model = Product
        fields = ('id', 'name', 'description', 'price', 'stock', 'category', 'is_active')
        read_only_fields = ('id',)

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError('Price must be a positive value.')
        return value

    def validate_stock(self, value):
        if value < 0:
            raise serializers.ValidationError('Stock cannot be negative.')
        return value
