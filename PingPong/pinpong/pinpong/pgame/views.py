from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Proom
from .serializers import ProomSerializer

# Create your views here.

class RoomListCreateAPIView(APIView):
    
    def get(self, request):
        rooms = Proom.objects.filter(players__lt=2, is_reserved=0)
        if rooms.exists():
            room = rooms.first()
            room.players += 1
            room.save()
            serializer = ProomSerializer(room)
            return Response(serializer.data)
        return Response({"message": "No available rooms"}, status=404)

    def post(self, request):
        code = request.data.get('code')
        gameType = request.data.get('type')
        room = Proom.objects.create(code=code)
        if (gameType == "local" or gameType == 'tourn'):
            room.players = 2
        if (request.data.get('is_reserved') == 1):
            room.is_reserved = 1
        room.players += 1
        room.save()
        serializer = ProomSerializer(room)
        return Response(serializer.data)


class TheRoomView(APIView):
    def get(self, request, code):
        rooms = Proom.objects.filter(code=code)
        if rooms.exists():
            room = rooms.first()
            room.players += 1
            room.save()
            serializer = ProomSerializer(room)
            return Response(serializer.data)
        return Response({"message": "No available rooms"}, status=404)