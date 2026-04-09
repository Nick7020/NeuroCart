from django.contrib import admin
from django.urls import path
from django.http import JsonResponse


# ✅ DEFINE FIRST
def test_api(request):
    return JsonResponse({"message": "NeuroCart API Running 🚀"})


# ✅ THEN USE
urlpatterns = [
    path('api/test/', test_api),
    path('admin/', admin.site.urls),
]