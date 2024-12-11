export const settingButton = document.querySelector("#setting");
export const settingPage = document.querySelector("#setting-part");

import { profileId } from "./profile.js";
import { main } from "./home.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";
import { navigateTo } from "../script.js";

export const settingFunction = (dataObj) => {
    profileId.style.display = "none";
    main.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    settingPage.style.display = "block";
    // document.querySelector("#online-friends").style.display = "none";
    // alert(dataObj);
    if (dataObj != undefined)
    {
        document.querySelector("#first-container h5").innerHTML = `${dataObj.firstname} ${dataObj.lastname}`;
        if (dataObj.imageProfile != undefined) {
            document.querySelector("#setting-pic").style.backgroundImage = `url(${dataObj.imageProfile})`;
        }
        if (dataObj.email != undefined) {
            // alert("dont enter.");
            document.querySelector("#first-container p").innerHTML = `${dataObj.email}`;
        }
    }
}

// settingButton.addEventListener("click", settingFunction);

// nav manipulation style.
const settingNavBtns = document.querySelectorAll(".setting-nav-btn");
settingNavBtns[0].addEventListener("click", ()=> {
    settingNavBtns.forEach ((settingNavBtn)=> {
        settingNavBtn.classList.remove('styled-nav-btn');
    });
    settingNavBtns[0].classList.add('styled-nav-btn');
    navigateTo("/setting/profile");
})
settingNavBtns[1].addEventListener("click", ()=> {
    settingNavBtns.forEach ((settingNavBtn)=> {
        settingNavBtn.classList.remove('styled-nav-btn');
    });
    settingNavBtns[1].classList.add('styled-nav-btn');
    navigateTo("/setting/security");
})

// settingNavBtn[2].addEventListener("click", ()=> {
//     profileSetting.style.display = "none";
//     general.style.display = "flex";
//     logSec.style.display = "none";
// })

// upload button logic;

const uploadBtn = document.querySelector("#change-img");
const fileInput = document.querySelector("#file-input");

uploadBtn.addEventListener("click", ()=> {
    fileInput.click();
})

