from rest_framework import serializers
from .models import User_info

class       CustmerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    password1 = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True)
    # fullname = serializers.CharField(required=True)
    class Meta :
        model = User_info
        fields = [
            'id',
            # 'full_name',
            'username',
            'email',     
            'password1',
            'password2',
        ]
    def create(self, validated_data):
        if validated_data['password1'] != validated_data['password2']:
            raise serializers.ValidationError({"password2": "Passwords must match"})
        
        user = User_info(
            email=validated_data['email'],
            username=validated_data['username']
        )
        user.set_password(validated_data['password1'])
        user.save()
        return user