from rest_framework import serializers
from .models import User_info

class       CustmerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    email     = serializers.EmailField(required=True)
    fullname = serializers.CharField(required=True)
    class Meta :
        model = User_info
        fields = [
            'id',
            'fullname',
            'imageProfile',
            'username',
            'firstname',
            'lastname',
            'email',
            'online_status'
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)  # Password field
    password2 = serializers.CharField(write_only=True)  # Password confirmation field

    class Meta:
        model = User_info
        fields = ['fullname', 'username', 'firstname', 'lastname', 'email', 'password1', 'password2']

    def validate(self, data):
        # Ensure that the passwords match
        fist_name = data["firstname"].replace(" ","")
        last_name  = data["lastname"].replace(" ","")
        if len(data["username"]) > 8:
            raise serializers.ValidationError({"username": "username holds  more than 8 characters."})
        if len(data["username"]) < 3:
            raise serializers.ValidationError({"username": "username holds  less than 3 characters."})   
        if data['password1'] != data['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        if len(data['password1']) < 8:
            # print ("len : ", len(data['password1']))
            raise serializers.ValidationError({"password": "Passwords hold less than 8 characters."})
        if  not fist_name.isalpha():
            raise serializers.ValidationError({"firstname": "Firstname should only contain alphabetic characters."})
        if  not last_name.isalpha():
            raise serializers.ValidationError({"lastname": "Lastname should only contain alphabetic characters."})
        return data

    def create(self, validated_data):
        # Remove password2 from validated_data as we don't need it
        validated_data.pop('password2')
        password = validated_data.pop('password1')  # Get password1

        # Create the user instance
        user = User_info(**validated_data)
        user.set_password(password)  # Hash the password
        user.save()
        return user