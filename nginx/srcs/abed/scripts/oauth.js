let csrfToken;
document.addEventListener('DOMContentLoaded', function() {
    get_csrf_token();
    // Function to fetch and set the CSRF token
    function get_csrf_token() {
        fetch('/get_csrf_token/')
            .then(response => response.json())
            .then(data => {
                document.getElementById('csrf_token').value = data.csrfToken;
                csrfToken = data.csrfToken;
            })
            .catch(error => console.error('Error fetching CSRF token:', error));
    }

// Handle the OAuth login button click
document.querySelector('.intra').addEventListener('click', function(event){
    event.preventDefault(); // Prevent the default form submission
    console.log('Login button clicked');
    console.log('send to backend for authorization code...');
    fetch('/oauth/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
        }
    })
    .then(response => response.json()) // Parse the response as JSON
    .then(data => {

        // console.log('data = ', data)
        console.log('data =======> ', data.full_authoriztion_url)
        if (data.status == 'success') {
            window.location.href = data.full_authoriztion_url;
        } else {
            console.log('Error fetching authorization URL');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Handle the OAuth callback (after successful login)
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
console.log('URL Params:', urlParams.toString()); // Log the query string
console.log('Authorization code:', code);
console.log('window.location.search:', window.location.search);

if (code) 
{
    console.log('Authorization code detected, sending it to backend');
    const csrfToken2 = document.querySelector('[name=csrfmiddlewaretoken]');
    if (csrfToken2) {
        console.log('CSRF token found:', csrfToken2.value);
    }
    else {
        console.error('CSRF token not found!');
    }
    console.log('------- CSRF token found:', csrfToken2.value);
    fetch('/oauth/callback/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'X-CSRFToken2': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'X-CSRFToken2': document.getElementById('csrf_token').value,
        },
        body: JSON.stringify({ code: code })
    })
    .then(response => response.json())
    .then(data => {
        console.log('status ==> ', data.status )
        if (data.status == 'success') {
            // Hide the login part and show the home part
            document.getElementById('main').style.display = 'block';
            document.getElementById("nav").style.display = "flex";
            document.getElementById('login-parent').style.display = 'none';
            document.getElementById('profile-part').style.display = 'none';
            // document.getElementById('user-name').textContent = data.data.username;
            // document.getElementById('full-name').textContent = data.data.fullname;
            // document.getElementById('profile-image').src = data.data.imageProfile
            // console.log('image = ', data.data.imageProfile)
        } else {
            console.log('Error:', data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
});
