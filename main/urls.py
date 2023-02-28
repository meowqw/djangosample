from django.urls import path
from .views import *
from app import settings
from django.conf.urls.static import static

urlpatterns = [
    path('auth/', auth, name="auth"),
    path('', main, name="main"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # static