from django.urls import path

from . import views


urlpatterns = [
    
    path('api/room_name/', views.get_create_room, name='room_name'),
    path('api/block_user/', views.block_user, name='block_user'),
    path('api/unblock_user/', views.unblock_user, name='unblock_user'),
    path('api/is_user_blocked/', views.is_user_blocked, name='is_user_blocked'),

]