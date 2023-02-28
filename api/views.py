from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView
from django.forms import model_to_dict
from rest_framework import mixins
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser, IsAuthenticated
# from .permissions import IsAdminReadOnly, IsOwnerOrReadOnly
from main.models import *
from .serializers import *


class MainCategoryView(viewsets.ReadOnlyModelViewSet):
    """
    Only read Category
    """

    def get_queryset(self):
        categories = MainCategory.objects.all()
        return categories

    serializer_class = MainCategorySerializer


class ProductsByMainProductView(viewsets.ReadOnlyModelViewSet):
    """
    Only read Products
    """

    def get_queryset(self):
        main_product = MainProduct.objects.filter(
            id=self.request.GET['main_product']).all()

        return main_product

    serializer_class = MainProductSerializer


class CategoryByProductView(viewsets.ReadOnlyModelViewSet):
    """
    Get category by MainProduct
    """

    def get_queryset(self):
        product = Product.objects.get(id=self.request.GET['product_id'])
        categoryProduct = product.productlist_set.all()[0].mainproduct_set.all()[
            0].maincategory_set.all()[0]
        category = MainCategory.objects.filter(id=categoryProduct.id).all()

        return category

    serializer_class = MainCategorySerializer


class CategoryByID(viewsets.ReadOnlyModelViewSet):
    """
    Get category by ID
    """

    def get_queryset(self):
        category = MainCategory.objects.filter(
            id=self.request.GET['category_id']).all()

        return category

    serializer_class = MainCategorySerializer


class ProductsByMainProductFilterView(viewsets.ReadOnlyModelViewSet):
    """
    Only read Products
    """

    def get_queryset(self):

        main_product = MainProduct.objects.filter(id=self.request.GET['main_product'], ).all()
        
        
        if ('status' in self.request.GET):
            status = [i for i in self.request.GET['status'].split(',') if len(i) > 0]
            
            

        # if ('weight' in self.request.GET):
        #     weight = [i for i in self.request.GET['weight'].split(
        #         ',') if i.isdigit()]
        #     if len(weight) > 0:
        #         product = product.filter(weight__in=weight)

        # if ('availability' in self.request.GET):
        #     availability = [i for i in self.request.GET['availability'].split(',') if len(i) > 0]

        return main_product

    serializer_class = MainProductSerializer
