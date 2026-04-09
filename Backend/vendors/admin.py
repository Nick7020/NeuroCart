from django.contrib import admin
from .models import VendorProfile


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display = ('shop_name', 'verification_status', 'rating')
    list_filter = ('verification_status',)
    search_fields = ('shop_name', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    actions = ['approve_vendor', 'reject_vendor']

    @admin.action(description='Approve selected vendors')
    def approve_vendor(self, request, queryset):
        updated = queryset.update(verification_status='approved')
        self.message_user(request, f'{updated} vendor(s) successfully approved.')

    @admin.action(description='Reject selected vendors')
    def reject_vendor(self, request, queryset):
        updated = queryset.update(verification_status='rejected')
        self.message_user(request, f'{updated} vendor(s) successfully rejected.')
