from django.contrib.auth.backends import ModelBackend
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password

# from .models import User


class UserBackend(ModelBackend):
    '''Custom authentication backend'''
    def authenticate(self, request, email=None, password=None):
        try:
            user = User.objects.get(email=email)
            if user is not None and check_password(password, user.password):
                return user
        except User.DoesNotExist:
            pass

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None