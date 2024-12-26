from rest_framework import serializers
from .models import Proom

class ProomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proom
        fields = ['id', 'code', 'players']
