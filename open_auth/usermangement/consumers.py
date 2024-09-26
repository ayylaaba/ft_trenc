# consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class FriendRequestConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]  # Get the user making the connection
        self.group_name = f'friend_requests_{self.user.id}'

        print ('------------- enter -------------\n')
        print ('is_authenticated : ', self.user.is_authenticated)
        if self.user.is_authenticated:  # Check if the user is logged in
            print ('group name : ',   self.group_name )
            print ('channel_name : ', self.channel_name)
            async_to_sync(self.channel_layer.group_add)(f"user_{self.user.id}", self.channel_name)
        self.accept()  # Accept the WebSocket connection

    def disconnect(self, close_code):
        self.user  = self.scope["user"]
        group_name = self.channel_layer.group_name
        async_to_sync(self.channel_layer.group_discard)(group_name, self.channel_name)

    # Handle receiving status updates (broadcast to clients)
    def notify_receive_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_receive_id')
        self.send(text_data=json.dumps({
            'status': 'success',
            'data': event['data']
        }))
    def  notify_refuse_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_refuse_id')
        self.send(text_data=json.dumps({
            'status': 'success',
            'data': event['data']
        }))
    def notify_unfriend_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_unfriend_id')
        self.send(text_data=json.dumps({
            'status': 'success',
            'data': event['data']
        }))
    def Notify_friend_state(self, event):
        # Send a message to the WebSocket client
        print ('2 : Notify_friend_state')
        self.send(text_data=json.dumps({
            'status': 'success',
            'data': event['data']
        }))
