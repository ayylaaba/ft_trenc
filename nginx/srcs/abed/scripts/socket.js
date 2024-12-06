import { friendsFunction, suggestionsFunction, requestsFunction, createRequestCards, createFriendCards, createSuggestionCard, sendIdToBackend } from "./friends.js";
import { mainFunction, lookForUsers } from "./home.js";
import { notificationFunction, notifBtn } from "./notification.js";

export let flag = 0;
export let socket = null;
export let check_status = false;
let count = 0;

export const createToast = (message, timeAgo) => {
    // Create toast HTML structure
    let toastHTML = `
    <div class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
        <div class="toast-header">
          <i class="fa-solid fa-circle" id="online-icon-1" style="color: green; filter: drop-shadow(green 0px 0px 1px);"></i>
          <strong class="me-auto" style="margin-left: 8px;">${message}</strong>
          <small>${timeAgo}</small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          ${message} is online!
        </div>
      </div>`
      ;

    // Convert the HTML string to a DOM element
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = toastHTML.trim();
    // Append the toast to the container
    let toastElement = tempDiv.firstChild;
    document.querySelector('body').appendChild(toastElement); // append the first div .toast to the body.

    // Show the toast using Bootstrap's toast class
    let toast = new bootstrap.Toast(toastElement);
    toast.show();
    setTimeout(() => {
        toastElement.remove();
    }, 6000);
}

export const socketFunction = async () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn && !flag) {
        console.log("the flag: ", flag);
        await friendsFunction(); // create friends cards first.
        socket = new WebSocket('wss://10.14.9.6:8082/wss/friend_requests/');
        socket.onopen = function() {
                console.log('WebSocket connection established');
                flag++;
            };
            socket.onerror = function(error) {
                console.log(' ---| WEBSOCKET IS NOT CONNECTE |----------', error);
                console.error('WebSocket error:', error);
        };
        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const recipient = data.recipient;
            const sender = data['author'];
            const sender_id = data['senderId'];
            
            if (data.type === 'play_invitation') {
                
                console.log('check yes', count);

                const _confirm = `
                    <p>You have been invited to pong match with ${sender}</p>
                    <div id="yesno">
                        <button id="yesss" style="color: white; border: none; width: 90px; border-radius: 10px; background-color: green; height: 35px;">Yes</button>
                        <button id="nooo" style="color: white; border: none; width: 90px; border-radius: 10px; background-color: #b32d2d; height: 35px;">NO</button>
                    </div>
                `;
                const cardDiv = document.createElement("div");
                cardDiv.id = "Pong-invitation";
                cardDiv.innerHTML = _confirm.trim();
                const bodyElement = document.querySelector("body");
                bodyElement.append(cardDiv);

                const yesss = document.querySelector("#yesss");
                const nooo = document.querySelector("#nooo");
                yesss.addEventListener("click", ()=> {
                    
                    socket.send(JSON.stringify ({
                        'type': 'response',
                        'sender' : sender,
                        'sender_id': sender_id,
                        'recipient': recipient,
                        'confirmation': true
                    }))
                    cardDiv.remove();
                });
                nooo.addEventListener("click", () => {
                    console.log("check no");
                    count = 0;
                    socket.send(JSON.stringify ({
                        'type': 'response',
                        'sender' : sender,
                        'sender_id': sender_id,
                        'recipient': recipient,
                        'confirmation': false
                    }))
                    cardDiv.remove();
                });
                
                setInterval(()=> {
                    cardDiv.remove();
                }, 10000);
            }
            if (data.type === 'response_invitation' && count == 0) {

                count = 1;
                const _confirm = data['confirmation'];
                const recipient = data['recipient'];
                console.log('----------- hellolooooooooooooooo');
    
                if (_confirm){
                    console.log('check is true');
                }
                else {
                    console.log('check is false');
                }
            }
            else if (count == 1)
                count = 0;
            if (data.type === 'response_block') {

                count = 1;
                const block_id = data['block_id'];
                const etat = data['etat'];

                const dots = document.querySelector(`#user-${block_id}`);
                
                if (etat === true) {
                    if (dots) {
                        dots.addEventListener('click', function() {
                            event.preventDefault();
                        });
                        dots.disabled = true;
                    }
                }
                else {
                    if (dots) {
                        dots.addEventListener('click', function() {
                            event.preventDefault();
                        });
                        dots.disabled = false;
                    }
                }
            }
            if (data.status === 'success') {
                if (data.option === 'receive_frd_req'){
                    const bellNotif = document.createElement("div");
                    bellNotif.id = "bell-notif";
                    notifBtn.append(bellNotif);
                    localStorage.setItem("notifications", true);
                    // notificationFunction(data.data.from_user.username, data.data.from_user.imageProfile);
                    console.log("receive: ", data.data);
                    notifBtn.addEventListener("click", () => {
                        localStorage.setItem("notifications", false);
                        bellNotif.remove()
                    });
                    // suggestionsFunction();
                    // requestsFunction();
                    const acceptBtnsListen = document.querySelectorAll(".add .accept");
                    for(let i = 0; i < acceptBtnsListen.length; i++) {
                        console.log("Acceptttttttttt 2222222222222222222");
                        acceptBtnsListen[i].addEventListener("click", ()=> sendIdToBackend(data.data.id, "accept"));
                    }
                    const refuseBtnsListen = document.querySelectorAll(".delete .refuse");
                    for(let i = 0; i < refuseBtnsListen.length; i++) {
                        refuseBtnsListen[i].addEventListener("click", ()=> sendIdToBackend(data.data.id, "refuse"));
                    }
                    console.log("Before Acceptttttttttt");
                    const acceptBtnsNotifListen = document.querySelectorAll("#notifications .acc-req");
                    for(let i = 0; i < acceptBtnsNotifListen.length; i++) {
                        console.log("Acceptttttttttt");
                        acceptBtnsNotifListen[i].addEventListener("click", ()=> sendIdToBackend(data.data.id, "accept"));
                    }
                    const refuseBtnsNotifListen = document.querySelectorAll("#notifications .ref-req");
                    for(let i = 0; i < refuseBtnsNotifListen.length; i++) {
                        refuseBtnsNotifListen[i].addEventListener("click", ()=> sendIdToBackend(data.data.id, "refuse"));
                    }
                }
                if (data.option === 'accepte_request'){
                    console.log('accepted frd request : ', data.data)
                    createFriendCards(data.data.username, data.data.imageProfile, data.data.id);
                    const unfriendBtns = document.querySelectorAll(".delete .unfriendd");
                    for(let i = 0; i < unfriendBtns.length; i++) {
                        unfriendBtns[i].addEventListener("click", ()=> sendIdToBackend(data.data.id, "unfriend"));
                    }
                }
                if (data.option === 'refuse_frd_req'){
                    console.log("refuse: ", data.data);
                    mainFunction();
                    lookForUsers();
                    createSuggestionCard(data.data.username, data.data.imageProfile);
                    const addBtnsListen = document.querySelectorAll(".add .btn");
                    for(let i = 0; i < addBtnsListen.length; i++) {
                        addBtnsListen[i].addEventListener("click", ()=> sendIdToBackend(data.data.from_user_id, "add"));
                    }
                }
                if (data.option === 'unfriend'){
                    friendsFunction();
                    console.log('unfriend : ', data.data)
                    createSuggestionCard(data.data.username, data.data.imageProfile);
                    const unfriendBtns = document.querySelectorAll(".delete .unfriendd");
                    for(let i = 0; i < unfriendBtns.length; i++) {
                        unfriendBtns[i].addEventListener("click", ()=> sendIdToBackend(data.data.id, "unfriend"));
                    }
                }
                if (data.option === 'is_online') {
                    if (document.querySelector(`#online-icon-${data.data.id}`) === null) {
                        createFriendCards(data.data.username, data.data.imageProfile, data.data.id);
                    }
                    const onlineIcon = document.querySelector(`#online-icon-${data.data.id}`);
                    console.log("the icon: ", onlineIcon);
                    if (data.data.online_status) {
                        createToast(data.data.username, 'just now');
                        onlineIcon.style.color = "green";
                        onlineIcon.style.filter = "drop-shadow(0 0 1px green)";
                        localStorage.setItem(`online_status_${data.data.id}`, 'online');  // Store online status
                    } else if (!data.data.online_status) {
                        onlineIcon.style.color = "red";
                        onlineIcon.style.filter = "drop-shadow(0 0 1px red)";
                        localStorage.setItem(`online_status_${data.data.id}`, 'offline');  // Store offline status
                    }
                }
            }
        };
        socket.onclose = function() {
            console.log('WebSocket connection closed');
            flag = 0;
        };
    }
    return socket;
}