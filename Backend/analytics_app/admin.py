from django.contrib import admin

from .models import SalesRecord


@admin.register(SalesRecord)
class SalesRecordAdmin(admin.ModelAdmin):
    list_display = ('vendor', 'order_item', 'revenue', 'date')
    list_filter = ('date', 'vendor')
    search_fields = ('vendor__shop_name',)
    readonly_fields = ('id',)
