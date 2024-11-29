from django.urls import path
from .views import RoomListCreateAPIView

urlpatterns = [
    path('api/prooms/', RoomListCreateAPIView.as_view()),
]
