"""
URL configuration for chaptered project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from .views import index, test_connection

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('test/', test_connection, name='test_connection'),
    path('', index, name='index'),
] 