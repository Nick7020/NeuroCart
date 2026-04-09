from rest_framework.permissions import BasePermission


class IsVendor(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'vendor')


class IsApprovedVendor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'vendor' and
            hasattr(request.user, 'vendor_profile') and
            request.user.vendor_profile.verification_status == 'approved'
        )


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')


class IsCustomer(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'customer')


class IsVendorOwner(BasePermission):
    """Object-level: vendor can only modify resources belonging to their own vendor profile."""
    def has_object_permission(self, request, view, obj):
        if not (request.user and request.user.is_authenticated):
            return False
        if not hasattr(request.user, 'vendor_profile'):
            return False
        return obj.vendor == request.user.vendor_profile


class IsOrderOwner(BasePermission):
    """Object-level: customer can only access their own orders."""
    def has_object_permission(self, request, view, obj):
        return bool(request.user and request.user.is_authenticated and obj.user == request.user)
