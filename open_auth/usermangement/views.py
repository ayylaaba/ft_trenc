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
from oauth.models     import User_info
from .models             import RequestFriend
from .serializer         import RequestFriendSerializer
# Create your views here.

@api_view(['GET'])
@permission_classes([AllowAny])
def profile(request):
    print("\033[1;38m ----------> inside Profile Function \n")
    print("Session data:", request.COOKIES)
    print("Session ID:", request.COOKIES.get('sessionid'))
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

@csrf_exempt
@api_view(['POST'])
def update_user(request):
    print("Entered update_user view")

    if request.method != 'POST':
        return JsonResponse({'status': 'failed', 'data': 'Invalid request method'}, status=400)

    user = request.user
    print(f"User: {user}, Authenticated: {user.is_authenticated}")

    if not user.is_authenticated:
        return JsonResponse({'status': 'failed', 'data': 'User is not authenticated'}, status=401)

    # Use request.data instead of request.body
    data = request.data

    if not data:
        return JsonResponse({'status': 'failed', 'data': 'Request body is empty'}, status=400)

    # check if data is a json form by method isinstance "dict" mean data is a dic or not
    if  not isinstance(data, dict):
        return JsonResponse({'status': 'failed', 'data': 'Expected a JSON object'}, status=400)

    update_serializer = UpdateUserSerializers(user, data=data, partial=True)

    if update_serializer.is_valid():
        update_serializer.save()
        return JsonResponse({'status': 'success', 'data': update_serializer.data})
    else:
        return JsonResponse({'status': 'failed', 'data': update_serializer.errors}, status=400)

@api_view(['GET'])
def     users_list(request):
    print ('Users List \n')
    current_user = request.user
    users = User_info.objects.exclude(id = current_user.id)
    print("\033[1;35m ---> current_user : ", current_user)
    serialize_users = ProfileSerializer(users, many=True)
    print("\033[1;35m ---> current_user : ", serialize_users.data)
    return JsonResponse({'status': 'success', 'data': serialize_users.data})

@api_view(['POST'])
def     send_friend_request(request, receiver_id): 
    print("\033[1;35m send friend request handle it  \n")
    from_user = request.user
    print("\033[1;35m -------------------------------------------> ", receiver_id)
    to_user   = User_info.objects.get(id=receiver_id)

    if RequestFriend.objects.filter(from_user = from_user, to_user = to_user).exists():
        return JsonResponse({'status' : 'failed', 'error':'the request Already exist'})
    friend_req    = RequestFriend.objects.create(from_user = from_user, to_user = to_user)
    print("\033[1;35m -------------------------------------------  \n")
    serialize_req = RequestFriendSerializer(friend_req) 
    return JsonResponse({'status' : 'success', 'data' : serialize_req.data})

@api_view(['POST'])
def     accepte_request(request, receiver_id):
    print("\033[1;35m Hi I Enter To accept_request view  \n")
    all_requests = RequestFriend.objects.all()
    print("All Friend Requests:")
    for request in all_requests:
        print(f"ID: {request.id}, From: {request.from_user.username}, To: {request.to_user.username}, Accepted: {request.accepted}")
    try:
        # if request.method == 'POST':
        friend_request = RequestFriend.objects.get(id=receiver_id)
        print ('************************************************************************ff')
        if friend_request.accepted:
            return JsonResponse ({'staus':'success', 'data' : 'this request already accepted'})
        friend_request.accepted = "True"
        friend_request.save()
        friend_request.from_user.friends.add(friend_request.from_user)
        friend_request.from_user.friends.add(friend_request.to_user)
        return JsonResponse ({'status':'success', 'data' : 'the request accepted'})
    except friend_request.DoesNotExist:
        return JsonResponse({'status': 'failed', 'data': f'Friend request with ID {receiver_id} does not exist'}, status=404)


@api_view(['POST'])
def reject_request(request, receiver_id):
    print("\033[1;35m Hi I Enter To accept_request view  \n")
    print("\033[1;35m receiver_id : ", receiver_id)
    all_requests = RequestFriend.objects.all()
    print("All Friend Requests:")
    try:
        # Fetch the friend request by ID
        friend_request = RequestFriend.objects.get(id=receiver_id)
        # Check if the request is already accepted
        if friend_request.accepted:
            return JsonResponse({'status': 'failed', 'data': 'This request is already accepted and cannot be rejected'})
        # Delete the friend request
        friend_request.delete()
        return JsonResponse({'status': 'success', 'data': 'The request has been rejected'})
    except RequestFriend.DoesNotExist:
        return JsonResponse({'status': 'failed', 'data': f'Friend request with ID {receiver_id} does not exist'}, status=404)
    