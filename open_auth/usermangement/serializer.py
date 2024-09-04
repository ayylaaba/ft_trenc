from rest_framework import serializers
from oauth.models     import User_info
from .models            import RequestFriend
from django.contrib.auth.hashers import make_password

class       RequestFriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequestFriend
        fields = [
            'id',
            'from_user',
            'to_user',
            'accepted', 
            'timestamp'
        ]

class   ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_info
        fields = [
            'id',
            'username',
            'fullname',
            'firstname',
            'lastname',
            'email'
        ]

class UpdateUserSerializers(serializers.ModelSerializer):
    class Meta:
        model = User_info
        fields = [
            'id',
            'firstname',
            'lastname',
            'email'
        ]
    
    def validate(self, data):
        if 'confirm_password' in data and 'password' in data:
            if data['password'] != data['confirm_password']:
                raise serializers.ValidationError("Passwords do not match.")
        return data

    def update(self, instance, validated_data):
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
            validated_data.pop('confirm_password', None)
        return super().update(instance, validated_data)
    