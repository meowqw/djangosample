from django.urls import path, include, re_path
# from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView, TokenObtainPairView
from rest_framework import routers

from api.views import *

urlpatterns = [
   path('account/<int:pk>', AccountAPIDetailView.as_view()),
   path('accountList/', AccountAPIList.as_view()),
]