from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/friend_requests/', consumers.FriendRequestConsumer.as_asgi()),
]
