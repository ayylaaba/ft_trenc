from django.shortcuts import render
from django.utils.safestring import mark_safe
import json
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.http import JsonResponse
from .models import Room, Block


        
@api_view(['POST'])
def get_create_room(request):
    
    user1 = request.data.get('user1') # dex  test
    user2 = request.data.get('user2') # test dex

    room_name = f"{min(user1, user2)}_{max(user1, user2)}" # dex_test dex_test
    if Room.objects.filter(room_name=room_name).exists():
        room = Room.objects.get(room_name=room_name)
        return JsonResponse({'room_name': room.room_name, 'room_id': room.id})
    else:
        createRoom = Room.objects.create(user_1=user1, user_2=user2, room_name=room_name)
        return JsonResponse({
            'room_name': createRoom.room_name,
            'room_id': createRoom.id
        })
    return JsonResponse({"error": 'username not found'}, status=400)


@api_view(['POST'])
def block_user(request):
    blocker = request.data.get('blocker')
    blocked = request.data.get('blocked')
    room_id = request.data.get('room_id')

    if not blocked or not blocked or not room_id:
        return JsonResponse({'error': "Blocked user ID is missing"}, status=400)

    try:
        blockedUser = Room.objects.get(id=room_id)
    except Room.DoesNotExist:
        return JsonResponse({'error': "room doesn't exist"}, status=404)
    alreadyBlocked = Block.objects.filter(room=blockedUser).exists()
    if alreadyBlocked:
        return JsonResponse({'error': f"{blocker} already blocked you"}, status=400)
    blocked_by = Block.objects.create(blocker=blocker, blocked=blocked, room=blockedUser)

    return JsonResponse ({
        'blocked': blocked_by.blocked,
        'blocker': blocked_by.blocker
    }, status=201)


@api_view(['POST'])
def is_user_blocked(request):

    room_id = request.data.get('room_id')
    blocker = request.data.get('blocker')
    blocked = request.data.get('blocked')

    if not room_id or not blocker or not blocked:
        return JsonResponse({'error': 'room does not exist'}, status=400)
    try:
        ThisRoom = Room.objects.get(id=room_id)
        block = Block.objects.get(room=ThisRoom)
        print('----------------> ', block.blocker, flush=True)
        return JsonResponse({'etat': True, 'block_id': block.id, 'blocker': block.blocker, 'blocked': block.blocked}, status=200)
    except Block.DoesNotExist:
        return JsonResponse({'etat': False}, status=200)


@api_view(['POST'])
def unblock_user(request):
    room_id = request.data.get('room_id')

    if not room_id:
        return JsonResponse({'error': 'Room ID is required'}, status=400)

    try:
        this_room = Room.objects.get(id=room_id)
        block = Block.objects.get(room=this_room)
        block.delete()

        return JsonResponse({'etat': True, 'message': 'User unblocked successfully'}, status=200)
    except Room.DoesNotExist:
        return JsonResponse({'error': 'Room does not exist'}, status=404)
    except Block.DoesNotExist:
        return JsonResponse({'error': 'No block exists for this room'}, status=404)
