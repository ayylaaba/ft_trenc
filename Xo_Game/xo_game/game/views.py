
# Create your views here.
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import XRoom
from .serializers import XRoomSerializer

class RoomListCreateAPIView(APIView):
    
    def get(self, request):
        rooms = XRoom.objects.filter(players__lt=2)
        if rooms.exists():
            room = rooms.first()
            room.players += 1
            room.save()
            serializer = XRoomSerializer(room)
            return Response(serializer.data)
        return Response({"message": "No available rooms"}, status=404)

    def post(self, request):
        code = request.data.get('code')
        room = XRoom.objects.create(code=code)
        room.players += 1
        room.save()
        serializer = XRoomSerializer(room)
        return Response(serializer.data)