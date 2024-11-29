async function fetchUsers() {

    const response = await fetch('htp://127.0.0.1:8000/user/get_user_friends/');
    const response_currentUser = await fetch('http://127.0.0.1:8000/chat/api/this_user/');
    
    const users = await response.json();
    const currentUser = await response_currentUser.json();

    const user_list = document.getElementById("user-list");
    var room_name = "";
    var recipient = "";
    var chatSocket = null;

    const thisUsername = document.getElementById("this_username");
    // console.log("username : " + currentUser.username);
    thisUsername.innerHTML = currentUser.username;
    
    function updateUserProfile(username) {
        const current = document.querySelector(".contact-profile p");
        const current_img = document.querySelector(".contact-profile img");
        current.textContent = username;
        recipient = username;
        current_img.src = "http://emilcarlsson.se/assets/harveyspecter.png";
    }

    function createRoomContainer(roomName) {
      const chatRoomContainer = document.getElementById("chat-room-container");
  
      const roomLog = document.createElement('ul');
      roomLog.id = `chat-log-${roomName}`;
      roomLog.classList.add('chat-log');
      roomLog.style.display = 'none';
      chatRoomContainer.appendChild(roomLog);
      return roomLog;
  }
  

    function showRoom(roomName) {

        // console.log("show room");
        document.querySelectorAll('.chat-log').forEach(log => {
            log.style.display = 'none';
        });

        const selectedUser = document.getElementById(`chat-log-${roomName}`);
        selectedUser.style.display = 'block';
    }

      async function getRoomName(recipient) {

        const response = await fetch('http://127.0.0.1:8000/chat/api/room_name', {

          method: 'POST',
          headers : {
              'Content-Type': 'application/json',
                // 'X-CSRFToken': getCookie('csrftoken'),
          },
          body: JSON.stringify({
            'user2_username': recipient,
            'user2_id': recipient
        })

      });
      const data = await response.json();

      return data.room_name;
    }

    var previousUser = null;
    users.forEach(user => {

        const useritem = document.createElement('li');
        useritem.dataset.userID = user.id;
        useritem.classList.add('contact');
        console.log("user : " + user.username);

        useritem.innerHTML = `
            <div class="wrap">
                <span class="contact-status online"></span>
                <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                <div class="meta">
                    <p class="name">${user.username}</p>
                    <p class="preview">Last message preview...</p>
                </div>
            </div>
        `;

  
        useritem.addEventListener('click', async function(event) {
          
          if (previousUser !== null &&  previousUser !== useritem) {
            console.log("hereee");
            previousUser.style.pointerEvents = 'auto';
            previousUser.style.opacity = '1';
          }
            useritem.style.pointerEvents = 'none';
            useritem.style.opacity = '0.75';
          room_name = await getRoomName(user.id);
          updateUserProfile(user.username);

          if (!document.getElementById(`chat-log-${room_name}`)) {
            createRoomContainer(room_name);
          }
          showRoom(room_name);
          // console.log('Room created/fetched:', room_name);
          
          initializeWebSocket(room_name);
          previousUser = useritem;
      });

      user_list.appendChild(useritem);
  });


    function initializeWebSocket(room_name) {

      if (chatSocket !== null) {
        chatSocket.close();
        console.log('Previous WebSocket connection closed.');

        const ul = document.getElementById(`chat-log-${room_name}`);  // Select the <ul> by its ID

    // Remove all child elements from the <ul>
        while (ul.firstChild) {
            ul.removeChild(ul.firstChild);  // Removes the first child until there are none
        }
      }

      chatSocket = new WebSocket(
        'ws://' + window.location.hostname + ':8000/ws/chat/' + room_name + '/'
    );


        chatSocket.onopen = function(e) {

          console.log("socket is connecting", e);
        }

        chatSocket.onmessage = (e) => {
          
          const data = JSON.parse(e.data);
          const message = data['message'];
          const author = message['author'];
          const msgListTag = document.createElement('li');
          const imgTag = document.createElement('img');
          const pTag = document.createElement('p');

          pTag.textContent = message;
          imgTag.src = "http://emilcarlsson.se/assets/mikeross.png";

          if (author === currentUser.username)
            msgListTag.className = 'sent';
          else
            msgListTag.className = 'replies';

            msgListTag.appendChild(imgTag);
            msgListTag.appendChild(pTag);

            const addChat = document.getElementById(`chat-log-${room_name}`);
            addChat.appendChild(msgListTag);

        };

        chatSocket.onclose = function(e) {

            console.log("socket closed unexpectedly");
        };

        document.querySelector('#chat-message-input').onkeyup = function(e) {
          if (e.key === 'Enter') {
              document.querySelector('#chat-message-submit').click();
          }
        };

        document.querySelector('#chat-message-submit').onclick = function(e) {
          var messageinput = document.querySelector('#chat-message-input');
          var message = messageinput.value;
          chatSocket.send(JSON.stringify ({
            'message': message,
            'author' : currentUser.username,
            'roomName': room_name,
            'recipient' : recipient
          }));
          messageinput.value = '';
        };
    }
    

}

window.onload = fetchUsers;