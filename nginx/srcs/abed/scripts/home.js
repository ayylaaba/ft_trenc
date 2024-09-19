export const homeButton = document.querySelector("#home");
export const main = document.querySelector("#main");

import { profileId } from "./profile.js";
import {settingPage} from "./setting.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart, friendsFunction, suggestionsFunction } from "./friends.js";

let friendsArray;
export const mainFunction = async () => {
    friendsArray = await suggestionsFunction();
    profileId.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    main.style.display = "flex";
    document.querySelector("#full-container").style.display = "flex";
    // document.querySelector("#online-friends").style.display = "flex";
}

// homeButton.addEventListener("click", mainFunction);

const searchInput = document.querySelector("#search-bar input");

let flag = 0;
let matchBlock = document.createElement("div");
const homeNav = document.querySelector("#home-navbar");

const lookForUsers = ()=> {
    document.querySelectorAll(".match-element").forEach(el => {
        el.remove();
    })
    if (searchInput.value === "") {
        matchBlock.remove();
        flag = 0;
    }
    const data = friendsArray;
    friendsArray.forEach(element => {
        if (element.username.includes(searchInput.value.toLowerCase()) && searchInput.value != "") {
            if (flag === 0) {
                matchBlock.classList.add("match-block");
                document.querySelector("#main").append(matchBlock);
                homeNav.insertAdjacentElement("afterend", matchBlock);
                flag++;
            }
            const firstIndex = element.username.indexOf(searchInput.value);
            const lastIndex = firstIndex + searchInput.value.length;
            const matchElement = document.createElement("div");
            matchElement.classList.add("match-element");
            const usernameImage = document.createElement("div");
            usernameImage.style.backgroundImage = `url(${element.imageProfile})`;
            usernameImage.style.backgroundSize = "cover";
            usernameImage.style.width = "44px";
            usernameImage.style.height = "44px";
            usernameImage.style.border = "white 1px solid";
            usernameImage.style.borderRadius = "50%";
            const usenameFound = document.createElement("div");
            const user = element.username;
            usenameFound.innerHTML = `${user.substring(0, firstIndex)}<span style="font-weight: bold; color: white;">${user.substring(firstIndex, lastIndex)}</span>${user.substring(lastIndex)}`;
            matchElement.append(usernameImage, usenameFound);
            matchBlock.append(matchElement);
        }
    });
    // console.log(data);
}

searchInput.addEventListener("input", lookForUsers);