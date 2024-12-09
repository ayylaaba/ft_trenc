// export let dataObjectt = null;

import { showLogin } from "./logout.js";
import { displayErrorMsg } from "./login.js";
import { createRequestCards, createSuggestionCard, createFriendCards, friendsFunction,  sendIdToBackend, friendsLoaded } from "./friends.js";
import { navigateTo } from "../script.js";

export const get_csrf_token = async () => {
    const response = await fetch('/get_csrf_token/');
    const jsonResponse = await response.json();
    document.querySelector('.csrf_token').value = jsonResponse.csrfToken;
    // console.log("TOKENNN: " + jsonResponse.csrfToken);
    return jsonResponse.csrfToken;
}

const registerForm = document.querySelector("#register-form");
const usernameError = document.getElementById("username-error");
const passwordError = document.querySelector("#password-error");
const emailError = document.querySelector("#email-error");
const firstName = document.querySelector("#first-name");
const lastName = document.querySelector("#last-name");

const registrationFunction = async (event) => {
    event.preventDefault();
    const token =  await get_csrf_token();
    const formData = new FormData(registerForm);
    const response = await fetch('/register/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': token
        },
        body: formData
    });
    const jsonResponse = await response.json();
    if (response.ok) {
        if (jsonResponse.status === "success") {
            showLogin();
        }
        return jsonResponse;
    }
    else {
        // in case of error.
        const existingErrors = document.querySelectorAll(".error");
        existingErrors.forEach(error => {
            error.remove();
        });
        if (jsonResponse.error.email) {
            alert("email")
            displayErrorMsg(jsonResponse.error.email, emailError, "array");
        }
        else if (jsonResponse.error.username) {
            alert("username")
            displayErrorMsg(jsonResponse.error.username, usernameError, "array")
        }
        else if (jsonResponse.status === "failed") { // intra
            alert(`failed with: ${jsonResponse.error}`)
            displayErrorMsg(jsonResponse.error, usernameError, "");
        }
        else if (jsonResponse.error.firstname) {
            alert("firstname")
            displayErrorMsg(jsonResponse.error.firstname, firstName, "array")
        }
        else if (jsonResponse.error.lastname) {
            alert("lastname")
            displayErrorMsg(jsonResponse.error.lastname, lastName, "array")
        }
        else if (jsonResponse.error.password) {
            alert("password")
            displayErrorMsg(jsonResponse.error.password, passwordError, "array");
        }
        // console.log("Register Error: ", jsonResponse.error);
    }
}

registerForm.addEventListener("submit", registrationFunction);

export const showHome = async (dataObj)=> {
    // navigateTo("current");
    document.querySelector("#full-container").style.display = "flex";
    document.querySelector("#login-parent").style.display = "none";
    document.querySelector("#nav").style.display = "flex";
    document.querySelector("#main").style.display = "flex";
    document.querySelector("#us h3").innerHTML = `${dataObj.username}`;
    document.querySelector("#welcome > h1").innerHTML = `Welcome ${dataObj.firstname} ${dataObj.lastname}!`;
}
