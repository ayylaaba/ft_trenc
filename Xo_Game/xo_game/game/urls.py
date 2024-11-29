from django.urls import path
from .views import RoomListCreateAPIView

urlpatterns = [
    path('api/xrooms/', RoomListCreateAPIView.as_view()),
]
