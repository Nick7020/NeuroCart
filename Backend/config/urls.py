from django.conf import settings
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from orders.urls import vendor_order_urlpatterns


def test_api(request):
    return JsonResponse({"message": "NeuroCart API Running 🚀"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/test/', test_api),

    # Auth & Users
    path('api/auth/', include('users.urls')),
    path('api/users/', include('users.profile_urls')),

    # Vendors
    path('api/vendors/', include('vendors.urls')),
    path('api/vendor/', include('vendors.dashboard_urls')),
    path('api/vendor/', include(vendor_order_urlpatterns)),

    # Categories & Products
    path('api/categories/', include('products.category_urls')),
    path('api/products/', include('products.urls')),

    # Cart
    path('api/cart/', include('orders.cart_urls')),

    # Orders
    path('api/orders/', include('orders.urls')),

    # Invoices
    path('api/invoices/', include('orders.invoice_urls')),

    # Payments
    path('api/payments/', include('payments.urls')),

    # Analytics (admin + vendor)
    path('api/admin/', include('analytics_app.admin_urls')),
    path('api/vendor/', include('analytics_app.vendor_urls')),

    # AI Chatbot & Recommendations
    path('api/ai/', include('ai_app.urls')),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
