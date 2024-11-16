export const profileButton = document.querySelector("#profile");
export const profileId = document.querySelector("#profile-part");

import { main } from "./home.js";
import {settingPage} from "./setting.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

const gameContainer = document.querySelector("#games-container");
const recordGame = (matchData) => {
    const gameContainer = document.getElementById("games-container");
    const gameRecordHTML = `
        <div class="game-record">
            <h2 id="win-lost" style="${matchData.result === "won" ? "color: #78dc78" : "color: red"};">
                ${matchData.result}
            </h2>
            <div id="match">
                <div id="me" style="background-image: url(${matchData.user.imageProfile}); border-radius: 50%;"></div>
                <div id="vs" style="margin: 0 15px;">
                    <i class="fa-solid fa-xmark"></i>
                </div>
                <div id="enemy" style="background-image: url(${matchData.opponent.imageProfile}); border-radius: 50%;"></div>
            </div>
            <h2 id="score-pts">${matchData.Type}</h2>
        </div>
    `;
    // Convert the HTML string to DOM elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = gameRecordHTML;
    // const gameRecordElement = tempDiv.firstElementChild;

    // Append the new game record element to the container
    gameContainer.appendChild(tempDiv);
};

export const profileFunction = async (dataObj) => {
    main.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    profileId.style.display = "flex";
    if (dataObj != undefined)
    {
        if (dataObj.username != undefined) {
            document.querySelector("#us h3").innerHTML = `${dataObj.username}`;
        }
        if (dataObj.imageProfile != undefined) {
            document.querySelector("#user-picture").style.backgroundImage = `url(${dataObj.imageProfile})`;
        }
        document.querySelector("#welcome > h1").innerHTML = `Welcome ${dataObj.firstname} ${dataObj.lastname}!`;
    }
    const response = await fetch("/user/get_match_history");
    if (response.ok) {
        const jsonData = await response.json();
        // if (jsonData.status === "200")
        // {
            console.log("Match History: ", jsonData);
            jsonData.forEach(element => {
                recordGame(element);
            });

        // }
    } else {
        console.error("error with the response...");
    }
}

// profileButton.addEventListener("click", profile);