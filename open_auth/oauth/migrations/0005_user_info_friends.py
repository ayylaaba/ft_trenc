# Generated by Django 4.2.10 on 2024-09-02 18:22

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oauth', '0004_remove_user_info_image_url_user_info_imageprofile'),
    ]

    operations = [
        migrations.AddField(
            model_name='user_info',
            name='friends',
            field=models.ManyToManyField(blank=True, to=settings.AUTH_USER_MODEL),
        ),
    ]
