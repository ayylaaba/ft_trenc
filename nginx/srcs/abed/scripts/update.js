import { get_csrf_token } from "./register.js";

document.addEventListener("DOMContentLoaded", ()=> {
    const updateForm = document.querySelector("#update-form");
    const update = async (event)=> {
        event.preventDefault();
        const formData = new FormData(updateForm);
        const token = await get_csrf_token();
        const response = await fetch('/user/update/', {
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
                showHome2(jsonResponse.data);
            }
            return jsonResponse.data;
        }
    };
    updateForm.addEventListener("submit", update);
})

const showHome2 = (dataObj)=> {
    document.querySelector("#login-parent").style.display = "none";
    document.querySelector("#nav").style.display = "flex";
    document.querySelector("#main").style.display = "block";
    document.querySelector("#welcome > h1").innerHTML = `Welcome ${dataObj.firstname} ${dataObj.lastname}!`;
}