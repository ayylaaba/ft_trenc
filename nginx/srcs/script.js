let csrfToken;
document.addEventListener('DOMContentLoaded', function() {
// Fetch and set the CSRF token
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

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    fetch('/login/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': document.getElementById('csrf_token').value,
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('data.status     :     ', data.status);
        if (data.status === 'success') {
            document.getElementById('Home_Part').style.display = 'block';
            document.getElementById('login-register').style.display = 'none';
            document.getElementById('register-part').style.display = 'none';
            document.getElementById('profile').style.display = 'none';
            console.log('Login check --> username :', data.user.username);
            console.log('Login check --> firstname :', data.user.firstname);
            document.getElementById('user-name').innerHTML = data.user.username ;
            document.getElementById('full-name').innerHTML = data.user.fullname;
        } 
        else 
        {
            console.log('Login failed -------------------> message  : ', data.message);
            console.log('Login status -------------------> data     : ', data.status);
            document.getElementById('Invalid_creditienls').innerText = data.message;
            document.getElementById('Invalid_creditienls').style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Handle register form submission
document.getElementById('register-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    fetch('/register/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': document.getElementById('csrf_token').value,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Registration successful. Please log in.');
            document.getElementById('Home_Part').style.display = 'none';
            document.getElementById('login-register').style.display = 'block';
            document.getElementById('register-part').style.display = 'none';
            document.getElementById('profile').style.display = 'none';
        } else {
            // Handle errors and display them
            console.log('Registration failed:', data.errors);
            if (data.error.username) {
                document.getElementById('messageusername').innerText = data.error.username;
                document.getElementById('messageusername').style.display = 'block';
            }
            if (data.error.firstname) {
                document.getElementById('messagefirstname').innerText = data.error.firstname;
                document.getElementById('messagefirstname').style.display = 'block';
            }
            if (data.error.lastname) {
                document.getElementById('messagelastname').innerText = data.error.lastname;
                document.getElementById('messagelastname').style.display = 'block';
            }
            if (data.error.password1) {
                document.getElementById('messagepassword1').innerText = data.error.password1;
                document.getElementById('messagepassword1').style.display = 'block';
            }
            if (data.error.password2) {
                document.getElementById('messagepassword2').innerText = data.error.password2;
                document.getElementById('messagepassword2').style.display = 'block';
            }
            if (data.error.email) {
                document.getElementById('messageemail').innerText = data.error.email;
                document.getElementById('messageemail').style.display = 'block';
            }
            if (data.error.fullname) {
                document.getElementById('messagefullname').innerText = data.error.email;
                document.getElementById('messagefullname').style.display = 'block';
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Show register form and hide login form
document.getElementById('show-register').addEventListener('click', function() {
    document.getElementById('login-register').style.display = 'none';
    document.getElementById('register-part').style.display = 'block';
});

// Show login form and hide register form
document.getElementById('show-login').addEventListener('click', function() {
    document.getElementById('login-register').style.display = 'block';
    document.getElementById('register-part').style.display = 'none';
});

// logout button
document.getElementById('logout').addEventListener('click', function(event) {
    event.preventDefault();
    fetch('/logout/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.getElementById('csrf_token').value,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data){
            document.getElementById('Home_Part').style.display = 'none';
            document.getElementById('login-register').style.display = 'block';
            document.getElementById('register-part').style.display = 'none';
            document.getElementById('profile').style.display = 'none';
        }
        else {
            console.log("No data found");
        }
        })
        .catch(error => {
            console.log("catch error");
            console.error('Error:', error);
    });
});

// View profile and hide other sections
document.getElementById('View_Profile').addEventListener('click', function(event) {
    event.preventDefault();
    console.log('i\'am inside View_Profile js')
    fetch('/user/Profile/', {
        method: 'GET',
        headers: {
            'X-CSRFToken': document.getElementById('csrf_token').value,
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('profile').style.display = 'block';
            document.getElementById('Home_Part').style.display = 'none';
            document.getElementById('login-register').style.display = 'none';
            document.getElementById('register-part').style.display = 'none';
            console.log('---=> user_name    :   ', data.data.username)
            console.log('---=> fullname     :   ', data.data.firstname)
            document.getElementById('user_name').innerHTML = data.data.username;
            document.getElementById('full_name').innerHTML = data.data.fullname;
        } 
        else {
            console.log("No data found", data.status);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

// Back to home button
document.getElementById('back-to-home').addEventListener('click', function() {
    document.getElementById('Home_Part').style.display = 'block';
    document.getElementById('login-register').style.display = 'none';
    document.getElementById('register-part').style.display = 'none';
    document.getElementById('profile').style.display = 'none';
});
});
