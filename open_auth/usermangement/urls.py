from    django.urls             import path
from    usermangement           import views

urlpatterns=[
    path('update/', views.update_user),
    path('Profile/', views.profile)
]