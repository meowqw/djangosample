from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound
from django.contrib.auth.decorators import login_required

def pageNotFound(request, exception):
    """404"""
    return redirect('authorization')