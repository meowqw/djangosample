
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
from rest_framework import status
from datetime import datetime
from django.db.models import F
from django.db.models import Q
import json

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
        main_product = MainProduct.objects.filter(
            id=self.request.GET['main_product']).all()

        if ('status' in self.request.GET):
            status = [i for i in self.request.GET['status'].split(
                ',') if len(i) > 0]
            print(status)

        if ('weight' in self.request.GET):
            weight = [i for i in self.request.GET['weight'].split(',') if len(i) > 0]
            main_product = main_product.filter(id_product_list__weight__in=weight)
            for i in main_product:
                product_list = i.id_product_list.filter(weight__in=weight)
                i.id_product_list.set(product_list)
                
            

        if ('availability' in self.request.GET):
            availability = [
                i for i in self.request.GET['availability'].split(',') if len(i) > 0]
            print(availability)

        # if ('weight' in self.request.GET):
        #     weight = [i for i in self.request.GET['weight'].split(
        #         ',') if i.isdigit()]
        #     if len(weight) > 0:
        #         product = product.filter(weight__in=weight)

        # if ('availability' in self.request.GET):
        #     availability = [i for i in self.request.GET['availability'].split(',') if len(i) > 0]

        return main_product

    serializer_class = MainProductSerializer


class CreateOrderAPIVIew(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data

        data['user'] = request.user.id
        data['debt'] = 0
        data['payment_status'] = 'NOTPAID'
        data['order_status'] = 'INPROCESSING'

        serializer = OrderSerializer(data=data)
        if serializer.is_valid():
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)  # only auth user


class AddressAPIVIew(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        address = DeliveryAddresses.objects.all()
        return address

    serializer_class = DeliveryAddressesSerializer


class OrderAPIView(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        order = Order.objects.filter(user=self.request.user.id)

        if ('address' in self.request.GET):
            address = [i for i in self.request.GET['address'].split(
                ',') if len(i) > 0]
            if len(address) > 0:
                order = order.filter(address__in=address)

        if ('payment' in self.request.GET):
            payment = [i for i in self.request.GET['payment'].split(
                ',') if len(i) > 0]
            if len(payment) > 0:
                order = order.filter(payment_status__in=payment)

        if ('from' in self.request.GET):
            date_from = datetime.strptime(self.request.GET['from'], '%Y-%m-%d')
            date_to = datetime.strptime(self.request.GET['to'], '%Y-%m-%d')
            order = order.filter(time_create__range=(date_from, date_to))

        return order

    serializer_class = OrderSerializer
