// let username = '';
// let defaultName = username || 'Stranger';
// console.log(defaultName); // Prints: Stranger

import { friendsPart, friendsBtn, friendsFunc, createRequestCards, createSuggestionCard, createFriendCards, friendsFunction,  sendIdToBackend, requestsFunction, suggestionsFunction } from "./scripts/friends.js";
import { homeButton, mainFunction } from "./scripts/home.js";
import { profileButton, profileFunction, profileId } from "./scripts/profile.js";
import { rankBtn, rankFunct, rankPart } from "./scripts/rank.js";
import { chatButton, chatFunction, chatPage } from "./scripts/chat.js";
import { settingButton, settingFunction, settingPage} from "./scripts/setting.js";
import { logoutBtn, showLogin } from "./scripts/logout.js";
import { dataObject } from "./scripts/login.js";

export const newDataFunc = async ()=> {
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
    errorPage.style.display = "flex";
    errorPage.classList.add("error_style");
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
const frdNavBtns = document.querySelectorAll(".frd-nav-btn");
const settingNavBtns = document.querySelectorAll(".setting-nav-btn");

const myFriends = document.querySelector("#my-friends");
const requestsDiv = document.querySelector("#requests");
const suggestions = document.querySelector("#suggestions");

const clearLinks = ()=> {
    sideBtns.forEach(sideBtn => {
        sideBtn.classList.remove('link');
    });
}

const profileSetting = document.querySelector("#profile-setting");
const logSec = document.querySelector("#log-sec");

export const reloadFunction = async () => {
    errorPage.style.display = "none";
    document.querySelector("#full-container").style.display = "flex";
    clearLinks();
    frdNavBtns.forEach ((frdNavBtn)=> {
        frdNavBtn.classList.remove('styled-nav-btn');
    });
    settingNavBtns.forEach ((settingNavBtn)=> {
        settingNavBtn.classList.remove('styled-nav-btn');
    });
    if (location.pathname === "/home" || location.pathname === "/home/" || location.pathname === "/") {
        sideBtns[0].classList.add('link');
        await mainFunction();
    } else if (location.pathname === "/profile" || location.pathname === "/profile/") {
        const updateDataObj = await newDataFunc();
        sideBtns[1].classList.add('link');
        profileFunction(updateDataObj);
    } else if (location.pathname === "/friends" || location.pathname === "/friends/") {
        sideBtns[2].classList.add('link');
        frdNavBtns[0].classList.add('styled-nav-btn');
        await friendsFunc();
    } else if (location.pathname === "/friends/requests" || location.pathname === "/friends/requests/") {
        sideBtns[2].classList.add('link');
        frdNavBtns[1].classList.add('styled-nav-btn');
        friendsPart.style.display = "flex";
        requestsDiv.style.display = "flex";
        await requestsFunction();
    } else if (location.pathname === "/friends/suggestions" || location.pathname === "/friends/suggestions/") {
        sideBtns[2].classList.add('link');
        frdNavBtns[2].classList.add('styled-nav-btn');
        friendsPart.style.display = "flex";
        suggestions.style.display = "flex";
        await suggestionsFunction();
    } else if (location.pathname === "/rank" || location.pathname === "/rank/") {
        sideBtns[3].classList.add('link');
        await rankFunct();
    } else if (location.pathname === "/chat" || location.pathname === "/chat/") {
        sideBtns[4].classList.add('link');
        await chatFunction();
    } else if (location.pathname === "/setting/profile" || location.pathname === "/setting/profile/" || location.pathname === "/setting" || location.pathname === "/setting/") {
        settingNavBtns[0].classList.add('styled-nav-btn');
        const updateDataObj = await newDataFunc();
        sideBtns[5].classList.add('link');
        settingFunction(updateDataObj);
        profileSetting.style.display = "flex";
        logSec.style.display = "none";
    } else if (location.pathname === "/setting/security" || location.pathname === "/setting/security/") {
        settingNavBtns[1].classList.add('styled-nav-btn');
        const updateDataObj = await newDataFunc();
        sideBtns[5].classList.add('link');
        settingFunction(updateDataObj);
        profileSetting.style.display = "none";
        logSec.style.display = "flex";
    }
    else {
        showError(); // Display an error message.
    }
};

export const showLinkStyle = () => {
    if (location.pathname === "/home" || location.pathname === "/") {
        clearLinks();
        sideBtns[0].classList.add('link');
    } else if (location.pathname === "/profile") {
        clearLinks();
        sideBtns[1].classList.add('link');
    } else if (location.pathname === "/friends") {
        clearLinks();
        sideBtns[2].classList.add('link');
    } else if (location.pathname === "/rank") {
        clearLinks();
        sideBtns[3].classList.add('link');
    } else if (location.pathname === "/chat") {
        clearLinks();
        sideBtns[4].classList.add('link');
    } else if (location.pathname === "/setting") {
        clearLinks();
        sideBtns[5].classList.add('link');
    }
}
export const main = document.querySelector("#main");

const hideAll = () => {
    profileId.style.display = "none";
    profileSetting.style.display = "none";
    logSec.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    myFriends.style.display = "none";
    suggestions.style.display = "none";
    requestsDiv.style.display = "none";
    main.style.display = "none";
    document.querySelector("#full-container").style.display = "flex";
}

export const navigateTo = async (path) => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (path != "forback" && path != "current")
    {
        history.pushState(null, null, path);
    } else {
        console.log("enter here please..");
    }
    document.querySelector("#nav").style.display = "flex";
    document.querySelector("#login-parent").style.display = "none";
    if (isLoggedIn) {
        const loadingSpinner = document.querySelector("#loading-spinner");
        loadingSpinner.style.display = "block";
        hideAll();
        showLinkStyle();
        await new Promise(resolve => setTimeout(resolve, 500));
        await reloadFunction();
        loadingSpinner.style.display = "none";
    } else {
        showLogin();
    }
}

const homeLogo = document.querySelector("#icon img");

homeLogo.addEventListener("click", () => { //only when i click the nav button the navigate called;
    navigateTo("/home");
});

homeButton.addEventListener("click", () => { //only when i click the nav button the navigate called;
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
// logoutBtn.addEventListener("click", ()=> {
//     navigateTo("/");
// });
loginBtn.addEventListener("click", ()=> {
    navigateTo("/home");
});

// const onlineColor = document.querySelector(".frd-sug-img i");

import { flag, socketFunction, localStorageTracking, bellNotif } from "./scripts/socket.js";

window.addEventListener('popstate', ()=> navigateTo("forback")); // this is to check navigation backward or forward;

document.addEventListener("DOMContentLoaded", () => { // this is on reload page (refresh);
    const messageNotification = localStorage.getItem("messageNotif");
    if (messageNotification === "true") {
        const chatIcone = document.querySelector("#chat");
        chatIcone.append(bellNotif);
        localStorageTracking("messageNotif", bellNotif, chatIcone);
    }
    navigateTo("current");
    if (!flag) {
        socketFunction();
    }
});

// add styled class to the clicked button (.nav-button) in #nav

// sideBtns[0].classList.add('link');

// sideBtns.forEach ((sideBtn)=> {
//     sideBtn.addEventListener("click", (event)=> {
//         sideBtns.forEach (sideBtn => {sideBtn.classList.remove('link')});
//         sideBtn.classList.add('link');
//     })
// });
