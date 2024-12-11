# consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import sync_to_async
from oauth.models        import User_info
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
# from django.contrib.auth import get_user_model

class FriendRequestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        print(f"Connected user: {self.user}")
        
        # Fetch the latest user data from the database to ensure it's up to date
        if self.user.is_authenticated and isinstance(self.user, User_info):
            self.user = await database_sync_to_async(self.get_user_by_id)(self.user.id)

            self.group_name = f'user_{self.user.id}'
            print("this 1", flush=True)
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            self.user.online_status = True
            await sync_to_async(self.user.save)()
            print("this 2", flush=True)
            await self.accept()
            await self.update_user_status(True)
            await self.notify_to_curr_user_form_friends()
            await sync_to_async(User_info.objects.update_or_create)(
                id=self.user.id,
                defaults={
                    "online_status": True,
                }
            )
            print("this 3", flush=True)
        else:
            print("Anonymous user connected")
            await self.close()
    def get_user_by_id(self, user_id):
        return User_info.objects.get(id=user_id)
    # async def disconnect(self, close_code):
    #     print ('\033[1;32m Disconnect it \n')
    #     self.user = self.scope["user"]
    #     self.user.online_status = False
    #     (self.user.save)
    #     await self.update_user_status(False)
    #     await self.notify_to_curr_user_form_friends()
    #     await  User_info.objects.update_or_create(self.user)
    #     print("this 4", flush=True)
    #     await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def disconnect(self, close_code):
        print('\033[1;32m Disconnect it \n')
        
        self.user = self.scope["user"]

        if self.user.is_authenticated:
            self.user.online_status = False
            await sync_to_async(self.user.save)()  # Fix the synchronous save call

            await self.update_user_status(False)
            await self.notify_to_curr_user_form_friends()

            # Corrected update_or_create call
            await database_sync_to_async(User_info.objects.update_or_create)(
                id=self.user.id,
                defaults={"online_status": False}
            )

        print("this 4", flush=True)
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)

        if data.get('type') == 'notif':

            recipient_id = data['id']
            sender_id = data['senderID']

            friends = await sync_to_async(list)(self.user.friends.all())
            for friend in friends:
                if friend.id == recipient_id:
                    await self.channel_layer.group_send(
                    f'user_{friend.id}',
                    {
                        'type': "receive_norif",
                        'friend': recipient_id,
                        'senderID': sender_id
                    }
                )
        if data.get('type') == 'requestFriend':

            recipient_id = data['recipient_id']
            sender_id = data['sender_id']
            sender = data['sender']
            recipient = data['recipient']

            print(f"----->>>>>>>  receive {recipient_id} {recipient} __ {sender_id} {sender}  ")
            friends = await sync_to_async(list)(self.user.friends.all())
            for friend in friends:
                if friend.id == recipient_id:
                    print(f'-------- friend : {friend.id}')
                    await self.channel_layer.group_send (
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
            await self.channel_layer.group_send (
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
            friends = await sync_to_async(list)(self.user.friends.all())
            for friend in friends:
                if friend.id == recipient_id:
                    await self.channel_layer.group_send (
                    f'user_{friend.id}',
                    {
                        'type': 'response_block',       
                        'block_id': block_id,
                        'blocker': blocker,
                        'etat': etat
                    }
            )

        print("this 5", flush=True)
    async def update_user_status(self, user_status):
        # channel_layer = get_channel_layer()
        print ('\033[1;32m ready to notify them \n')
        print ('\033[1;32m status_user : \n', self.user.is_authenticated)
        print ('\033[1;32m notify all your friends \n')
        friends = await sync_to_async(list)(self.user.friends.all())
        i = 0
        for friend in friends :
            print ('\033[1;22m count friend = ', i + 1)
            await self.channel_layer.group_send(
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

    async def notify_to_curr_user_form_friends(self):

        friends = await sync_to_async(list)(self.user.friends.all())
        print ('20 : fiends notfiy the user  \n')
        for friend in friends :
            await sync_to_async(friend.refresh_from_db)()
            friend_status = friend.online_status
            print ('user_friend  : ', friend.username , "\n")
            print ('user_friend_status  : ', friend_status, "\n")
            print ('user = ', friend.username)
            await self.send(text_data=json.dumps({
                'status'       : 'success',
                'option'       : 'is_online',
                'data' : {
                    'id'               : friend.id,
                    'option'           : 'is_online',
                    'username'         : friend.username,
                    'online_status'    : friend_status
                }
            }))

    async def receive_norif(self, event):
        _id = event['friend']
        senderID = event['senderID']

        await self.send(text_data=json.dumps ({
            'type': 'receive_norif',
            'recipient_id': _id,
            'senderID': senderID
        }))

    async def response_block(self, event):
        block_id = event['block_id']
        blocker = event['blocker']
        etat = event['etat']

        await self.send(text_data=json.dumps ({
            'type': 'response_block',
            'block_id': block_id,
            'blocker': blocker,
            'etat': etat
        }))

    async def play_invitation(self, event):
        author = event["author"]
        recipient = event["recipient"]
        sender_id = event['sender_id']

        await self.send(text_data=json.dumps ({
                'type': 'play_invitation',
                'author': author,
                'senderId': sender_id,
                'recipient': recipient
        }))

    async def response_invitation(self, event):
        # author = event["author"]
        recipient = event["recipient"]
        confirmation = event["confirmation"]
        Groomcode = event['roomcode']
        await self.send(text_data=json.dumps ({
                'type': 'response_invitation',
                'recipient': recipient,
                'confirmation': confirmation,
                'roomcode': Groomcode
        }))
    
    async def notify_user_status(self, event):
        # Send a message to the WebSocket client
        print ('0 : user notify friends \n')
        await self.send(text_data=json.dumps({
            'status'       : 'success',
            'option'       : 'is_online',
            'data'         : event['data']
        }))

    # Handle receiving status updates (broadcast to clients)
    async def notify_receive_id(self, event):
        # Send a message to the WebSocket client
        print ('1 : notify_receive_id-----------------------')
        await self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'receive_frd_req',
            'data': event['data']
        }))
    async def  notify_refuse_id(self, event):
        # Send a message to the WebSocket client
        print ('2 : notify_refuse_id')
        print ('2222222222222222222222222222222222222222222222222222222222222222\n')
        await self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'refuse_frd_req',
            'data': event['data']
        }))
    async def notify_unfriend_id(self, event):
        # Send a message to the WebSocket client
        print ('3 : notify_unfriend_id')
        await self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'unfriend',
            'data': event['data']
        }))
    async def Notify_UserIsAccepted(self, event):
        # Send a message to the WebSocket client
        print ('4 : Notify_friend_state')
        await self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'accepte_request',
            'data': event['data']
        }))
    async def notify_canelfriend(self, event):
        # Send a message to the WebSocket client
        print ('5 : notify_canelfriend')
        await self.send(text_data=json.dumps({
            'status': 'success',
            'option' : 'canel',
            'data': event['data']
        }))
