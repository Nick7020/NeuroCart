from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.throttling import AnonRateThrottle
from rest_framework.pagination import PageNumberPagination
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError

from .models import User
from .permissions import IsAdmin
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer, AdminUserSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Auto-create vendor profile if registering as vendor
        if user.role == 'vendor':
            from vendors.models import VendorProfile
            shop_name = request.data.get('shop_name') or request.data.get('storeName') or f"{user.first_name or user.email.split('@')[0]}'s Store"
            description = request.data.get('description', '')
            VendorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'shop_name': shop_name,
                    'description': description,
                    'verification_status': 'approved',  # auto-approve on registration
                }
            )

        tokens = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        tokens = RefreshToken.for_user(user)
        return Response({
            'user': UserProfileSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response(
                {'error': 'MISSING_REFRESH_TOKEN', 'message': 'Refresh token is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {'error': 'INVALID_TOKEN', 'message': 'Token is invalid or already blacklisted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class TokenRefreshView(BaseTokenRefreshView):
    """Thin wrapper around simplejwt's TokenRefreshView."""
    pass


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class AdminUserListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        paginator = PageNumberPagination()
        paginator.page_size = 20
        users = User.objects.all().order_by('-created_at')
        page = paginator.paginate_queryset(users, request)
        serializer = AdminUserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class AdminUserBlockView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user.role == 'admin':
            return Response(
                {'error': 'CANNOT_BLOCK_ADMIN', 'message': 'Cannot block an admin user.'},
                status=status.HTTP_403_FORBIDDEN,
            )
        user.is_active = False
        user.save()
        return Response(AdminUserSerializer(user).data)


class AdminUserUnblockView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        user.is_active = True
        user.save()
        return Response(AdminUserSerializer(user).data)


class AdminUserApproveView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if user.role != 'vendor':
            return Response(
                {'error': 'NOT_A_VENDOR', 'message': 'User is not a vendor.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            vendor_profile = user.vendor_profile
        except Exception:
            return Response(
                {'error': 'NOT_A_VENDOR', 'message': 'User is not a vendor.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        vendor_profile.verification_status = 'approved'
        vendor_profile.save()
        return Response(AdminUserSerializer(user).data)
