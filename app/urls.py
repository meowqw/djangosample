from django.contrib import admin
from django.urls import path, include
from main.views import *
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # admin
    path('admin/', admin.site.urls),

    # main
    path('', include('main.urls')),

    # api
    path('api/v1/', include('api.urls')),
] 
handler404 = pageNotFound