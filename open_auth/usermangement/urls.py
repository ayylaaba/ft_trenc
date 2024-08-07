from    django.urls import path
from    .           import views

urlpatterns=[
    path('update/', views.update_user),
    path('profile/', views.profile)
]