export const profileButton = document.querySelector("#profile");
export const profileId = document.querySelector("#profile-part");

import { main } from "./home.js";
import {settingPage} from "./setting.js";
import { chatPage } from "./chat.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

const recordGame = (matchData) => {
    const gameContainer = document.getElementById("games-container");
    const gameRecordHTML = `
        <div class="game-record">
            <h2 id="win-lost" style="${matchData.result === "won" ? "color: #78dc78" : "color: red"};">
                ${matchData.result}
            </h2>
            <div id="match">
                <div id="me">
                    <div style="background-image: url(${matchData.user.imageProfile}); border-radius: 50%; background-size: cover; height: 64px; width: 64px; border: 2px solid aqua; background-position: center;"></div>
                    <p style="margin: 0; color: #d7d7d7">${matchData.user.username}</p>
                </div>
                <div id="vs" style="margin: 0 15px;">
                    <i class="fa-solid fa-xmark"></i>
                </div>
                <div id="enemy">
                    <div style="background-image: url(${matchData.opponent.imageProfile}); border-radius: 50%; background-size: cover; height: 64px; width: 64px; border: 2px solid aqua; background-position: center;"></div>
                    <p style="margin: 0; color: #d7d7d7">${matchData.opponent.username}</p>
                </div>
            </div>
            <h2 id="score-pts">${matchData.Type}</h2>
        </div>
    `;
    // Convert the HTML string to DOM elements
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = gameRecordHTML;
    gameContainer.append(tempDiv);
};

export const profileFunction = async (dataObj) => {
    console.log("pro data: ", dataObj)
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
        if (dataObj.level != undefined) {
            //1 /10 = 0 + 1 % 10 = 1 0.1
            let curr_level = parseInt(dataObj.level / 10);
            let to_next_level = (dataObj.level % 10) * 10;
            let next_level = parseInt(curr_level + 1);
            document.querySelector("#level-id").innerHTML = `${curr_level} - ${to_next_level}%`;
            document.querySelector("#next-level-id").innerHTML = `${next_level}`;
            document.querySelector("#progress-profile").style.width = `${to_next_level}%`;
        }
        if (dataObj.win != undefined) {
            document.querySelector("#profile-wins").innerHTML = `Wins: ${dataObj.win}`;
        } if (dataObj.loss != undefined) {
            document.querySelector("#profile-loses").innerHTML = `Loses: ${dataObj.loss}`;
        } if (dataObj.score != undefined) {
            document.querySelector("#profile-score").innerHTML = `${dataObj.score}`;
        }
        document.querySelector("#welcome > h1").innerHTML = `Welcome ${dataObj.firstname} ${dataObj.lastname}!`;
    }
    const gameContainer = document.querySelector("#games-container");
    gameContainer.innerHTML = "";
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