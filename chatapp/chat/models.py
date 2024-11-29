from django.db import models



class Room(models.Model):
    user_1 = models.CharField(max_length=255)
    user_2 = models.CharField(max_length=255)
    room_name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return f"{self.user_1} to {self.user_2}"

    @staticmethod
    def get_room(user1, user2):

        room_name = f"{min(user1, user2)}_{max(user1, user2)}"
        room, create = Room.objects.get_or_create(user1=user_1, user2=user_2, room_name=room_name)

        if create:
            print("room was created")
        else:
            print("room already created")


class Block(models.Model):
    blocker = models.CharField(max_length=255)
    blocked = models.CharField(max_length=255)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.blocker} block {self.blocked}"

        
class Message(models.Model):
    author = models.CharField(max_length=255, null=True, blank=True)
    room = models.ForeignKey(Room, related_name='room', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"message from {self.author}"

    def last_messages():
        return Message.objects.orderby('-timestamp').all()[:10]
