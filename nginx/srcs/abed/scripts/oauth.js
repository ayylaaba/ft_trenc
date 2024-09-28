import { get_csrf_token, showHome } from "./register.js";

const oauthFunction = async (event)=> {
    event.preventDefault(); // Prevent the default form submission
    console.log('send to backend for authorization code...');
    const response = await fetch('/oauth/');
    if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.status == 'success') {
            location.href = jsonResponse.full_authoriztion_url; // redirect to a new url; (which is intra url);
        }
    }
    else {
        console.error("error happened.");
    }
}

const intraBtn = document.querySelector('.intra');
intraBtn.addEventListener('click', oauthFunction);
//part above is mine;

const oauthCallback = async ()=> {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) 
    {
        let token = await get_csrf_token();
        let response = await fetch('/oauth/callback/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': token,
            },
            body: JSON.stringify({ code: code })
        })
        if (response.ok) {
            const jsonResponse = await response.json();
            console.log('status ==> ', jsonResponse.status )
            if (jsonResponse.status == 'success') {
                document.querySelector("#full-container").style.display = "flex";
                document.querySelector('#main').style.display = 'flex';
                document.querySelector("#nav").style.display = "flex";
                document.querySelector('#login-parent').style.display = 'none';
                document.querySelector('#profile-part').style.display = 'none';
                // document.getElementById('user-name').textContent = jsonResponse.data.username;
                // document.getElementById('full-name').textContent = jsonResponse.data.fullname;
                // document.getElementById('profile-image').src = jsonResponse.data.imageProfile
                // console.log('image = ', jsonResponse.data.imageProfile)
            }
        }
        else {
            console.error('Error:', error);
        }
    }
}

oauthCallback();
