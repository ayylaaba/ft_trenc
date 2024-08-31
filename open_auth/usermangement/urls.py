from    django.urls             import path
from    usermangement           import views

urlpatterns=[
    path('update/', views.update_user),
    path('Profile/', views.profile),
    path('list/', views.users_list),
    path('send_friend/<int:receiver_id>/', views.send_friend_request) # a dynamic segment <int:receiver_id>
]