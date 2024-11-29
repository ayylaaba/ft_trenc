from django.db import models

# Create your models here.

class XRoom(models.Model):
    code = models.CharField(max_length=8, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    players = models.IntegerField(default=0)
    #user 
    # opeent

