from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from django.contrib import messages
import requests
# ------------------------
from django.middleware.csrf             import get_token
from  django.shortcuts                  import  get_object_or_404
from rest_framework.decorators          import api_view, permission_classes
from rest_framework.permissions         import AllowAny
from  rest_framework.authtoken.models   import Token
from  rest_framework                    import status
from .serializers                       import CustmerSerializer
from .forms                             import CustomerForm
from .models                            import User_info
from django.contrib.auth.forms          import UserCreationForm, AuthenticationForm
from django.utils.decorators            import method_decorator
from rest_framework.response            import Response
from rest_framework                     import status

client_id       = "u-s4t2ud-fa7692872a0200db78dfe687567cc55dd2a444234c7720f33c53e0a4286a7301"
client_secret   = "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"
redirect_url    = "http://127.0.0.1:8000/oauth/callback/"
authorization_url = "https://api.intra.42.fr/oauth/authorize"
token_url = "https://api.intra.42.fr/oauth/token"
grant_type = "authorization_code"


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def     register_vu(request):
    print("\033[1;32m you're in the register function \n")
    if request.method == 'POST':
        # form = CustmerSerializer(data=request.data) #request.data = post data from client
        form = CustomerForm(data=request.data) #request.data = post data from client
        print(f"Form Data: {request.data}")
        if form.is_valid():
            print("\033[1;38m This user is valid \n")
            user = form.save()
            user_token, created = Token.objects.get_or_create(user=user)
            print(f"\033[1;38m This is the user token: {user_token}")
            return JsonResponse({'status': 'success'}, status=200)
        else:
            errors = form.errors.as_json()
            print("\033[1;39m This user failed to sign up \n")
            print(f"Errors: {errors}")  # Add this line
            return JsonResponse({'status': 'faild', 'error': form.errors}, status=400)
    return JsonResponse({'status': False, "error": form.errors}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def login_vu(request):
    print("\033[1;35m This login_vu  \n")
    print(f"Form Data: {request.data}")

    username = request.data.get('username')
    password = request.data.get('password')

    # Authenticate user
    user = authenticate(username=username, password=password)
    if user is None:
        print("\033[1;46m this User Is Not Found \n")
        return Response({"status": False, "message": "Invalid credentials"}, status=status.HTTP_404_NOT_FOUND)
    print("\033[1;46m this User Is Found \n")
    print("data == ", user)
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    # Serialize user data
    serialize_user = CustmerSerializer(instance=user)
    return Response({"token": token.key, "user": serialize_user.data, "status":"success"})

def     oauth_authorize(request):
    print("\033[1;32m please do something  \n")
    full_authoriztion_url = authorization_url + \
        f'?client_id={client_id}&redirect_uri={redirect_url}&response_type=code'
    return redirect(full_authoriztion_url)

# decorator ensures that the response will include a CSRF cookie if it wasn't already set.
# in the firat time will create a cookie csrf
# @csrf_exempt
@ensure_csrf_cookie
def get_csrf_token(request):
    token = get_token(request)
    print ("tokeeen -------> ", token)
    return JsonResponse({'csrfToken': token})

def     callback(request):
    print("\033[1;36m callback \n")
    code  = request.GET.get('code')
    print("\033[1;37m code  =  ", code, "\n")
    if code :
        necessary_info = {
            'grant_type'     : grant_type,
            'client_id'      : client_id,
            'client_secret'  :   client_secret,
            'code'           : code,
            'redirect_uri'   : redirect_url
        }
        response = requests.post(token_url, data=necessary_info)
        print("\033[1;38m status_code  =  ", response.status_code, "\n")
    if response.status_code == 200:
        data = response.json()
        access_token = data['access_token']
        print("\033[1;38m access_token  =  ", access_token, "\n")
        if access_token :
            user_data = get_user_info(acess_token=access_token)
            print("\033[1;36m  Hello \n")
            print ("username = ",  user_data.get('login', 'Guest'))
            print ("full_name = ", user_data.get('displayname', ''))
            print("\033[1;36m  By \n")
            if user_data:
                user_name    = user_data.get('login', 'Guest')
                full_name    = user_data.get('displayname', '')
                image_url    = user_data.get('image', {}).get('link')  # Adjust based on actual API response    
                # Save user information to the database
                user, created = User_info.objects.get_or_create(user_name=user_name)
                user.user_name = user_name
                user.full_name = full_name
                user.image_url = image_url
                user.access_token = access_token
                print ('image_url == ' , image_url)
                user.save()
                params = urllib.parse.urlencode({
                        'user_name': user_name,
                        'full_name': full_name,
                        'image_url': image_url})
                json_response = JsonResponse(user_data)
                response = redirect(f'http://localhost/welcome.html?{params}')
                response.set_cookie('user_info', json_response.content)
                return JsonResponse({'full_name': full_name,
                     'user_name': user_name, 'image_url': image_url})
        else :
            print("\033[1;38m Empty Access Token\n")
    print ("username = ",  user_name)
    print ("full_name = ", full_name)
    return JsonResponse({'user_name': user_name, 'image_url': image_url})  

def     get_user_info(acess_token):
   user_endpoint = 'https://api.intra.42.fr/v2/me'
   headers= {
      'Authorization' : f'Bearer {acess_token}'
   }
   response = requests.get(user_endpoint, headers=headers)
   if response.status_code == 200:
        user_data = response.json()
        return user_data
   else :
        return None

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
