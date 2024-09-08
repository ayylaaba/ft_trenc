from    django.urls             import path
from    usermangement           import views

urlpatterns=[
    path('update/', views.update_user),
    path('Profile/', views.profile),
    path('list/', views.users_list),
    path('ChangePass/', views.ChangePassword),# update password and also username
    path('send_friend/<int:receiver_id>/', views.send_friend_request), # a dynamic segment <int:receiver_id>
    path('reject_request/<int:receiver_id>/', views.reject_request) # a dynamic segment <int:receiver_id>
]
