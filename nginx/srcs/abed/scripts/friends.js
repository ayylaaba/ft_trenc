const friendsBtn = document.querySelector("#friends");
export const friendsPart = document.querySelector("#friends-part");

import { main } from "./home.js";
import { settingPage } from "./setting.js";
import { chatPage } from "./chat.js";
import { profileId } from "./profile.js"; 
import { rankPart } from "./rank.js";

const friendsFunc = () => {
    main.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    profileId.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "block";
}

friendsBtn.addEventListener("click", friendsFunc);

// nav manipulation style.
const frdNavBtns = document.querySelectorAll(".frd-nav-btn");
frdNavBtns[0].classList.add('styled-nav-btn');

frdNavBtns.forEach ((frdNavBtn)=> {
    frdNavBtn.addEventListener("click", (event)=> {
        frdNavBtns.forEach (frdNavBtn => {frdNavBtn.classList.remove('styled-nav-btn')});
        frdNavBtn.classList.add('styled-nav-btn');
    })
});

const myFriends = document.querySelector("#my-friends");
const requestsDiv = document.querySelector("#requests");
const suggestions = document.querySelector("#suggestions");

frdNavBtns[0].addEventListener("click", (event)=> {
    myFriends.style.display = "flex";
    suggestions.style.display = "none";
    requestsDiv.style.display = "none";
})

frdNavBtns[1].addEventListener("click", ()=> {
    myFriends.style.display = "none";
    suggestions.style.display = "none";
    requestsDiv.style.display = "flex";
})

frdNavBtns[2].addEventListener("click", ()=> {
    myFriends.style.display = "none";
    suggestions.style.display = "flex";
    requestsDiv.style.display = "none";
})