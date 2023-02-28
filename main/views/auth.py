from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User

# @login_required(login_url='/authorization/')  # check authenticated
def auth(request):
    """Auth page"""
    context = {'title': 'Авторизация'}
    
    if request.method == 'POST':

        email = request.POST['email']
        password = request.POST['password']
        
        # user = authenticate(request, email=email, password=password)
        user = authenticate(request, email=email, password=password)
        print(user)
        if user is not None:
            login(request, user)
            return redirect('main')
        else:
            return redirect('auth')

    return render(request, 'main/auth.html', context)