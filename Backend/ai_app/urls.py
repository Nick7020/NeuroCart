from django.urls import path
from .views import ChatView, RecommendationsView

urlpatterns = [
    path('chat', ChatView.as_view(), name='ai-chat'),
    path('recommendations', RecommendationsView.as_view(), name='ai-recommendations'),
]
