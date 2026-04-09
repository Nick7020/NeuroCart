from django.urls import path
from .views import CategoryListView, CategoryCreateView, CategoryUpdateView

urlpatterns = [
    path('', CategoryListView.as_view(), name='category-list'),
    path('create/', CategoryCreateView.as_view(), name='category-create'),
    path('<uuid:pk>/', CategoryUpdateView.as_view(), name='category-update'),
]
