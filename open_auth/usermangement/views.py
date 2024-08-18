from    django.shortcuts import render
from    django.http import JsonResponse
from    django.middleware.csrf import get_token
from    usermangement.serializer              import ProfileSerializer
from rest_framework.decorators          import api_view, permission_classes
from rest_framework.permissions         import AllowAny
import  requests
from django.contrib.sessions.models import Session

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

# def     update_user(request):
#     pass