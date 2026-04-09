from rest_framework import generics, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Count
from datetime import timedelta

from .models import Category, Product, Review
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer,
    ProductCreateUpdateSerializer,
    ReviewSerializer,
    ReviewCreateSerializer,
    ReviewUpdateSerializer,
)
from .filters import ProductFilter
from users.permissions import IsAdmin, IsApprovedVendor, IsVendorOwner, IsCustomer


# ── Category Views ────────────────────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    """GET /api/categories — public, returns root categories with nested children."""
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Category.objects.filter(parent_category__isnull=True).prefetch_related('children').order_by('name')


class CategoryCreateView(generics.CreateAPIView):
    """POST /api/categories — admin only."""
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Category.objects.all()


class CategoryUpdateView(generics.UpdateAPIView):
    """PUT /api/categories/{id} — admin only."""
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    queryset = Category.objects.all()


# ── Product Views ─────────────────────────────────────────────────────────────

class ProductListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/products — public list with filter/search/pagination
    POST /api/products — approved vendor creates product
    """
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated(), IsApprovedVendor()]
        return [AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductCreateUpdateSerializer
        return ProductListSerializer

    def get_queryset(self):
        return (
            Product.objects
            .select_related('vendor', 'category')
            .prefetch_related('images')
            .filter(is_active=True)
            .order_by('-created_at')
        )

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user.vendor_profile)


class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/products/{id} — public, full detail with images + reviews."""
    serializer_class = ProductDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Product.objects
            .select_related('vendor', 'category')
            .prefetch_related('images', 'reviews__user')
        )


class ProductUpdateView(generics.UpdateAPIView):
    """PUT /api/products/{id} — vendor owner only."""
    serializer_class = ProductCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsApprovedVendor, IsVendorOwner]
    queryset = Product.objects.all()


class ProductDeleteView(generics.DestroyAPIView):
    """DELETE /api/products/{id} — vendor owner, soft-delete."""
    permission_classes = [IsAuthenticated, IsApprovedVendor, IsVendorOwner]
    queryset = Product.objects.all()

    def perform_destroy(self, instance):
        # Soft-delete: set is_active=False instead of hard delete
        instance.is_active = False
        instance.save(update_fields=['is_active'])


class VendorProductListView(generics.ListAPIView):
    """GET /api/vendor/products — vendor's own products (active + inactive)."""
    serializer_class = ProductListSerializer
    permission_classes = [IsAuthenticated, IsApprovedVendor]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['price', 'created_at', 'name']

    def get_queryset(self):
        return (
            Product.objects
            .select_related('vendor', 'category')
            .prefetch_related('images')
            .filter(vendor=self.request.user.vendor_profile)
            .order_by('-created_at')
        )


class TrendingProductsView(generics.ListAPIView):
    """GET /api/products/trending — top products by order count in last 7 days."""
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        from orders.models import OrderItem
        since = timezone.now() - timedelta(days=7)
        trending_ids = (
            OrderItem.objects
            .filter(order__created_at__gte=since)
            .values('product')
            .annotate(order_count=Count('id'))
            .order_by('-order_count')
            .values_list('product', flat=True)[:10]
        )
        # Preserve ordering
        products = {
            p.id: p for p in
            Product.objects
            .select_related('vendor', 'category')
            .prefetch_related('images')
            .filter(id__in=trending_ids, is_active=True)
        }
        return [products[pid] for pid in trending_ids if pid in products]


class ProductRecommendationsView(APIView):
    """GET /api/products/{id}/recommendations — also-bought recommendations."""
    permission_classes = [AllowAny]

    def get(self, request, pk):
        from rest_framework.exceptions import NotFound
        from services import recommendation_service

        if not Product.objects.filter(pk=pk).exists():
            raise NotFound('Product not found.')

        recommendations = recommendation_service.get_also_bought(product_id=pk)
        serializer = ProductListSerializer(recommendations, many=True, context={'request': request})
        return Response(serializer.data)


# ── Review Views ──────────────────────────────────────────────────────────────

class ReviewListView(generics.ListAPIView):
    """GET /api/products/{id}/reviews — public."""
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Review.objects
            .select_related('user')
            .filter(product_id=self.kwargs['pk'])
        )


class ReviewCreateView(generics.CreateAPIView):
    """POST /api/products/{id}/reviews — customer, purchase verified."""
    serializer_class = ReviewCreateSerializer
    permission_classes = [IsAuthenticated, IsCustomer]

    def _get_product(self):
        try:
            return Product.objects.get(pk=self.kwargs['pk'])
        except Product.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Product not found.')

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        if not hasattr(self, '_product'):
            self._product = self._get_product()
        ctx['product'] = self._product
        return ctx

    def perform_create(self, serializer):
        if not hasattr(self, '_product'):
            self._product = self._get_product()
        product = self._product
        if Review.objects.filter(user=self.request.user, product=product).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError('You have already reviewed this product.')
        serializer.save(user=self.request.user, product=product)


class ReviewUpdateView(generics.UpdateAPIView):
    """PUT /api/products/{pk}/reviews/{review_id} — owner only."""
    serializer_class = ReviewUpdateSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            review = Review.objects.select_related('user').get(
                pk=self.kwargs['review_id'],
                product_id=self.kwargs['pk'],
            )
        except Review.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Review not found.')
        if review.user != self.request.user:
            raise PermissionDenied('You can only update your own reviews.')
        return review


class ReviewDeleteView(generics.DestroyAPIView):
    """DELETE /api/products/{pk}/reviews/{review_id} — owner only."""
    permission_classes = [IsAuthenticated]

    def get_object(self):
        try:
            review = Review.objects.select_related('user').get(
                pk=self.kwargs['review_id'],
                product_id=self.kwargs['pk'],
            )
        except Review.DoesNotExist:
            from rest_framework.exceptions import NotFound
            raise NotFound('Review not found.')
        if review.user != self.request.user:
            raise PermissionDenied('You can only delete your own reviews.')
        return review
