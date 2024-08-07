from rest_framwork      import Serializers
from ..oauth.models     import User_info


class   ProfileSerializer(Serializers.ModelSerializer):
    model = User_info
    fields=[
        'username',
        # 'first_name',
        # 'last_name',
        'email',
        'password1',
        'password2'
    ]
    def create(self, validated_data):
        user = User_info(
            email=validated_data['email'],
            username=validated_data['username'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password1=validated_data['password1'],
            password2=validated_data['password2']
        )
        user.set_password(validated_data['password1'])
        user.save()
        return user