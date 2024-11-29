from rest_framework import serializers
from .models import XRoom

class XRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = XRoom
        fields = ['id', 'code', 'created_at', 'players']
