import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from .models import Proom
import asyncio, math
from datetime import datetime
from channels.layers import get_channel_layer
import requests
import time

connected_players = {}
matches = {}
width = 600
height = 300
hh = 80
ww = 5
paddle_speed = 1
score_to_win = 5

class ball:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.r = 10
        self.angl = 35
        self.speed = 1.50
        self.vx = math.cos(self.angl * math.pi / 180) * self.speed
        self.vy = math.sin(self.angl * math.pi / 180) * self.speed
    def serialize_ball(self):
        return{
            'x':self.x,
            'y':self.y
        }


class paddle:
    def __init__(self, x, y, min, max):
        self.x = x
        self.y = y
        self.min = min
        self.max = max
        self.h = hh
        self.w = ww
        self.vy = 0
        self.score = 0

    def change_direction(self, data):
        if (data == 'Up'):
            self.vy = -paddle_speed
        elif (data == 'Down'):
            self.vy = paddle_speed
        elif (data == 'Stop'):
            self.vy = 0

    def move(self):
        if self.vy < 0:
            if self.y + self.vy > self.min:
                self.y += self.vy
            else:
                self.y = self.min
        else:
            if self.y + self.vy < self.max - self.h:
                self.y += self.vy
            else:
                self.y = self.max - self.h

    def serialize_paddle(self):
        return {
            'x': self.x,
            'y': self.y,
            'score':self.score,
        }

class   Match:
    def __init__(self):
        self.starting = False
        self.b = ball(width / 2, height / 2)
        self.p1 = paddle(0, (height - hh) / 2, 0, height)
        self.p2 = paddle(width - ww, (height - hh) / 2, 0, height)

    def move(self):
        if (self.b.x + self.b.r < ww):
            self.p2.score += 1
            self.b.x = width / 2  # Reset ball to center of board
            self.b.y = height / 2
            self.b.vx = abs(self.b.vx)  # Launch ball to the right (toward player 2)
            self.b.vy = -self.b.vy  # Reverse vertical direction for variety
        if self.b.x - self.b.r > width - ww:  # Ball goes past right boundary, first player scores
            self.p1.score += 1
            self.b.x = width / 2  # Reset ball to center of board
            self.b.y = height / 2
            self.b.vx = -abs(self.b.vx)  # Launch ball to the left (toward player 1)
            self.b.vy = -self.b.vy  # Reverse vertical direction for variety
        if (self.b.vx > 0):  # Check if the ball is moving to the right
            if ((self.b.x + self.b.r) + self.b.vx < (width - ww)):  # Check if the ball's next position will be within the right boundary
                self.b.x += self.b.vx  # Move the ball to the right
            else:
                # Check if the ball is outside the paddle's vertical range
                if ((self.b.y) < self.p2.y or self.b.y > self.p2.y + hh):
                    self.b.x += self.b.vx  # Allow the ball to move to the right if it's not in the vertical range of the paddle
                else:
                    # Ball is hitting the right boundary or a paddle
                    self.b.x += (width - ww) - (self.b.x + self.b.r)  # Position the ball just inside the boundary
                    self.b.vx = -self.b.vx  # Reverse the ball's horizontal direction
        else:  # The ball is moving to the left
            # Check if the ball is outside the vertical range of the left paddle or has moved past it
            if (self.b.y < self.p1.y or self.b.y > self.p1.y + hh or (self.b.x - self.b.r) + self.b.vx > ww):
                self.b.x += self.b.vx  # Move the ball to the left
            else:
                # Ball is hitting the left boundary or a paddle
                self.b.x = ww + self.b.r  # Position the ball just inside the left boundary
                self.b.vx = -self.b.vx
        if (self.b.vy > 0):
            if (self.b.y + self.b.r + self.b.vy < (height - 0)):
                self.b.y += self.b.vy
            else:
                self.b.y = (height - 0) - self.b.r
                self.b.vy = -self.b.vy
        else:
            if ((self.b.y - self.b.r) + self.b.vy > 0):
                self.b.y += self.b.vy
            else:
                self.b.y = self.b.r + 0
                self.b.vy = -self.b.vy

class PingPongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'pingpong_{self.room_code}'
        self.gameType = "remote"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        if self.room_group_name not in connected_players:
            connected_players[self.room_group_name] = {
                "user1": None,
                "user2": None,
                "user1Name":None,
                "user2Name":None,
                "pad_num":None,
                "type":None,
                "movep1":'Stop',
                "movep2":'Stop',
                "channels": []
            }
        if len(connected_players[self.room_group_name]['channels']) >= 2:
            await self.close()
            return
        if self.room_group_name not in matches:
            matches[self.room_group_name] = Match() 
        connected_players[self.room_group_name]['pad_num'] = len(connected_players[self.room_group_name]['channels'])
        connected_players[self.room_group_name]["channels"].append(self.channel_name)
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'ASSIGN_PAD_NUM',
            'pad_num': connected_players[self.room_group_name]['pad_num']
        }))
        if len(connected_players[self.room_group_name]['channels']) == 2:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': 'game start',
                    'event': 'START',
                }
        )
        else:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': 'Waiting for the second player...',
                    'event': 'wait'
                }   
        )
    async def disconnect(self, close_code):
        player_left = None
        if self.room_group_name in connected_players:
            if self.channel_name in connected_players[self.room_group_name]["channels"]:
                player_left = connected_players[self.room_group_name]['pad_num']
                connected_players[self.room_group_name]["channels"].remove(self.channel_name)
        print("the len is ", len(connected_players[self.room_group_name]["channels"]), player_left)
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
        if self.room_group_name in connected_players and not connected_players[self.room_group_name]["channels"]:
            del matches[self.room_group_name]
        if len(connected_players[self.room_group_name]["channels"]) == 0:
            await self.delete_room() 
            del connected_players[self.room_group_name]
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
    async def delete_room(self):
        await sync_to_async(Proom.objects.filter(code=self.room_code).delete)()


        
    async def receive(self, text_data):
        data = json.loads(text_data)
        if data.get('type') == 'START' and self.gameType != "local":
            if not connected_players[self.room_group_name]["user1"]:
                connected_players[self.room_group_name]["user1"] = data.get("message")["id"]
                connected_players[self.room_group_name]["user1Name"] = data.get("message")["name"]
            else:
                connected_players[self.room_group_name]["user2"] = data.get("message")["id"]
                connected_players[self.room_group_name]["user2Name"] = data.get("message")["name"]
        if data.get('type') == 'move':
            move = data.get('move')
            padd = data.get('pad_num')
            match = matches.get(self.room_group_name)
            if not match:
                return 
            if (padd == 1):
                connected_players[self.room_group_name]["movep1"] = move
                match.p1.change_direction(move)
                match.p1.move()
            else:
                connected_players[self.room_group_name]["movep2"] = move
                match.p2.change_direction(move)
                match.p2.move()

        if (data.get('type') == 'local'):
            self.gameType = "local"
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': 'game start',
                    'event': 'START',
                }
        )
            return
        if data.get('type') == 'start':
            match = matches.get(self.room_group_name)
            if not match:
                return 
            asyncio.create_task(self.start_game_loop())

        if (data.get('type') == 'close'):
            self.disconnect(1000)

        if data.get('type') == "DUSER":
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

    async def send_message(self, event):
        await self.send(text_data=json.dumps({
            'type': event['type'],
            'message': event['message'],
            'event': event['event']
        }))
    async def start_game_loop(self):
        match = matches.get(self.room_group_name)
        if not match:
            return 
        while True:
            if match.p1.score == 3:
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': '1',
                    'event': 'END'                    
                }
            )
                break
            elif  match.p2.score == 3:
                await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_message',
                    'message': '0',
                    'event': 'END'                    
                }
            )
                break
            match.move()
            movep1 = connected_players[self.room_group_name]["movep1"]
            movep2 = connected_players[self.room_group_name]["movep2"]
            match.p1.change_direction(movep1)
            match.p2.change_direction(movep2)
            match.p1.move()
            match.p2.move()
            ball_data = match.b.serialize_ball()
            paddle_data1 = match.p1.serialize_paddle()
            paddle_data2 = match.p2.serialize_paddle()
            if self.gameType == "local":
                await self.send(text_data=json.dumps({
                    'type': 'GAME_STATE',
                    'ball': ball_data,
                    'paddle1': paddle_data1,
                    'paddle2': paddle_data2
                }))
                await asyncio.sleep(0.003)
            else:    
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'game_state',
                        'ball': ball_data,
                        'paddle1': paddle_data1,
                        'paddle2': paddle_data2
                    }
                )
                await asyncio.sleep(0.005)


    async def game_state(self, event):
        """Send ball position to all connected clients"""
        ball_data = event['ball']
        paddle_data1 = event['paddle1']
        paddle_data2 = event['paddle2']
        await self.send(text_data=json.dumps({
        'type': 'GAME_STATE',
        'ball': {
            'x': ball_data['x'],
            'y': ball_data['y']
        },
        'paddle1': {
            'x': paddle_data1['x'],
            'y': paddle_data1['y'],
            'score': paddle_data1['score']
        },
        'paddle2': {
            'x': paddle_data2['x'],
            'y': paddle_data2['y'],
            'score': paddle_data2['score']
        }
        })) 
