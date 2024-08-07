from django import forms
from django.contrib.auth.forms import UserCreationForm
from .models import User_info

class CustomerForm(UserCreationForm):
    class Meta:
        model = User_info
        fields = [
            'id',
            'username',
            'email',     
            'password1', 
            'password2'
        ]
