export const get_csrf_token = async () => {
    const response = await fetch('/get_csrf_token/');
    const jsonResponse = await response.json();
    document.getElementById('csrf_token').value = jsonResponse.csrfToken;
    // console.log("TOKENNN: " + jsonResponse.csrfToken);
    return jsonResponse.csrfToken;
}

document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch and set the CSRF token

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
                console.log("Json response: " + jsonResponse.data.username);
                if (jsonResponse.status === "success") {
                    showHome(jsonResponse.data);
                }
                return jsonResponse;
            }
        }
        catch(err) {
            console.error(err);
        }
    }
    registerForm.addEventListener("submit", registrationFunction);
});

export const showHome = (dataObj)=> {
    document.querySelector("#login-parent").style.display = "none";
    document.querySelector("#nav").style.display = "flex";
    document.querySelector("#main").style.display = "block";
    document.querySelector("#us h3").innerHTML = `${dataObj.username}`;
    document.querySelector("#welcome > h1").innerHTML = `Welcome ${dataObj.firstname} ${dataObj.lastname}!`;
}