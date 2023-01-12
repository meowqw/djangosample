from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate

from account.models import Account

styles_resistation = {'email': {'class': '', 'placeholder': 'Почта'},
                      'username': {'class': '', 'placeholder': 'Логин'},
                      'fname': {'class': '', 'placeholder': 'Имя'},
                      'lname': {'class': '', 'placeholder': 'Фамилия'},
                      'password1': {'class': '', 'placeholder': 'Пароль'},
                      'password2': {'class': '', 'placeholder': 'Пароль еще раз'},
                      'phone': {'class': '', 'placeholder': 'Телефон'}}

styles_authoriation = {'username': {'class': '', 'placeholder': 'Введи логин'},
                       'password': {'class': '', 'placeholder': 'Введи пароль'}}


class RegistrationForm(UserCreationForm):

    email = forms.EmailField(max_length=60,
                             help_text='Required',
                             widget=forms.TextInput(
                                 attrs=styles_resistation['email']))

    username = forms.CharField(max_length=60,
                               help_text='Required',
                               widget=forms.TextInput(
                                   attrs=styles_resistation['username'])
                               )

    fname = forms.CharField(max_length=60,
                            help_text='Required',
                            widget=forms.TextInput(
                                attrs=styles_resistation['fname'])
                            )

    lname = forms.CharField(max_length=60,
                            help_text='Required',
                            widget=forms.TextInput(
                                attrs=styles_resistation['lname'])
                            )

    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs=styles_resistation['password1'])
    )

    phone = forms.CharField(max_length=60,
                            help_text='Required',
                            widget=forms.TextInput(
                                attrs=styles_resistation['phone'])
                            )

    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs=styles_resistation['password2'])
    )

    class Meta:
        model = Account
        fields = ('email', "username", "fname", "lname",
                  "phone","password1", "password2")


class AccountAuthenticationForm(forms.ModelForm):
    password = forms.CharField(
        widget=forms.PasswordInput(attrs=styles_authoriation['password'])
    )

    username = forms.CharField(max_length=60,
                               help_text='Required',
                               widget=forms.TextInput(
                                   attrs=styles_authoriation['username'])
                               )
    
    class Meta:
        model = Account
        fields = ('username', 'password')

    def clean(self):
        if self.is_valid():
            username = self.cleaned_data['username']
            password = self.cleaned_data['password']
            if not authenticate(username=username, password=password):
                raise forms.ValidationError('Invalid username or password')