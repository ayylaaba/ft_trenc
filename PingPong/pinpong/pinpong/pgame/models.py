from django.db import models

# Create your models here.

class Proom(models.Model):
    code = models.CharField(max_length=8, unique=True)
    players = models.IntegerField(default=0)
    is_reserved = models.IntegerField(default=0)