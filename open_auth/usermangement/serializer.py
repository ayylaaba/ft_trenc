from rest_framework import serializers
from oauth.models     import User_info
from django.contrib.auth.hashers import make_password

class   ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User_info
        fields = [
            'username',
            'fullname',
            'firstname',
            'lastname',
            'email'
        ]

class UpdateUserSerializers(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User_info
        fields = [
            'fullname',
            'username',
            'firstname',
            'lastname',
            'password',
            'confirm_password',
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


# class   UpdateUserSerializers(serializers.ModelSerializer):
#     password = serializers.CharField(write_only=True, required=False, min_length=8)
#     confirm_password = serializers.CharField(write_only=True, required=False)

#     model = User_info
#     fields = [
#         'fullname',
#         'username',
#         'firstname',
#         'lastname',
#         'password',
#         'confirm_password',
#         'email'
#     ]
    
#     def validate(self, data):
#         if 'confirm_password' in data and 'password' in data:
#             if data['password'] != data['confirm_password']:
#                 raise serializers.ValidationError("Passwords do not match.")
#             return data

#     def update(self, instance, validated_data):
#         if 'password' in validated_data:
#             validated_data['password'] = make_password(validated_data['password'])
#             validated_data.pop('confirm_password', None)  # Remove confirm_password as it's not a model field
#         return super().update(instance, validated_data)
    