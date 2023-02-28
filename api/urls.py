from django.urls import path, include, re_path
# from rest_framework_simplejwt.views import TokenVerifyView, TokenRefreshView, TokenObtainPairView
from rest_framework import routers

from api.views import *

urlpatterns = [
   path('MainCategory/', MainCategoryView.as_view({'get': 'list'})),
   path('ProductsByMainProduct/', ProductsByMainProductView.as_view({'get': 'list'})),
   path('CategoryByProduct/', CategoryByProductView.as_view({'get': 'list'})),
   path('CategoryByID/', CategoryByID.as_view({'get': 'list'})),
   
   path('ProductsByMainProductFilter/', ProductsByMainProductFilterView.as_view({'get': 'list'})),
   
   
   
   
]