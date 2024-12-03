import json
from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message, Room, Block
# from django.contrib.auth.models import User

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        await self.accept()
        room = await sync_to_async(Room.objects.get)(id=self.room_name)
        block = await sync_to_async(Block.objects.filter(room=room).exists)()
        if (block):
            await self.send(text_data=json.dumps({
            'message_block': 'this conversation was blocked',
            'is_blocked' : True
            }))
            await self.close()
        else:
            await self.channel_layer.group_add (
                self.room_group_name,
                self.channel_name
            )
        messages = await sync_to_async(list) (
        Message.objects.filter(room=room).order_by('timestamp').all()
        )

        for message in messages:
            await self.send(text_data=json.dumps ({
            'author': message.author,
            'message': message.content,
            }))

    async def disconnect(self, close_code):

        await self.channel_layer.group_discard (
            self.room_group_name,
            self.channel_name
        )
        print("Connection closed")

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        sender = text_data_json.get('author', '')
        recipient = text_data_json.get('recipient', '')
        content = text_data_json.get('message', '')
        room_id = text_data_json.get('roomId', '')

        print(f"Sender: {sender}, recipient: {recipient} ,Message: {content}, Room: {room_id}")

        if room_id:
            room = await sync_to_async(Room.objects.get)(id=room_id)
            message = await sync_to_async(Message.objects.create)(
                author=sender,
                content=content,
                room=room
            )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "author": sender,
                "message": content,
            }
        )

    async def chat_message(self, event):
        author = event["author"]
        message = event["message"]

        await self.send(text_data=json.dumps ({
            'author': author,
            'message': message,
        }))
