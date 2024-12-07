from django.urls import re_path
from .consumers import PingPongConsumer

websocket_urlpatterns = [
    re_path(r'wss/playp/(?P<room_code>\w+)/$', PingPongConsumer.as_asgi()),
    re_path(r'wss/playp/', PingPongConsumer.as_asgi()),
]