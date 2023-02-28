from http.client import HTTPResponse
from django.shortcuts import render, redirect
from django.http import HttpResponse, HttpResponseNotFound, Http404
from api.models import *
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import json
from django.http import JsonResponse
from django.core import serializers
from django.forms.models import model_to_dict
from django.db.models.fields.files import ImageFieldFile
from django.forms import model_to_dict
from django.core.serializers.json import DjangoJSONEncoder
from django.db.models import Model



@login_required(login_url='/auth/')
def payment(request):
    """Payment page"""

    orders = Order.objects.filter(user=request.user).first()
    account = Account.objects.filter(user=request.user.id).first()
    deliveryAddresses = DeliveryAddresses.objects.all()
    total = 0

    json_order = json.loads(orders.order)

    # get current order
    for item in json_order:
        total += sum([i['total'] for i in list(json_order[item].values())])

    # Create USER ORDER
    if request.method == 'POST':
        comment = request.POST.get('comment')
        delivery = request.POST.get('radiodelivery')
        address = request.POST.get('radioaddress')
        pay = request.POST.get('radiopay')

        UserOrder.objects.create(user=request.user,
                                 address=DeliveryAddresses.objects.filter(
                                     id=address).first(),
                                 comment=comment,
                                 number=orders.id,
                                 payment_status=PaymentStatus.objects.filter(
                                     name='Не оплачен').first(),
                                 order_status=OrderStatus.objects.filter(
                                     name='В обработке').first(),
                                 total=total,
                                 items=orders.order,
                                 payment_method=pay,
                                 way_get=delivery
                                 )