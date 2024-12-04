from oauth.models               import User_info
from .models                    import MatchHistoric
from .serializer                import  MatchHistoricSerialzer, UserInfoSerializer
from    django.http             import JsonResponse
from rest_framework.decorators  import api_view
from django.contrib.auth        import authenticate, login, logout
from django.core.cache          import cache

@api_view(['POST'])
def store_match(request):
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({'status': '400', 'data': 'user is not authenticated'})

    try:
        user_db = User_info.objects.get(id=user.id)
    except User_info.DoesNotExist:
        return JsonResponse({'status': '404', 'data': 'User not found'})

    # Update user level and score
    user_db.level = request.data.get('level')
    user_db.score = request.data.get('score')
    user_db.save()
    user_db.refresh_from_db()  # Ensure fresh data is loaded from DB

    # Invalidate cache for the user
    cache_key = f"user_profile_{user.id}"
    cache.delete(cache_key)

    # Update cache with the latest data
    serialize_user = UserInfoSerializer(user_db)
    cache.set(cache_key, serialize_user.data, timeout=None)

    # Store match data
    match_serialize = MatchHistoricSerialzer(data=request.data)
    if match_serialize.is_valid():
        match_serialize.save()
        return JsonResponse({'data': match_serialize.data, 'status': '200'})

    return JsonResponse({'data': match_serialize.errors, 'status': '400'})

@api_view(['GET'])
def get_match_history(request):
    user = request.user  # Get the authenticated user
    if not user.is_authenticated:
        return JsonResponse({'status' : '400', 'data' : 'user is not authenticated'})
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
            "Type": match.Type,
            "score": match.score
        }
        response_data.append(match_data)

    return JsonResponse(response_data, safe=False)


@api_view(['GET'])
def get_curr_user(request):
    user = request.user

    if not user.is_authenticated:
        return JsonResponse({'status': '400', 'data': 'User is not authenticated'})

    try:
        user_db = User_info.objects.get(id=user.id)  # Fetch fresh user data from DB
    except User_info.DoesNotExist:
        return JsonResponse({'status': '404', 'data': 'User not found'})

    # Cache management
    cache_key = f"user_profile_{user.id}"
    cached_data = cache.get(cache_key)

    if cached_data:
        print(f"Returning cached data for user {user.id}")
        return JsonResponse({'status': '200', 'data': cached_data})

    # Serialize and cache fresh user data
    serialize_user = UserInfoSerializer(user_db)
    cache.set(cache_key, serialize_user.data, timeout=None)  # Cache the latest data
    print("\033[1;33m Current user data -> : ", serialize_user.data, flush=True)

    return JsonResponse({'status': '200', 'data': serialize_user.data})
