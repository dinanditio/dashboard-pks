from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # URL untuk Django Admin Panel
    path('admin/', admin.site.urls),

    # Meneruskan semua permintaan yang dimulai dengan 'api/'
    # ke file urls.py di dalam aplikasi 'api'
    path('api/', include('api.urls')),
]