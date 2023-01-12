from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound
from django.contrib.auth.decorators import login_required
# from main.forms import *

# @login_required(login_url='/authorization/')  # check authenticated
def index(request):
    """Main page"""
    context = {'title': 'Главная'}


    return render(request, 'main/index.html', context)