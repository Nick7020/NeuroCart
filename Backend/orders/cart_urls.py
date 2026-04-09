from django.urls import path
from .cart_views import (
    CartDetailView,
    CartItemAddView,
    CartItemUpdateView,
    CartItemDeleteView,
    CartClearView,
)

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('items/', CartItemAddView.as_view(), name='cart-item-add'),
    path('items/<uuid:pk>/', CartItemUpdateView.as_view(), name='cart-item-update'),
    path('items/<uuid:pk>/delete/', CartItemDeleteView.as_view(), name='cart-item-delete'),
    path('clear/', CartClearView.as_view(), name='cart-clear'),
]
