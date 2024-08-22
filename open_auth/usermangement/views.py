from    django.shortcuts import render
from    django.http import JsonResponse
from    django.middleware.csrf import get_token
from    usermangement.serializer              import ProfileSerializer, UpdateUserSerializers
from rest_framework.decorators          import api_view, permission_classes
from rest_framework.permissions         import AllowAny
import  requests
from rest_framework.permissions import IsAuthenticated  # Use IsAuthenticated
from django.contrib.sessions.models import Session
from django.views.decorators.csrf import csrf_exempt
# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def profile(request):
    if request.method == 'GET':
        print ('condtion get method true')
        print ('request : ', request)
        print ('request user : ', request.user)
        user = request.user  # Retrieve the logged-in user from the request
        print(f"User authenticated: {user.is_authenticated}")
        if user.is_authenticated:
            seria = ProfileSerializer(instance=user)
            print('seria ---> : ', seria.data)
            return JsonResponse({
                'data': seria.data,  # Ensure you call `.data` to get the serialized data
                'status': 'success'
            }, status=200)
        else:
            return JsonResponse({
                'data': None,  # Return None or an empty dict in case of failure
                'status': 'failed'
            }, status=400)
    else:
        return JsonResponse({
            'data': None,  # Return None or an empty dict in case of failure
            'status': 'failed'
        }, status=400)

import json

@csrf_exempt
def     update_user(request):
    print ('i\'m here update View ')
    if request.method == 'PUT':
        user = request.user  # Retrieve the logged-in user from the request
        print(' ------------------- > ', f"User: {user}, Is Authenticated: {user.is_authenticated}")
        print(' ------------------- > ', f"req : {user}, data: {request.body}")
        if user.is_authenticated:
            print ('is authenticated ! ')
            if not request.body:
                return JsonResponse({'status': 'failed', 'data': 'Request body is empty'})
            try:
                data = json.loads(request.body.decode('utf-8'))
            except json.JSONDecodeError:
                return JsonResponse({'status': 'failed', 'data': 'Invalid JSON'}) 
            if not isinstance(data, dict): #check if data is a json
                return JsonResponse({'status': 'failed', 'data': 'Expected a JSON object.'}, status=400)
            updateuser = UpdateUserSerializers(user, data=data, partial=True)
            if updateuser.is_valid():
                updateuser.save()
                return JsonResponse({'status': 'success', 'data': updateuser.data})
            else :
                return JsonResponse({'status': 'failed', 'data': 'user is not valid'})
        else :
            return JsonResponse({'status': 'failed', 'data': 'user is not authenticated'})
    return JsonResponse({'status': 'success', 'data': 'bad request'})
    