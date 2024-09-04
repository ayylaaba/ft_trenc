const homeButton = document.querySelector("#home");
export const main = document.querySelector("#main");

import { profileId } from "./profile.js";
import {settingPage} from "./setting.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

const mainFunction = () => {
    profileId.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    main.style.display = "block";
    // main.style.transition = "all 1s";
    // document.querySelector("#profile-img").style.display = "block";
}

homeButton.addEventListener("click", mainFunction);