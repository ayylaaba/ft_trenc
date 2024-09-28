# consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from oauth.models        import User_info

class FriendRequestConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope["user"]  # Get the user making the connection
        self.group_name = f'friend_requests_{self.user.id}'

        print ('------------- enter -------------\n')
        print ('is_authenticated : ', self.user.is_authenticated)
        print ('group name : ',   self.group_name )
        print ('channel_name : ', self.channel_name)
        async_to_sync(self.channel_layer.group_add)(f"user_{self.user.id}", self.channel_name)
        self.update_user_status(True)
        self.accept()  # Accept the WebSocket connection

    def disconnect(self, close_code):
        self.user  = self.scope["user"]
        update_user_status(False)
        group_name = self.channel_layer.group_name
        async_to_sync(self.channel_layer.group_discard)(group_name, self.channel_name)

    def update_user_status(self, user_status):
        # channel_layer = get_channel_layer()
        if self.user.is_authenticated:  # Check if the user is logged in
            friends = self.user.friends.all()
            for friend in friends :
                async_sync(channel.group_send)(
                    f'user_{friend.id}',
                    {
                        'type'           : 'notify_user_status',
                        'username'       : user.username,
                        'online_status'  : user_status 
                    }
                )

    def notify_user_status(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_user_status')
        self.send(text_data=json.dumps({
            'status'       : 'success',
            'username'     : event['username'],
            'online_status': event['online_status']
        }))

    # Handle receiving status updates (broadcast to clients)
    def notify_receive_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_receive_id')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'receive_frd_req',
            'data': event['data']
        }))
    def  notify_refuse_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_refuse_id')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'refuse_frd_req',
            'data': event['data']
        }))
    def notify_unfriend_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_unfriend_id')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'unfriend',
            'data': event['data']
        }))
    def Notify_friend_state(self, event):
        # Send a message to the WebSocket client
        print ('2 : Notify_friend_state')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'is_online',
            'data': event['data']
        }))
    def notify_canelfriend(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_canelfriend')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'canel',
            'data': event['data']
        }))
