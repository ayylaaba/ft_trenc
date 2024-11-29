
# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import XRoom
from .serializers import XRoomSerializer

class RoomListCreateAPIView(APIView):
    
    def get(self, request):
        rooms = XRoom.objects.filter(players__lt=2)
        print("it is empty", rooms.exists())
        if rooms.exists():
            room = rooms.first()
            room.players += 1
            print("room player are ", room.players)
            room.save()
            serializer = XRoomSerializer(room)
            return Response(serializer.data)
        return Response({"message": "No available rooms"}, status=404)

    def post(self, request):
        print("Create room")
        code = request.data.get('code')
        print("code of  room", code)
        room = XRoom.objects.create(code=code)
        print("room player is ", room.players)
        serializer = XRoomSerializer(room)
        print("*-------------------------------------------------------------------------*")
        return Response(serializer.data)