const profileButton = document.querySelector("#profile");
export const profileId = document.querySelector("#profile-part");

import { main } from "./home.js";
import {settingPage} from "./setting.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

const profile = () => {
    main.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    profileId.style.display = "flex";
    // document.querySelector("#profile-img").style.display = "none";
}

profileButton.addEventListener("click", profile);