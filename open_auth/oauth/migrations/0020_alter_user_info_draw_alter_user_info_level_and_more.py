# Generated by Django 4.2.10 on 2024-12-02 21:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oauth', '0019_alter_user_info_draw_alter_user_info_level_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user_info',
            name='draw',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='user_info',
            name='level',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='user_info',
            name='loss',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='user_info',
            name='score',
            field=models.IntegerField(default=0),
        ),
        migrations.AlterField(
            model_name='user_info',
            name='win',
            field=models.IntegerField(default=0),
        ),
    ]