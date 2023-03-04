
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
from django.db.models import Q, Prefetch
from django.db.models import Count
import json
from django.http import JsonResponse


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


class ProductsByMainProductFilterView(APIView):
    """
    Only read Products
    """

    def get(self, request):
        main_product_id = self.request.GET.get('main_product')
        main_product = MainProduct.objects.filter(id=main_product_id)

        # Serialize queryset to JSON
        serializer = MainProductSerializer(main_product, many=True)
        json_data = serializer.data

        # Apply filters
        if 'status' in self.request.GET:
            status = set(i for i in self.request.GET['status'].split(',') if len(i) > 0)
            # Filter out id_product_list with filtered id_product
            for mp in json_data:
                for id_plist in mp.get('id_product_list', []):
                    id_product_filtered = []
                    for id_product in id_plist.get('id_product', []):
                        if id_product['status'] in status:
                            id_product_filtered.append(id_product)
                    id_plist['id_product'] = id_product_filtered

        if 'weight' in self.request.GET:
            weight = set(i for i in self.request.GET['weight'].split(',') if len(i) > 0)
            # Filter out id_product_list with filtered weight
            for mp in json_data:
                id_plist_filtered = []
                for id_plist in mp.get('id_product_list', []):
                    if id_plist.get('weight') in weight:
                        id_plist_filtered.append(id_plist)
                mp['id_product_list'] = id_plist_filtered

        if 'availability' in self.request.GET:
            availability = set(i for i in self.request.GET['availability'].split(',') if len(i) > 0)
            # Filter out stock, way, remote based on filtered availability
            for mp in json_data:
                for id_plist in mp.get('id_product_list', []):
                    for id_product in id_plist.get('id_product', []):
                        for k in list(id_product.keys()):
                            if k in ('stock', 'way', 'remote') and k not in availability:
                                id_product[k]['availability'] = 0 



        return JsonResponse(json_data, safe=False)

    serializer_class = MainCategorySerializer






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
