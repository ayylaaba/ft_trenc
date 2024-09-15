export const homeButton = document.querySelector("#home");
export const main = document.querySelector("#main");

import { profileId } from "./profile.js";
import {settingPage} from "./setting.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

export const mainFunction = (dataObj) => {
    profileId.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    main.style.display = "flex";
    document.querySelector("#full-container").style.display = "flex";
    document.querySelector("#online-friends").style.display = "flex";
}

// homeButton.addEventListener("click", mainFunction);