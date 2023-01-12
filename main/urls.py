from django.urls import path
from .views import *
from app import settings
from django.conf.urls.static import static

from account.views import (registration_view, logout_view, login_view)

urlpatterns = [
    path('', index, name="index"),

    # account
    path('registration/', registration_view, name="registration"), 
    path('logout/', logout_view, name="logout"),
    path('authorization/', login_view, name="authorization"),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT) # static