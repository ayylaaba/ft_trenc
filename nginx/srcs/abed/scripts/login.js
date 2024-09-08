
const singUp = document.querySelector("#signup");
const singIn = document.querySelector("#signin")
const one = document.querySelector("#one");
const two = document.querySelector("#two");
const three = document.querySelector("#three");

function singUp_function(event)
{
    event.preventDefault();
    one.style.display = "none";
    three.style.display = "block";
}

function singIn_function(event)
{
    event.preventDefault();
    // add class so the transition can work probably;
    three.style.display = "none";
    one.style.display = "block";
}

singUp.addEventListener("click", singUp_function);
singIn.addEventListener("click", singIn_function);

import { get_csrf_token, showHome } from "./register.js";

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector("#login-form");

    const loginFunction = async (event) => {
        event.preventDefault();
        const token =  await get_csrf_token();
        try {
            const formData = new FormData(loginForm);
            const response = await fetch('/login/', {
                method: 'POST',
                credentials: 'include',  // Ensure credentials are sent with the request
                headers: {
                    'X-CSRFToken': token,
                },
                body: formData
            });
            if (response.ok) {
                const jsonResponse = await response.json();
                if (jsonResponse.status === "success") {
                    showHome(jsonResponse.data);
                }
                return jsonResponse.data;
            }
        }
        catch(err) {
            console.error(err);
        }
    }
    loginForm.addEventListener("submit", loginFunction);
});