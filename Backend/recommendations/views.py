from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from products.serializers import ProductListSerializer
from services import recommendation_service, analytics_service


class ProductRecommendationsView(APIView):
    """GET /api/recommendations/product/<uuid:product_id>/"""
    permission_classes = [AllowAny]

    def get(self, request, product_id):
        if not Product.objects.filter(id=product_id).exists():
            return Response({'detail': 'Product not found.'}, status=404)
        products = recommendation_service.get_also_bought(product_id)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class UserRecommendationsView(APIView):
    """GET /api/recommendations/user/"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = recommendation_service.get_user_recommendations(request.user.id)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class TrendingView(APIView):
    """GET /api/recommendations/trending/"""
    permission_classes = [AllowAny]

    def get(self, request):
        days_param = request.query_params.get('days', '7')
        try:
            days = int(days_param)
            if not (1 <= days <= 90):
                raise ValueError
        except (ValueError, TypeError):
            return Response(
                {'detail': 'days must be an integer between 1 and 90.'},
                status=400,
            )
        products = analytics_service.get_trending_products(days=days)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)


class AIRecommendationsView(APIView):
    """POST /api/recommendations/ai/"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        products = recommendation_service.get_ai_recommendations(request.user.id)
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)
