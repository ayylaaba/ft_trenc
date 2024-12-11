import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import XRoom

connected_players = {}
turn_tracker = {}
game_states = {}

class TicTacToeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("in game", flush=True)
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'room_{self.room_code}'
        if self.room_group_name not in game_states:
            game_states[self.room_group_name] = {
                'board': ['', '', '', '', '', '', '', '', ''],  
            }
        if self.room_group_name not in connected_players:
            connected_players[self.room_group_name] = {
                "user1": None,
                "user2": None,
                "user1Name":None,
                "user2Name":None,
                "channels": []
            }
            turn_tracker[self.room_group_name] = 'X'
        if len(connected_players[self.room_group_name]['channels']) >= 2:
            await self.close()
            return
        
        connected_players[self.room_group_name]["channels"].append(self.channel_name)
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        if len(connected_players[self.room_group_name]["channels"]) == 1:
            await self.send(text_data=json.dumps({'event': 'CHOICE', 'message': 'X'}))
        else:
            await self.send(text_data=json.dumps({'event': 'CHOICE', 'message': 'O'}))

        if len(connected_players[self.room_group_name]["channels"]) == 2:
            turn_tracker[self.room_group_name] = 'X'
            print("GAME Start", flush=True)
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'send_message', 'message': 'Game is ready to start!', 'event': 'START'}
            )
        else:
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'send_message', 'message': 'Waiting for the second player...', 'event': 'wait'}
            )
    async def disconnect(self, close_code):
        player_left = None
        if self.room_group_name in connected_players:
            if self.channel_name in connected_players[self.room_group_name]["channels"]:
                player_left = connected_players[self.room_group_name]["channels"].index(self.channel_name)
                print("this is working ", player_left, flush=True)
                player_left = 'X' if player_left == 0 else 'O' 
                connected_players[self.room_group_name]["channels"].remove(self.channel_name)
                print("this is working ", player_left, flush=True)
        if len(connected_players[self.room_group_name]["channels"]) == 1:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': f'{player_left}',
                    'event': 'OVER'
                }
            )
            await self.close()
        if len(connected_players[self.room_group_name]["channels"]) == 0:
            await self.delete_room() 
            del connected_players[self.room_group_name]
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    async def delete_room(self):
        await sync_to_async(XRoom.objects.filter(code=self.room_code).delete)()


    async def receive(self, text_data):
        data = json.loads(text_data)
        event = data['event']
        message = data['message']
        is_game_over = False

        print("we recived ", flush=True)
        if event == 'START':
            if not connected_players[self.room_group_name]["user1"]:
                connected_players[self.room_group_name]["user1"] = message["id"]
                connected_players[self.room_group_name]["user1Name"] = message["name"]
            else:
                connected_players[self.room_group_name]["user2"] = message["id"]
                connected_players[self.room_group_name]["user2Name"] = message["name"]
        if event == 'MOVE':
            print('in Move', data)
            current_turn = turn_tracker[self.room_group_name]
            index = message['index']
            player = message['player']
            board = game_states[self.room_group_name]['board']
            if board[index] == '' and player == current_turn:
                board[index] = player
                if message['player'] == current_turn:
                    await self.channel_layer.group_send(
                        self.room_group_name,
                        {
                            'type': 'send_message',
                            'message': message,
                            'event': 'MOVE'
                        }
                    )
                    print('cuurent is ', current_turn)
            if self.check_winner(board):
                is_game_over = True
                for i in range(len(board)):
                    board[i] = ''
                await self.channel_layer.group_send(
                self.room_group_name,
                    {
                        'type': 'send_message',
                        'message': f'{player}',
                        'event': 'END'
                    }
                )
                turn_tracker[self.room_group_name] = 'X'
            print("in draw", flush=True)
            if '' not in board:
                print("in draw", flush=True)
                turn_tracker[self.room_group_name] = 'X'
                is_game_over = True
                for i in range(len(board)):
                    board[i] = ''
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'send_message',
                        'message': 'It\'s a draw!',
                        'event': 'DRAW'
                    }
                )
            if turn_tracker[self.room_group_name] == 'X' and is_game_over == False:
                turn_tracker[self.room_group_name] = 'O'
            elif turn_tracker[self.room_group_name] == 'O' and is_game_over == False:
                turn_tracker[self.room_group_name] = 'X'
        if event == "DUSER":
            if connected_players[self.room_group_name]["user1"] == connected_players[self.room_group_name]["user2"]:
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': 'Suser',
                    'event': 'USERS'
                }
            )
            else:
                user1 = connected_players[self.room_group_name]["user1"]
                user2 = connected_players[self.room_group_name]["user2"]
                user1Name = connected_players[self.room_group_name]["user1Name"]
                user2Name = connected_players[self.room_group_name]["user2Name"]
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'send_message',
                        'message': {'user1': user1, 'user2': user2, 'userName1': user1Name, 'userName2': user2Name},
                        'event': 'USERS'
                    }
                )
        


    async def send_message(self, message):
        print('Sending message:', message)  
        await self.send(text_data=json.dumps({
            'event': message['event'],  
            'message': message['message']  
        }))
    def check_winner(self, board):
        win_combinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],  
            [0, 3, 6], [1, 4, 7], [2, 5, 8],  
            [0, 4, 8], [2, 4, 6]
        ]
        for combo in win_combinations:
            if board[combo[0]] == board[combo[1]] == board[combo[2]] and board[combo[0]] != '':
                return True
        return False