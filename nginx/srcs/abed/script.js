// let username = '';
// let defaultName = username || 'Stranger';
// console.log(defaultName); // Prints: Stranger

import { homeButton, mainFunction } from "./scripts/home.js";
import { profileButton, profileFunction } from "./scripts/profile.js";
import { friendsBtn, friendsFunc } from "./scripts/friends.js";
import { rankBtn, rankFunct } from "./scripts/rank.js";
import { chatButton, chatFunction } from "./scripts/chat.js";
import { settingButton, settingFunction} from "./scripts/setting.js";
import { logoutBtn, showLogin } from "./scripts/logout.js";
import { dataObject } from "./scripts/login.js";

const newDataFunc = async ()=> {
    const response = await fetch('/user/get_user_info/');
    if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.status === "success") {
            return jsonResponse.data;
        }
    }
}

const loginBtn = document.querySelector(".login-btn");

const errorPage = document.querySelector("#error")

const showError = ()=> {
    errorPage.style.display = "block";
    document.querySelector("#login-parent").style.display = "none";
    document.querySelector("#nav").style.display = "none";
    document.querySelector("#main").style.display = "none";
    document.querySelector("#profile-part").style.display = "none";
    document.querySelector("#chat-part").style.display = "none";
    document.querySelector("#setting-part").style.display = "none";
    document.querySelector("#friends-part").style.display = "none";
    document.querySelector("#rank-part").style.display = "none";
}

const sideBtns = document.querySelectorAll(".nav-button");

export const reloadFunction = (jsonData)=> {
    document.querySelector("#full-container").style.display = "flex";
    sideBtns.forEach (sideBtn => {sideBtn.classList.remove('link')});
    if (location.pathname === "/home" || location.pathname === "/") {
        sideBtns[0].classList.add('link');
        mainFunction(jsonData);
    } else if (location.pathname === "/profile") {
        sideBtns[1].classList.add('link');
        profileFunction(jsonData);
    } else if (location.pathname === "/friends") {
        sideBtns[2].classList.add('link');
        friendsFunc(jsonData);
    } else if (location.pathname === "/rank") {
        sideBtns[3].classList.add('link');
        rankFunct(jsonData);
    } else if (location.pathname === "/chat") {
        sideBtns[4].classList.add('link');
        chatFunction(jsonData);
    } else if (location.pathname === "/setting") {
        sideBtns[5].classList.add('link');
        settingFunction(jsonData);
    } else {
        showError() // need to implemet better front.
    }
}

export const navigateTo = async (path) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (path != "forback" && path != "current")
    {
        history.pushState(null, null, path);
    }
    else {
        console.log("enter here please..");
        // when the user reload the page or navigate backword or forward;
    }
    
    document.querySelector("#nav").style.display = "flex";
    document.querySelector("#login-parent").style.display = "none";
    if (isLoggedIn) {
        const updateDataObj = await newDataFunc();
        reloadFunction(updateDataObj);
    } else {
        showLogin();
    }
}


homeButton.addEventListener("click", () => {
    navigateTo("/home");
});
profileButton.addEventListener("click", () => {
    navigateTo("/profile");
});
friendsBtn.addEventListener("click", () => {
    navigateTo("/friends");
});
rankBtn.addEventListener("click", () => {
    navigateTo("/rank");
});
chatButton.addEventListener("click", () => {
    navigateTo("/chat");
});
settingButton.addEventListener("click", () => {
    navigateTo("/setting");
});
logoutBtn.addEventListener("click", ()=> {
    navigateTo("/");
});
loginBtn.addEventListener("click", ()=> {
    navigateTo("/home");
});

window.addEventListener('popstate', ()=> navigateTo("forback"));
document.addEventListener("DOMContentLoaded", () => navigateTo("current"));

// add styled class to the clicked button (.nav-button) in #nav

// sideBtns[0].classList.add('link');

// sideBtns.forEach ((sideBtn)=> {
//     sideBtn.addEventListener("click", (event)=> {
//         sideBtns.forEach (sideBtn => {sideBtn.classList.remove('link')});
//         sideBtn.classList.add('link');
//     })
// });
