from django.urls import path
from .views import RoomListCreateAPIView
from .views import TheRoomView
urlpatterns = [
    path('api/prooms/', RoomListCreateAPIView.as_view()),
    path('api/fprooms/room/<str:code>/', TheRoomView.as_view())
]