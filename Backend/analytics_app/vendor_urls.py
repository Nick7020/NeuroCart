from django.urls import path
from analytics_app.views import VendorAnalyticsView

urlpatterns = [
    path('analytics', VendorAnalyticsView.as_view(), name='vendor-analytics'),
]
