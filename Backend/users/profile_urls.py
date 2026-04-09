from django.urls import path
from .views import UserProfileView, AdminUserListView, AdminUserBlockView, AdminUserUnblockView, AdminUserApproveView

urlpatterns = [
    path('me', UserProfileView.as_view(), name='user-profile'),
    path('', AdminUserListView.as_view(), name='admin-user-list'),
    path('<uuid:pk>/block/', AdminUserBlockView.as_view(), name='admin-user-block'),
    path('<uuid:pk>/unblock/', AdminUserUnblockView.as_view(), name='admin-user-unblock'),
    path('<uuid:pk>/approve/', AdminUserApproveView.as_view(), name='admin-user-approve'),
]
