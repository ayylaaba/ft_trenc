export const chatButton = document.querySelector("#chat");
export const chatPage = document.querySelector("#chat-part");
let chatSocket = null;
let thisSocket = null;

import { profileId } from "./profile.js";
import { main } from "./home.js";
import { settingPage } from "./setting.js";
import { rankPart } from "./rank.js";
import { friendsPart, friendsFunction } from "./friends.js";
import { get_csrf_token } from "./register.js";
import { newDataFunc } from "../script.js";
import { socketFunction, localStorageTracking, bellNotifUser, bellNotif } from "./socket.js";


const notifButton = document.querySelector(".search-icons .btn");
const profBtn = document.querySelector("#profile-pict .btn");

const bodyElement = document.querySelector("body");
bodyElement.addEventListener("click", (event)=> {
    const blockStyle = document.querySelector(".block-style");
    if (blockStyle) {
        blockStyle.remove();
    }
    const notifications = document.querySelector("#notifications");
    if (notifications) {
        notifButton.style.backgroundColor = "#2f1e65";
        notifications.remove();
    }
    const logoutPhone = document.querySelector(".logout-phone");
    if (logoutPhone) {
        profBtn.style.backgroundColor = "#2f1e65";
        logoutPhone.remove();
    }
    const matchBlock = document.querySelector(".match-block");
    if (matchBlock) {
        matchBlock.style.display = "none";
    }
})

export const popupCard = (message) => {
    const cardDiv = document.createElement("div");
    cardDiv.id = "card-div";
    const bodyElement = document.querySelector("body");
    const paragraph = document.createElement("p");
    paragraph.id = "paragraph-id";
    paragraph.innerHTML = `${message}`;
    const buttonn = document.querySelector("button");
    buttonn.id = "pop-btn";
    buttonn.innerHTML = "Ok";
    cardDiv.append(paragraph, buttonn);
    bodyElement.append(cardDiv);
    setTimeout(()=> {
        cardDiv.style.display = "none";
    }, 3000);
}

export const chatFunction = async () => {
    profileId.style.display = "none";
    main.style.display = "none";
    settingPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    chatPage.style.display = "block";
    localStorage.setItem("messageNotif", "false");
    bellNotif.remove();
    const chats = document.querySelector("#chats");
    document.querySelector('#chat-pic').style.display = 'none';
    document.querySelector('#input-group-chat').style.display = 'none';
    document.querySelector('#user-status').style.display = 'none';
    const ul = document.getElementById('msgs');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    if (chats) {
        chats.innerHTML = "";
    }
    await data_characters();
}

// chatButton.addEventListener("click", chatFunction);

const container = document.querySelector("#msgs");

const scrollToBottom = ()=> {
    container.scrollTop = container.scrollHeight;    
}

async function getRoomName(recipient, sender) {
    const token = await get_csrf_token();
    const response = await fetch('http://127.0.0.1:8003/chat/api/room_name/', {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
            'X-CSRFToken':  token
        },
        body: JSON.stringify({
            'user1':  sender,
            'user2': recipient,
        })
        
    });
    if (response.ok) {
        // console.log("ok");
        const data = await response.json();
        // console.log(`this user : ${data.room_name}`);
        return data.room_id;
    }
    else {
        console.log("no");
    }
}


function showRoom(recipient, sender) {
    document.querySelectorAll('.my-msg').forEach(log => {
        log.style.display = 'none';
    });
    document.querySelectorAll('.friend-msg').forEach(log => {
        log.style.display = 'none';
    });
    checkBlockStatus(recipient, sender);
}


async function block_user(recipient, room_id, sender) {
    const token = await get_csrf_token();
    const response = await fetch('http://127.0.0.1:8003/chat/api/block_user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken':  token
        },
        body: JSON.stringify ({
            'blocker' : sender,
            'blocked': recipient,
            'room_id': room_id
        })
    });
    if (response.ok) {
        const data = await response.json();
    }
    else {
        const data = await response.json();
        console.log('fetch block users not working', response.status, response.statusText, data);
    }
}

const unblockUser = async (room_id) => {
    const token = await get_csrf_token();
    const response = await fetch('http://127.0.0.1:8003/chat/api/unblock_user/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': token,
        },
        body: JSON.stringify({ 'room_id': room_id }),
    });

    if (response.ok) {
        const data = await response.json();
        return data.etat;
    } else {
        const error = await response.json();
        return false;
    }
};


async function is_user_blockes(room_id, username, blocked) {
    const token = await get_csrf_token();
    const response = await fetch('http://127.0.0.1:8003/chat/api/is_user_blocked/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken':  token
        },
        body: JSON.stringify ({
            'blocker': username,
            'room_id' : room_id,
            'blocked': blocked
        })
    });
    if (response.ok) {
        const data = await response.json();
        return data;
    }
    else {

        console.log('fetch isUserBloked not working', response.status, response.statusText);
    }
}


const checkBlockStatus = async (recipient, sender) => {
    const room_id = await getRoomName(recipient, sender);
    const data = await is_user_blockes(room_id, sender, recipient);
    if (data.etat) {
        document.querySelector('#something').disabled = false;
    } else {
        document.querySelector('#something').disabled = false;
    }
};

const data_characters = async () => {

    const characters = await friendsFunction();
    const thisCurrUser = await newDataFunc();
    const chats1 = document.querySelector("#chats");
    thisSocket = await socketFunction();
    let room_id = 0;
    let check = "";

    characters.forEach(character => {
        
        const userStr = `
            <p>${character.username} </p>
            <p class="user-dots">
                <button id="user-${character.id}" class="btn" style="background-color: rgb(0, 12, 45, 0.90);">
                <i class="fa-solid fa-ellipsis-vertical"></i>
                </button>
                </p>
                `;
                const user = document.createElement("div");
                user.id = `user-${character.id}`;
                user.classList.add("user");
                user.innerHTML = userStr.trim();
                let visitId = character.username;
                chats1.appendChild(user);
                
                const handleDots = async (event) => {
                    event.stopPropagation();
                    room_id = await getRoomName(character.username, thisCurrUser.username);
                    check = await is_user_blockes(room_id, thisCurrUser.username, character.username);
                    console.log("hello from block check", check.etat, check.blocker);
                    const existingBlock = document.querySelector(".block-style");
                    if (existingBlock)
                        existingBlock.remove();
                    else {
                        const blockContainer = `
                        <button id="play-${character.id}" class="block-child">Play</button>
                        <button id="visit-${visitId}" class="block-child">Visit Profile</button>
                        `;
                        const blockElement = document.createElement("div");
                        const blockBtn = document.createElement('button');
                        blockBtn.id = `block-${character.id}`;
                        blockBtn.classList.add('block-child');
                        if (check.etat === false) {
                            blockBtn.innerHTML = "Block";
                        }
                        else {
                            blockBtn.innerHTML = "Unblock";
                        }
                        blockElement.classList.add("block-style"); // style in css
                        blockElement.innerHTML = blockContainer.trim();
                        blockElement.appendChild(blockBtn);
                        user.appendChild(blockElement);
                        
                        // ------------------ visit profile modification from Abed ------------------------- //
                        const visitButton = document.querySelector(`#visit-${visitId}`);
                        const handleVisit = (event) => {
                            event.stopPropagation();
                            const strElement = `
                            <button type="button" class="btn-close" aria-label="Close"></button>
                            <div style="background-image: url(${character.imageProfile});" class="profile-chat-image"></div>
                            <h3>@${character.username}</h3>
                            <h3>level: ${character.level}</h3>
                            <div class="progress">
                            <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 55%" aria-valuenow="55" aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                            <h3>Score: ${character.score}</h3>
                            <div style="display: flex; justify-content: space-evenly; width: 100%;">
                            <h3>Wins: ${character.win}</h3>
                            <h3>Loses: ${character.loss}</h3>
                            </div>
                            `;
                            const chatPageRow = document.querySelector("#chat-part .row");
                            const cardDiv = document.createElement("div");
                            cardDiv.classList.add("profile-card"); // style in css;
                            cardDiv.innerHTML = strElement.trim();
                            chatPageRow.append(cardDiv);
                            const closeBtn = document.querySelector(".profile-card .btn-close");
                            const handleClose = ()=> {
                                cardDiv.remove();
                            }
                            closeBtn.addEventListener("click", handleClose);
                        }
                        visitButton.addEventListener("click", handleVisit);
                        // ------------------- end modification ----------------------- //
                        
                        // on click play buuton
                        document.getElementById(`play-${character.id}`).addEventListener('click', async function (e) {
                            
                            if (check.etat === false) {
                                thisSocket.send(JSON.stringify ({
                                    'type': 'requestFriend',
                                    'recipient_id': character.id,
                                    'sender_id': thisCurrUser.id,
                                    'sender': thisCurrUser.username,
                                    'recipient': character.username
                                }));
                            }
                            else {
                                console.log('yooooooooooooooooooooooo');
                                popupCard(`You blocked ${character.username}`);
                            }
                        });
                
                // -------------------------------------------- on click block buton ----------------------------------------------------------------------------- 
                const blockTag = document.getElementById(`block-${character.id}`);
                blockTag.addEventListener('click', async function(e) {
                    if (check.etat === false) {
                        block_user(character.username, room_id, thisCurrUser.username);
                        alert(`you block ${character.username}`);
                        blockTag.innerHTML = "Unblock";
                        console.log("---> from chat send cridentials ", character.id, character.username);
                        if (thisSocket.readyState === WebSocket.OPEN){
                            thisSocket.send(JSON.stringify ({
                                'type': 'request_block',
                                'recipient_id': character.id,
                                'blocked_id': thisCurrUser.id,
                                'blocker': thisCurrUser.username,
                                'etat': true
                            }));
                        }
                    }
                    else {
                        blockTag.innerHTML = "Block";
                        unblockUser(room_id);
                        alert(`you unblock ${character.username} ${check.etat}`);
                        if (thisSocket.readyState === WebSocket.OPEN){
                            thisSocket.send(JSON.stringify ({
                                'type': 'request_block',
                                'recipient_id': character.id,
                                'blocked_id': thisCurrUser.id,
                                'blocker': thisCurrUser.username,
                                'etat': false
                            }));
                        }
                    }
                });
            }
        }

        const dots = user.querySelector(".user-dots button");
        dots.addEventListener("click", handleDots);

        const handleUserClick = async(userElement) => {
            // =========== just style ================
            const users = document.querySelectorAll("#chats div");
            users.forEach(user => {
                // for cleaning;
                user.classList.remove("selected-user");
                user.style.width = "90%";
                user.style.boxShadow = "0 0 5px #0e2c2e";
            });
            userElement.style.boxShadow = "0 0 5px #9bf9ff";
            userElement.classList.add("selected-user");
            document.querySelector("#chat-pic").style.display = 'block';
            document.querySelector('#input-group-chat').style.display = 'flex';
            document.querySelector('#user-status').style.display = 'block';
            const picTag = document.querySelector("#chat-pic");
            picTag.style.backgroundImage = `url("${character.imageProfile}")`;
            document.querySelector("#secondd h3").innerHTML = character.username;
            // =============== Modify here ==============

            console.log("user id ", character.id);
            const room_id = await getRoomName(character.username, thisCurrUser.username);
            check = await is_user_blockes(room_id, thisCurrUser.username, character.username);
            console.log(`Room name: ${room_id}`);
            showRoom(character.username, thisCurrUser.username);
            if (check.etat === false && check.blocker !== character.username) {
                    initWebSocket(room_id, character.username, character.id);
            }
            else {
                const inputChat = document.querySelector('#input-group-chat');
                inputChat.style.display = "none";
            }
        };
        user.addEventListener("click", async function () { handleUserClick(user);});
    });

    for (const character of characters) {
        
        room_id = await getRoomName(character.username, thisCurrUser.username);
        check = await is_user_blockes(room_id, thisCurrUser.username, character.username);
        if (check.blocker === character.username) {
            document.getElementById(`user-${character.id}`).disabled = true;
        }
        const messageNotification = localStorage.getItem(`messageUser-${character.id}`); //bellNotifUser
        if (messageNotification === "true") {
            const user = document.getElementById(`user-${character.id}`);
            user.append(bellNotifUser);
            // const chatIcone = document.querySelector("#chat");
            localStorageTracking(`messageUser-${character.id}`, bellNotifUser, user);
        }
    }

    function initWebSocket(roomId, username, userID) {

        if (chatSocket !== null) {
            chatSocket.close();
            console.log('socket closed');
            const ul = document.getElementById('msgs');
            while (ul.firstChild) {
                ul.removeChild(ul.firstChild);
            }
        }

        chatSocket = new WebSocket (
            'ws://' + window.location.hostname + ':8003/ws/chat/' + roomId + '/'
        );
    
        chatSocket.onopen = function(e) {

            console.log("socket is connecting" , e);
        }
    
        chatSocket.onmessage = (e) => {
            
            const data = JSON.parse(e.data);
            const message = data['message'] || "";
            const type = data['type'];
            const messageBlock = data['message_block'];
            const author = data['author'];
            const isBlocked = data['is_blocked'];

            if (message.trim()) {
                console.log("message --- ", message);
                const msgTag = document.createElement('div');
                msgTag.textContent = message;
                if (author === thisCurrUser.username) {
                    msgTag.classList.add('my-msg');
                }
                else {
                    msgTag.classList.add('friend-msg');
                }
                document.getElementById('msgs').appendChild(msgTag);
            }
        }
    
        // chatSocket.onclose = function(e) {
        //     console.log("socket closed unexpectedly", e);
        // }
    
        document.querySelector('#something').onkeyup = function(e) {
            if (e.key === 'Enter') {
                document.querySelector('#input-group-text-chat').click();
            }
        };
    
        document.querySelector('#input-group-text-chat').onclick = function(e) {
            var messageinput = document.querySelector('#something');
            var message = messageinput.value;
    
            if (message !== "" && chatSocket.readyState === WebSocket.OPEN) {
                chatSocket.send(JSON.stringify ({
                  'message': message,
                  'author' : thisCurrUser.username,
                  'roomId': roomId,
                  'recipient' : username
                }));
                messageinput.value = '';
                scrollToBottom();
                thisSocket.send(JSON.stringify ({
                    'type': "notif",
                    'id': userID,
                    'senderID': thisCurrUser.id
                }));
            }
            else {
                messageinput.value = '';
            }
        };
    }
};