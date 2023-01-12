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
from account.models import Account
from .serializers import AccountSerializer

# Create your views here.
class AccountAPIDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    CRUD request
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer


class AccountAPIListPagination(PageNumberPagination):
    """
    CUSTOM PAGINSTION
    """
    page_size = 3
    page_size_query_param = 'page_size'
    max_page_size = 10000


class AccountAPIList(generics.ListCreateAPIView):
    """
    GET and POST request
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = (IsAuthenticatedOrReadOnly,)
    # pagination_class = AccountAPIListPagination

