from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound
from django.contrib.auth.decorators import login_required
# from main.forms import *
from main.models import *

@login_required(login_url='/auth/')  # check authenticated
def main(request):
    """Main page"""
    context = {'title': 'Главная'}

    categories = MainCategory.objects.all()
    
    context['categories'] = categories

    banners = Banners.objects.all()
    context['banners'] = banners
    
    account = Account.objects.get(user=request.user)
    context['account'] = account
    
    addresses = DeliveryAddresses.objects.all()
    context['addresses'] = addresses
    
    orders = Order.objects.filter(user=request.user).all().order_by('-time_create')
    context['orders'] = orders
    
    debt = 0
    # сумма задолжнности
    for order in orders:
        debt += order.debt
    
    context['debt'] = debt
    
    
    return render(request, 'main/main.html', context)