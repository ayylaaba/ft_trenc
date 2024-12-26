import { reloadFunction } from "../script.js";
import { get_csrf_token } from "./register.js";
import { clearInputs } from "./update.js";

const inputs = document.querySelectorAll("#password-form input");

export const profileAlert2 = (status, jsonData)=> {
    if (status === "success") {
        reloadFunction(jsonData);
        document.querySelector("#update-alert2").style.display = "none";
    } else{
        document.querySelector("#passwordHelpBlock").style.display = "none";
        document.querySelector("#update-alert-failed2").style.display = "none";
    }
}

const updatePasswordForm = document.querySelector("#password-form");

const updatePassword = async (event)=> {
    event.preventDefault();
    const formData = new FormData(updatePasswordForm);
    const token = await get_csrf_token();
    const response = await fetch('/user/ChangePass/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': token,
        },
        body: formData
    });
    const jsonResponse = await response.json();
    if (response.ok) {
        if (jsonResponse.status === "success") {
            document.querySelector("#passwordHelpBlock").style.display = "none";
            document.querySelector("#update-alert2").style.display = "block";
            clearInputs(inputs);
            setTimeout(() => profileAlert2("success", jsonResponse.data), 3000);
        }
        return jsonResponse.data;
    } else {
        const failedAlert = document.querySelector("#update-alert-failed2");
        const failedPassword = document.querySelector("#failed-pass");
        failedPassword.innerHTML = `${jsonResponse.error}`;
        failedAlert.style.display = "block";
        setTimeout(() => profileAlert2("failed", jsonResponse.error), 3000);
    }
};

updatePasswordForm.addEventListener("submit", updatePassword);

document.querySelector("#delete-btn").addEventListener("click", ()=> {
    clearInputs(inputs);
});