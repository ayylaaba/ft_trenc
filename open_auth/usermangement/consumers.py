# consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from oauth.models        import User_info

class FriendRequestConsumer(WebsocketConsumer):

    def connect(self):
        self.user = self.scope["user"]
        print(f"Connected user: {self.user}")
        if self.user.is_authenticated and isinstance(self.user, User_info):
            self.group_name = f'user_{self.user.id}'
            async_to_sync(self.channel_layer.group_add)(self.group_name, self.channel_name)
            self.user.online_status = True
            self.user.save()
            self.accept()
            self.update_user_status(True)
            self.notify_to_curr_user_form_friends()
        else:
            print("Anonymous user connected")
            self.close()

    def disconnect(self, close_code):
        print ('\033[1;32m Disconnect it \n')
        self.user = self.scope["user"]
        self.user.online_status = False
        self.user.save()
        self.update_user_status(False)
        self.notify_to_curr_user_form_friends()
        async_to_sync(self.channel_layer.group_discard)(self.group_name, self.channel_name)

    def receive(self, text_data):
        data = json.loads(text_data)

        print('>>>>>>>> type', data.get('type'))

        if data.get('type') == 'requestFriend':

            recipient_id = data['recipient_id']
            sender_id = data['sender_id']
            sender = data['sender']
            recipient = data['recipient']

            print(f"----->>>>>>>  receive {recipient_id} {recipient} __ {sender_id} {sender}  ")
            friends = self.user.friends.all()
            for friend in friends:
                if friend.id == recipient_id:
                    print(f'-------- friend : {friend.id}')
                    async_to_sync(self.channel_layer.group_send) (
                    f'user_{friend.id}',
                    {
                        'type': 'play_invitation',
                        'author': sender,
                        'sender_id': sender_id,
                        'recipient': recipient,
                    }
        )

        if data.get('type') == 'response':

            print('-----------------response section')
            recipient = data['recipient']
            sender = data['sender']
            senderId = data['sender_id']
            Groomcode = data['roomcode']
            confirmation = data.get('confirmation')
            print(f">>>>>>>>>>>>> response {recipient} __ {confirmation},,, {senderId}")
            print("not Here")
            async_to_sync(self.channel_layer.group_send) (
            f'user_{senderId}',
            {
                'type': 'response_invitation',
                "recipient": recipient,
                "confirmation": confirmation,
                'roomcode':Groomcode
            },
        )
        if data.get('type') == 'request_block':

            recipient_id = data['recipient_id']
            block_id = data.get('blocked_id')
            blocker = data.get('blocker')
            etat = data.get('etat')

            print(">>>>>>>>>> request blocking", recipient_id, block_id)
            friends = self.user.friends.all()
            for friend in friends:
                if friend.id == recipient_id:
                    async_to_sync(self.channel_layer.group_send) (
                    f'user_{friend.id}',
                    {
                        'type': 'response_block',       
                        'block_id': block_id,
                        'blocker': blocker,
                        'etat': etat
                    }
            )

    def update_user_status(self, user_status):
        # channel_layer = get_channel_layer()
        print ('\033[1;32m ready to notify them \n')
        print ('\033[1;32m status_user : \n', self.user.is_authenticated)
        print ('\033[1;32m notify all your friends \n')
        friends = self.user.friends.all()
        i = 0
        for friend in friends :
            print ('\033[1;22m count friend = ', i + 1)
            async_to_sync(self.channel_layer.group_send)(
                f'user_{friend.id}',
                {
                    'type'           : 'notify_user_status',
                    'data':
                    {
                        'id'             : self.user.id,
                        'username'       : self.user.username,
                        # 'imageProfile'   : self.user.imageProfile,
                        'online_status'  : user_status
                    }
                }
            )

    def notify_to_curr_user_form_friends(self):

        friends = self.user.friends.all()
        print ('20 : fiends notfiy the user  \n')
        for friend in friends :
            friend.refresh_from_db() 
            friend_status = friend.online_status
            print ('user_friend  : ', friend.username , "\n")
            print ('user_friend_status  : ', friend.online_status, "\n")
            print ('user = ', friend.username)
            self.send(text_data=json.dumps({
                'status'       : 'success',
                'option'       : 'is_online',
                'data' : {
                    'id'               : friend.id,
                    'option'           : 'is_online',
                    'username'         : friend.username,
                    'online_status'    : friend_status
                }
            }))

    def response_block(self, event):
        block_id = event['block_id']
        blocker = event['blocker']
        etat = event['etat']

        self.send(text_data=json.dumps ({
            'type': 'response_block',
            'block_id': block_id,
            'blocker': blocker,
            'etat': etat
        }))

    def play_invitation(self, event):
        author = event["author"]
        recipient = event["recipient"]
        sender_id = event['sender_id']

        self.send(text_data=json.dumps ({
                'type': 'play_invitation',
                'author': author,
                'senderId': sender_id,
                'recipient': recipient
        }))

    def response_invitation(self, event):
        # author = event["author"]
        recipient = event["recipient"]
        confirmation = event["confirmation"]
        Groomcode = event['roomcode']
        self.send(text_data=json.dumps ({
                'type': 'response_invitation',
                'recipient': recipient,
                'confirmation': confirmation,
                'roomcode': Groomcode
        }))
    
    def notify_user_status(self, event):
        # Send a message to the WebSocket client
        print ('0 : user notify friends \n')
        self.send(text_data=json.dumps({
            'status'       : 'success',
            'option'       : 'is_online',
            'data'         : event['data']
        }))

    # Handle receiving status updates (broadcast to clients)
    def notify_receive_id(self, event):
        # Send a message to the WebSocket client
        print ('1 : notify_receive_id-----------------------')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'receive_frd_req',
            'data': event['data']
        }))
    def  notify_refuse_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_refuse_id')
        print ('2222222222222222222222222222222222222222222222222222222222222222\n')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'refuse_frd_req',
            'data': event['data']
        }))
    def notify_unfriend_id(self, event):
        # Send a message to the WebSocket client
        print ('3 : notify_unfriend_id')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'unfriend',
            'data': event['data']
        }))
    def Notify_UserIsAccepted(self, event):
        # Send a message to the WebSocket client
        print ('4 : Notify_friend_state')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'accepte_request',
            'data': event['data']
        }))
    def notify_canelfriend(self, event):
        # Send a message to the WebSocket client
        print ('5 : notify_canelfriend')
        self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'canel',
            'data': event['data']
        }))
