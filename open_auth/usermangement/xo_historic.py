from oauth.models               import User_info
from .models                    import MatchHistoric
from .serializer                 import  MatchHistoricSerialzer
from    django.http             import JsonResponse
from rest_framework.decorators  import api_view

@api_view(['POST'])
def         store_match(request):
    user            = request.user
    match_serialize =  MatchHistoricSerialzer(data=request.data)
    if match_serialize.is_valid():
        match_serialize.save()
        return JsonResponse({'data':match_serialize.data, 'status' : '200'})
    return JsonResponse({'data':match_serialize.data, 'status' : '400'})

@api_view(['GET'])
def get_match_history(request):
    user = request.user  # Get the authenticated user
    match_history = MatchHistoric.objects.filter(user=user)  # Retrieve matches for the authenticated user

    response_data = []
    
    for match in match_history:
        match_data = {
            "id": match.id,
            "user": {
                "id": match.user.id,
                "username": match.user.username,
                "imageProfile": match.user.imageProfile.url
            },
            "opponent": {
                "id": match.opponent.id,
                "username": match.opponent.username,
                "imageProfile": match.opponent.imageProfile.url
            },
            "result": match.result,
            "create_at": match.create_at # isoformat solve issue search about it
        }
        response_data.append(match_data)

    return JsonResponse(response_data, safe=False)

