# consumers.py
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.utils import timezone
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import User_info

class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
         # Conceptual Structure of online_users Group
        # Group Name: online_users
        # Content: A collection of WebSocket connections (one per user)
        # Purpose: To broadcast messages (like status updates) to all users in the group.
        # Add user to the group "online_users"
        await self.channel_layer.group_add("online_users", self.channel_name)
        
        # Mark user as online
        await self.set_user_status(self.user.id, "online")
        
        await self.accept()

    async def disconnect(self, close_code):
        # Remove user from the group
        await self.channel_layer.group_discard("online_users", self.channel_name)
        
        # Mark user as offline
        await self.set_user_status(self.user.id, "offline")

    async def set_user_status(self, user_id, status):
        # Update user's status in the database
        user = await sync_to_async(User_info.objects.get)(id=user_id)
        user.is_online = (status == "online")
        await sync_to_async(user.save)()
        
        # Broadcast the status update to all connected clients
        await self.channel_layer.group_send(
            "online_users",
            {
                "type": "status_update",
                "user_id": user_id,
                "status": status
            }
        )
    # i thnk that understand finaly
    async def status_update(self, event):
        # Send the status update to the client
        await self.send(text_data=json.dumps({
            "user_id": event["user_id"],
            "status": event["status"]
        }))
