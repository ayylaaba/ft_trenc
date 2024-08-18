from rest_framework import serializers
from oauth.models     import User_info

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

# class   UpdateUser(Serializers.ModelSerialzer):
#     model = User_info
#     fields=[
#         'username',
#         'fullname',
#         'firstname',
#         'lastname',
#         'email'
#     ]
#     def create(self, validated_data):
#         user = User_info(
#             email=validated_data['email'],
#             username=validated_data['username'],
#             first_name=validated_data['first_name'],
#             last_name=validated_data['last_name'],
#             password1=validated_data['password1'],
#             password2=validated_data['password2']
#         )
#         user.set_password(validated_data['password1'])
#         user.save()
#         return user