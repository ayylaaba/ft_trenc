from django.http                        import JsonResponse
from django.contrib.auth                import authenticate, login, logout
from django.views.decorators.csrf       import csrf_exempt, ensure_csrf_cookie, csrf_protect
from django.middleware.csrf             import get_token
from rest_framework.decorators          import api_view, permission_classes
from rest_framework.permissions         import AllowAny
from  rest_framework.authtoken.models   import Token
from  rest_framework                    import status
from .serializers                       import CustmerSerializer, RegisterSerializer
from .models                            import User_info
from rest_framework.response            import Response
from django.core.files.base             import ContentFile
from django.conf                        import settings
from django.core.files                  import File
from channels.layers                    import get_channel_layer
from asgiref.sync                       import async_to_sync
from usermangement .serializer          import ProfileSerializer
import os
import requests


client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")
redirect_url = os.getenv("REDIRECT_URL")
authorization_url = os.getenv("AUTHORIZATION_URL")
token_url = os.getenv("TOKEN_URL")
grant_type = os.getenv("GRANT_TYPE")

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def     register_vu(request):
    if request.method == 'POST':
        username = request.data.get('username')
        if User_info.objects.filter(username=username, intra_user=True).exists():
            return JsonResponse({'status' : 'failed', 'error' : 'username already exist'}, status=400)
        form = RegisterSerializer(data = request.data) 
        if form.is_valid():
            user = form.save()
            if not user.imageProfile:  # Assuming 'imageProfile' is the field name for profile images
                default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'profile_image/a2.png')
                with open(default_avatar_path, 'rb') as avatar_file:
                    user.imageProfile.save('default_avatar.jpg', File(avatar_file))
            password = request.data.get('password1')
            user = authenticate(username = user.username, password = password)
            if user:
                login(request, user)
            else :
                return JsonResponse({'status': 'faild', 'error':"faild to login"}, status=400)
            return JsonResponse({'status': 'success', 'data':form.data}, status=200)
        else:
            errors = form.errors
            return JsonResponse({'status': 'faild', 'error': form.errors}, status=400)
    return JsonResponse({'status': 'faild', "error": form.errors}, status=400)

@csrf_exempt
@api_view(['POST'])
def     logout_vu(request):
    user = request.user
    
    user.online_status = False
    user.save()
    
    frends = user.friends.all()  
    channel_layer = get_channel_layer()
    for friend_of_user in frends:
        async_to_sync(channel_layer.group_send)(
            f'user_{friend_of_user.id}',
            {
                'type': 'notify_user_status',
                'data':
                {
                    'id': user.id,
                    'username':user.username,
                    'online_status': False
                }
            }
        )
    if request.method == 'POST':
        logout(request)
        request.session.flush()  # Clear all session data
        return (JsonResponse({'status':'success'}))
    return (JsonResponse({'status':'faild'}))

from rest_framework.decorators import permission_classes
from rest_framework.permissions import AllowAny

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_vu(request):
    
    print ("it enter hereeeeeeeeeeeeeeeeeeeeeee", flush=True)

    username = request.data.get('username')
    password = request.data.get('password')

    # Fetch the user explicitly from the database
    try:
        user = User_info.objects.get(username=username)
        print ("user :", user)
        print ("password :", user.password)
    except User_info.DoesNotExist:
        return JsonResponse({"status": "failed", "error": "Invalid credentials"}, status=400)

    if not user.check_password(password):
        return JsonResponse({"status": "failed", "error": "Invalid credentials"},  status=400)

    login(request, user)

    # Serialize user data and return JsonResponse
    serialize_user = CustmerSerializer(instance=user)
    return JsonResponse({"data": serialize_user.data, "status": "success"})


from django.contrib.sessions.models import Session

def     oauth_authorize(request): 

    full_authoriztion_url = authorization_url + \
        f'?client_id={client_id}&redirect_uri={redirect_url}&response_type=code'
    return JsonResponse({'status' : 'success','full_authoriztion_url' : full_authoriztion_url})

@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    print ("tokeeen -------> ", token)
    return JsonResponse({'csrfToken': token})

import json, os

def callback(request):
    print ('============================ callback is called ============================\n')    
    data = json.loads(request.body)
    code = data.get('code')

    if not code:
        return JsonResponse({'status': 'error', 'message': 'No code provided'}, status=400)
    necessary_info = {
        'grant_type': grant_type,
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_url
    }
    response = requests.post(token_url, data=necessary_info)

    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access_token')
        if access_token:
            user_data   = get_user_info_api(access_token)
            username    = user_data.get('login', 'Guest')
            fullname    = user_data.get('displayname', '')
            firstname = user_data.get('first_name', '')
            lastname = user_data.get('last_name', '')
            email = user_data.get('email', '')
            image_url   = user_data.get('image', {}).get('link', '')

            if User_info.objects.filter(username=username, intra_user=False).exists():
                return JsonResponse({'status' : 'failed', 'error' : 'username already exist'}, status=400)
            
            # Save or update user info
            user, created       = User_info.objects.get_or_create(username=username)
            user.fullname       = fullname
            user.username       = username
            user.firstname      = firstname
            user.lastname       = lastname
            user.email          = email
            user.access_token   = access_token
            user.intra_user     = True

            if image_url:
                image_name = f'{username}.jpg'
                if not user.imageProfile or not os.path.exists(user.imageProfile.path):
                    # Image doesn't exist locally, download and save it
                    imageResponse = requests.get(image_url)
                    user.imageProfile.save(image_name, ContentFile(imageResponse.content), save=True)                    
            user.save()
            login(request, user)
            # Return user data as JSON
            seria = CustmerSerializer(instance=user)
            return JsonResponse({'status': 'success','data': seria.data})
        else:
            return JsonResponse({'status': 'error', 'message': 'Empty access token'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Failed to exchange token'}, status=response.status_code)

def     get_user_info_api(access_token):
   user_endpoint = 'https://api.intra.42.fr/v2/me'
   headers= {
      'Authorization' : f'Bearer {access_token}'
   }
   response = requests.get(user_endpoint, headers=headers)
   if response.status_code == 200:
        user_data = response.json()
        return user_data
   else :
        return None

@api_view(["GET"])
def users_rank(request):
    print ("\n Rank Of The Users ------------------------------------------------\n")
    user = request.user
    print ("is authenticated : ")
    print (user.is_authenticated)
    if user.is_authenticated:
        # Order users by `scoor` in descending order

        users = User_info.objects.all().exclude(is_superuser=True).order_by('-score')

        # Serialize the ordered users
        users_serialized = ProfileSerializer(users, many=True)
        print ("users : ", users_serialized.data)

        return JsonResponse({'status': 'success', 'data': users_serialized.data})
    else:
        return JsonResponse({'status': 'error', 'message': 'User is not authenticated'}, status=400)

"""
If the user is redirected to your callback URL with the following URL:

http://127.0.0.1:8000/oauth/callback/?code=1234
1- request.GET would be {'code': '1234'}.
2- request.GET.get('code') would return '1234'.
3- code would be assigned the value '1234'

If the URL does not contain a code parameter:
http://127.0.0.1:8000/oauth/callback/

1- request.GET would be {} (an empty dictionary).
2- request.GET.get('code') would return None.
3- code would be assigned the value None.
""" 

# Create your views here.
# ????????????????? important reademe please .
# ask django to give you all the method that can i use as back-end ?
# ask can i need datapase in this app (oauth) why you don't use it here.
# you must to create a tldr file that you show how to make this .
# then must add some design myb9ach nachf 
# then start user management.
