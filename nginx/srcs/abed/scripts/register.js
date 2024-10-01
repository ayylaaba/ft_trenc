// export let dataObjectt = null;

import { showLogin } from "./logout.js";

export const get_csrf_token = async () => {
    const response = await fetch('/get_csrf_token/');
    const jsonResponse = await response.json();
    document.querySelector('.csrf_token').value = jsonResponse.csrfToken;
    // console.log("TOKENNN: " + jsonResponse.csrfToken);
    return jsonResponse.csrfToken;
}

const registerForm = document.querySelector("#register-form");

const registrationFunction = async (event) => {
    event.preventDefault();
    const token =  await get_csrf_token();
    // console.log("++++" + token + "+++++");
    try {
        const formData = new FormData(registerForm);
        const response = await fetch('/register/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': token, // Include the CSRF token
            },
            body: formData
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            // console.log("Json response: " + jsonResponse.data.username);
            if (jsonResponse.status === "success") {
                showLogin();
            }
            else {
                console.log(jsonResponse.error);
            }
            return jsonResponse;
        }
        else {
            alert("error happened");
        }
    }
    catch(err) {
        console.error(err);
    }
}
registerForm.addEventListener("submit", registrationFunction);

export const showHome = (dataObj)=> {
    const socket = new WebSocket('ws://localhost:8000/ws/friend_requests/');
    socket.onopen = function() {
        console.log('WebSocket connection established');
        };
        socket.onerror = function(error) {
        console.log(' ---| WEBSOCKET IS NOT CONNECTE |----------', error);
        console.error('WebSocket error:', error);
    };
    // When a message is received
    socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        alert('check -----> ', data.option)
        if (data.option === 'refuse_frd_req'){
            alert('refuse request')
            console.log('data : ', data.data)
            // console.log('online_status : ', data.online_status)
        }
        if (data.option === 'receive_frd_req'){
            alert('receive request accept/refuse')
            console.log('data : ', data.data)
            // console.log('online_status : ', data.online_status)
        }
        if (data.option === 'unfriend'){
            alert('remove the friendship with you')
            console.log('data : ', data.data)
            // console.log('online_status : ', data.online_status)
        }
        if (data.option === 'is_online'){
            alert('cho halto maskin kidayra')
            console.log('data : ', data.data)
            // console.log('online_status : ', data.online_status)
        }
        if (data.option === 'accepte_request'){
            alert('accepte request \'{+_+}\'')
            console.log('data : ', data.data)
            // console.log('online_status : ', data.online_status)
        }
        // if (data.option === 'is_online'){
        //     alert('cho halto maskin kidayra')
        //     console.log('username : ', data.username)
        //     console.log('online_status : ', data.online_status)
        // }
        // if (data.status === 'success') {
        //     // Handle the incoming friend request data
        //     alert('hi you received request ->')
        //     // console.log('Friend request received:', data.data);
        //     console.log('receive req:', data.data);
        //     // Update the UI to show the new friend request
        // }
    };

    // When the socket connection is closed
    socket.onclose = function() {
        console.log('WebSocket connection closed');
    };
    // localStorage.setItem(dataObj.username);
    document.querySelector("#full-container").style.display = "flex";
    // document.querySelector("#online-friends").style.display = "flex";
    document.querySelector("#login-parent").style.display = "none";
    document.querySelector("#nav").style.display = "flex";
    document.querySelector("#main").style.display = "flex";
    document.querySelector("#us h3").innerHTML = `${dataObj.username}`;
    document.querySelector("#welcome > h1").innerHTML = `Welcome ${dataObj.firstname} ${dataObj.lastname}!`;
}
