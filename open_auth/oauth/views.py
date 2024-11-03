from django.http                        import JsonResponse
from django.contrib.auth                import authenticate, login, logout
from django.middleware.csrf             import get_token
import                                  requests
from rest_framework.decorators          import api_view
from rest_framework                     import status
from .serializers                       import CustmerSerializer, RegisterSerializer
from .forms                             import CustomerForm
from .models                            import User_info
# from django.contrib.auth.forms          import UserCreationForm, AuthenticationForm
from rest_framework.response            import Response
from django.core.files.base             import ContentFile
from django.conf                        import settings
from django.core.files                  import File
import                                  os , json
from channels.layers                    import get_channel_layer
from asgiref.sync                       import async_to_sync

client_id       = os.getenv("CLIENT_ID")
client_secret   = os.getenv("CLIENT_SECRET")
redirect_url    = os.getenv("REDIRECT_URL")
authorization_url = os.getenv("AUTHORIZATION_URL")
token_url       = os.getenv("TOKEN_URL")
grant_type      = os.getenv("GRANT_TYPE")

@api_view(['POST'])

def     register_vu(request):
    print("\033[1;32m you're in the register function \n")
    if request.method == 'POST':
        form = CustomerForm(data=request.data) #request.data = post data from client
        if form.is_valid():
            # save it create new row in db it responsible to communicate with db it's from model class.
            user = form.save()
            # join tow paths to get full path
            default_avatar_path = os.path.join(settings.MEDIA_ROOT, 'profile_image/a2.jpg')
            # with it close the file after execting and as copy the content to variable avatar_file
            with open(default_avatar_path, 'rb') as avatar_file:
                user.imageProfile.save('default_avatar.jpg', File(avatar_file))
            seria = RegisterSerializer(instance=user)
            return JsonResponse({'status': 'success', 'data':seria.data}, status=200)
        else:
            errors = form.errors.as_json()
            print(f"\033[1;38m This is the user data ", errors)
            return JsonResponse({'status': 'faild', 'error': form.errors}, status=400)
    return JsonResponse({'status': False, "error": form.errors}, status=400)

@api_view(['POST'])
def login_vu(request):
    print("\033[1;35m This login_vu  \n")
    # Authenticate user
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({'status': 'failed', 'data': 'User is not authenticated'}, status=401)
    login(request, user)
    # Serialize user data
    serialize_user = CustmerSerializer(instance=user)
    return Response({"status":"success", "data": serialize_user.data})

@api_view(['POST'])
def     logout_vu(request):
    user = request.user
    user.online_status = False
    user.save()
    frends = user.friends.all()  
    channel_layer = get_channel_layer()
    for friend_of_user in frends:
        # Send a message to the friend's WebSocket channel
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
        return (JsonResponse({'status':'success'}))
    else :
        return (JsonResponse({'status':'faild'}))

def     oauth_authorize(request): 
    print("\033[1;32m oauth_authorize \n")
    full_authoriztion_url = authorization_url + \
        f'?client_id={client_id}&redirect_uri={redirect_url}&response_type=code'
    return JsonResponse({'status' : 'success','full_authoriztion_url' : full_authoriztion_url})

def get_csrf_token(request):
    token = get_token(request)
    return JsonResponse({'csrfToken': token})

def callback(request):
    print ('============================ callback is called ============================\n')    
    data = json.loads(request.body)
    code = data.get('code')

    if not code:
        return JsonResponse({'status': 'error', 'message': 'No code provided'}, status=400)

    # Exchange the code for an access token
    necessary_info = {
        'grant_type': grant_type,
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_url
    }

    try:
        response = requests.post(token_url, data=necessary_info)
        response.raise_for_status()
    except requests.RequestException as e:
        return JsonResponse ({'status':'fail' , 'data' : 'failed to get access_token'})

    if response.status_code == 200:
        data = response.json()
        access_token = data.get('access_token')
        if access_token:
            user_data   = get_user_info_api(access_token)
            username    = user_data.get('login', 'Guest')
            fullname    = user_data.get('displayname', '')
            firstname   = user_data.get('first_name', '')
            lastname    = user_data.get('last_name', '')
            email       = user_data.get('email', '')
            image_url   = user_data.get('image', {}).get('link', '')

            user, created       = User_info.objects.get_or_create(username=username)
            user.fullname       = fullname
            user.username       = username
            user.firstname      = firstname
            user.lastname       = lastname
            user.email          = email
            user.access_token   = access_token

            if image_url:
                image_name = f'{username}.jpg'
                if not user.imageProfile or not os.path.exists(user.imageProfile.path):
                    # Image doesn't exist locally, download and save it
                    try :
                        download_image_save(image_name=image_name, image_url=image_url, user=user)
                    except requests.RequestException as e:
                        return JsonResponse({'status' : 'fail', 'error' : 'faild to download image'})
            user.save()
            login(request, user)
            seria = CustmerSerializer(instance=user)
            return JsonResponse({'status': 'success','data': seria.data})
        else:
            return JsonResponse({'status': 'error', 'message': 'Empty access token'}, status=400)
    else:
        return JsonResponse({'status': 'error', 'message': 'Failed to exchange token'}, status=response.status_code)

def     download_image_save(image_name, image_url, user):

    # Image doesn't exist locally, download and save it
    imageResponse = requests.get(image_url)
    imageResponse.raise_for_status()  # Raises an HTTPError for bad responses
    user.imageProfile.save(image_name, ContentFile(imageResponse.content), save=True)

def     get_user_info_api(access_token):
    user_endpoint = 'https://api.intra.42.fr/v2/me'
    headers= {
      'Authorization' : f'Bearer {access_token}'
    }
    try:
        response = requests.get(user_endpoint, headers=headers)
        response.raise_for_status()
        user_data = response.json()
        return user_data
    except requests.RequestException as e:
        return JsonResponse({'status' : 'failed', 'data' : 'failed to get user info from intra 42'})
