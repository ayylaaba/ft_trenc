export const notifBtn = document.querySelector("#notif");
const notifButton = document.querySelector("#notif .btn");
let parentDiv = null;

import { requestsFunction, friendsFunction, sendIdToBackend } from "./friends.js";

const profBtn = document.querySelector("#profile-pict .btn");

export const notificationFunction = async (username, image) => {
    console.log("username: ", username);
    console.log("image: ", image);
    // first thing is to display the parent block which will hold all the notification elementsl;
    const notifications = document.querySelector("#notifications");
    const logoutPhone = document.querySelector(".logout-phone");
    if (!notifications) {
        if (logoutPhone) {
            logoutPhone.remove();
            profBtn.style.backgroundColor = "#2f1e65";
        }
        parentDiv = document.createElement("div");
        parentDiv.id = "notifications";
        notifButton.style.backgroundColor = "#522d91";
        // notifBtn.style.boxShadow = "0px 0px 8px 2px rgba(83, 83, 83, 0.473)";
        const homeNavbar = document.querySelector("#home-navbar");
        homeNavbar.insertAdjacentElement("afterend", parentDiv);
        let htmlCode;
        let trimmedHTML = document.createElement("div");
        if (username != undefined && image != undefined) {
            htmlCode = `
                <img src="${image}" alt="user image" class="request-notif">
                <h3>${username}</h3>
                <button class="btn btn-sm acc-req">accept</button>
                <button class="btn btn-sm ref-req">refuse</button>
            `;
            trimmedHTML.classList.add("req-notif"); // style in css;
        } else {
            htmlCode = `<h3>Notifications are clear</h3>`;
            trimmedHTML.classList.add("clear-notif"); //style clear notification in css;
        }
        trimmedHTML.innerHTML = htmlCode.trim();
        parentDiv.append(trimmedHTML);
    } else {
        notifButton.style.backgroundColor = "#2f1e65";
        notifications.remove();
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const isNotified = localStorage.getItem("notifications") === "true";
    if (isNotified)
    {
        const bellNotif = document.createElement("div");
        bellNotif.id = "bell-notif";
        notifBtn.append(bellNotif);
    }
    notifBtn.addEventListener("click", async (event) => { // click event listener;
        event.stopPropagation();
        if (isNotified)
        {
            localStorage.setItem("notifications", false);
            const bellNotif = document.querySelector("#bell-notif");
            if (bellNotif)
                bellNotif.remove();
        }
        const requests = await requestsFunction();
        console.log("requests: ", requests);
        if (!requests.length)
        {
            notificationFunction();
        }
        for (let i = 0; i < requests.length; i++) {
            notificationFunction(requests[i].from_user.username, requests[i].from_user.imageProfile);
        }
        const acceptBtnsNotifListen = document.querySelectorAll("#notifications .acc-req");
        for(let i = 0; i < acceptBtnsNotifListen.length; i++) {
            acceptBtnsNotifListen[i].addEventListener("click", ()=> sendIdToBackend(requests[i].id, "accept"));
        }
        const refuseBtnsNotifListen = document.querySelectorAll("#notifications .ref-req");
        for(let i = 0; i < refuseBtnsNotifListen.length; i++) {
            refuseBtnsNotifListen[i].addEventListener("click", ()=> sendIdToBackend(requests[i].id, "refuse"));
        }
    });
})
