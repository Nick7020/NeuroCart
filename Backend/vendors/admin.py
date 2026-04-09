from django.contrib import admin
from .models import VendorProfile


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'user', 'verification_status', 'rating', 'total_sales', 'created_at')
    list_filter = ('verification_status',)
    search_fields = ('shop_name', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'rating', 'total_sales')
    actions = ['approve_vendor', 'reject_vendor']

    @admin.action(description='Approve selected vendors')
    def approve_vendor(self, request, queryset):
        queryset.update(verification_status='approved')

    @admin.action(description='Reject selected vendors')
    def reject_vendor(self, request, queryset):
        queryset.update(verification_status='rejected')
