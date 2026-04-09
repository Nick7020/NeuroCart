from django.urls import path
from .views import (
    ProductRecommendationsView,
    UserRecommendationsView,
    TrendingView,
    AIRecommendationsView,
)

urlpatterns = [
    path('product/<uuid:product_id>/', ProductRecommendationsView.as_view()),
    path('user/', UserRecommendationsView.as_view()),
    path('trending/', TrendingView.as_view()),
    path('ai/', AIRecommendationsView.as_view()),
]
