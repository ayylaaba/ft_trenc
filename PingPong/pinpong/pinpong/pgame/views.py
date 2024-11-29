from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Proom
from .serializers import ProomSerializer

# Create your views here.

class RoomListCreateAPIView(APIView):
    
    def get(self, request):
        rooms = Proom.objects.filter(players__lt=2)
        print("it is empty", rooms.exists())
        print("room size is ", rooms.__sizeof__())
        if rooms.exists():
            room = rooms.first()
            room.players += 1
            print("room player are ", room.players)
            room.save()
            serializer = ProomSerializer(room)
            return Response(serializer.data)
        return Response({"message": "No available rooms"}, status=404)

    def post(self, request):
        print("Create room")
        code = request.data.get('code')
        gameType = request.data.get('type')
        print("code of  room", code)
        room = Proom.objects.create(code=code)
        print("room player is ", room.players)
        if (gameType != "remote"):
            room.players = 2
            room.save()
        print("game type is ", gameType, flush=True)
        print("players are ", room.players, flush=True)
        serializer = ProomSerializer(room)
        print("*-------------------------------------------------------------------------*")
        return Response(serializer.data)