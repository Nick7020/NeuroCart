from django.urls import path
from .views import (
    ProductListCreateView,
    ProductDetailView,
    ProductUpdateView,
    ProductDeleteView,
    TrendingProductsView,
    ProductRecommendationsView,
    ReviewListView,
    ReviewCreateView,
    ReviewUpdateView,
    ReviewDeleteView,
)

urlpatterns = [
    # List + Create: GET /api/products/, POST /api/products/
    path('', ProductListCreateView.as_view(), name='product-list-create'),

    # Trending: GET /api/products/trending/
    # Must be before <uuid:pk> to avoid UUID match on "trending"
    path('trending/', TrendingProductsView.as_view(), name='product-trending'),

    # Detail: GET /api/products/{id}/
    path('<uuid:pk>/', ProductDetailView.as_view(), name='product-detail'),

    # Update: PUT /api/products/{id}/
    path('<uuid:pk>/update/', ProductUpdateView.as_view(), name='product-update'),

    # Delete: DELETE /api/products/{id}/
    path('<uuid:pk>/delete/', ProductDeleteView.as_view(), name='product-delete'),

    # Recommendations: GET /api/products/{id}/recommendations/
    path('<uuid:pk>/recommendations/', ProductRecommendationsView.as_view(), name='product-recommendations'),

    # Reviews: GET /api/products/{id}/reviews/
    path('<uuid:pk>/reviews/', ReviewListView.as_view(), name='review-list'),

    # Review Create: POST /api/products/{id}/reviews/create/
    path('<uuid:pk>/reviews/create/', ReviewCreateView.as_view(), name='review-create'),

    # Review Update: PUT /api/products/{id}/reviews/{review_id}/
    path('<uuid:pk>/reviews/<uuid:review_id>/', ReviewUpdateView.as_view(), name='review-update'),

    # Review Delete: DELETE /api/products/{id}/reviews/{review_id}/
    path('<uuid:pk>/reviews/<uuid:review_id>/delete/', ReviewDeleteView.as_view(), name='review-delete'),
]
