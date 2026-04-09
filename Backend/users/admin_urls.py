from django.urls import path
from .views import AdminUserListView, AdminUserDetailView, AdminUserBlockView

urlpatterns = [
    path('users/', AdminUserListView.as_view(), name='admin-users-list'),
    path('users/<uuid:user_id>/', AdminUserDetailView.as_view(), name='admin-users-detail'),
    path('users/<uuid:user_id>/block/', AdminUserBlockView.as_view(), name='admin-users-block'),
]
