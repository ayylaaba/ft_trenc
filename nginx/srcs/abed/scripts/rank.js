export const rankBtn = document.querySelector("#rank");
export const rankPart = document.querySelector("#rank-part");

import { main } from "./home.js";
import { settingPage } from "./setting.js";
import { chatPage } from "./chat.js";
import { profileId } from "./profile.js";
import { friendsPart } from "./friends.js";

const getRank = (data) => {
    console.log("data rank: ", data);
    const rank = `
        <h3 style="text-align: center;">LEADERBOARD</h3>
        <div id="top-ranked">
            <div id="first-three">
                <div id="gold">
                    <p style="margin: 0">${data.data.length > 0 ? data.data[0].username : ""}</p>
                    <div id="first-user-pic" style="background-image: url(${data.data.length > 0 ? data.data[0].imageProfile : ""})">
                        <i class="fa-brands fa-pagelines leaf"></i>
                        <i class="fa-solid fa-medal"></i>
                    </div>
                    <p class="fw-lighter">Score: ${data.data.length > 0 ? data.data[0].score : ""}</p>
                </div>
                <div id="silver">
                    <p style="margin: 0">${data.data.length > 1 ? data.data[1].username : ""}</p>
                    <div id="second-user-pic" style="background-image: url(${data.data.length > 1 ? data.data[1].imageProfile : ""})">
                        <i class="fa-solid fa-medal"></i>
                    </div>
                    <p class="fw-lighter">Score: ${data.data.length > 1 ? data.data[1].score : ""}</p>
                </div>
                <div id="bronze">
                    <p style="margin: 0">${data.data.length > 2 ? data.data[2].username : ""}</p>
                    <div id="third-user-pic" style="background-image: url(${data.data.length > 2 ? data.data[2].imageProfile : ""})">
                        <i class="fa-solid fa-medal"></i>
                    </div>
                    <p class="fw-lighter">Score: ${data.data.length > 2 ? data.data[2].score : ""}</p>
                </div>
            </div>
        </div>
        <div id="the-rest">
            <div id="first-col">
            ${data.data.map((element, i) => {
                if (i > 2) {
                    const player = `
                        <div class="player-rank">
                            <h5>${i + 1}th</h5>
                            <div class="player-pic" style="background-image: url(${element.imageProfile})"></div>
                            <h5 class="usernamee">${element.username}</h5>
                            <h4>${element.score}</h4>
                        </div>
                    `;
                    if (i % 2 !== 0) {
                        return player.trim();
                    }
                }
            }).join("")}
            </div>
            <div id="second-col">
                ${data.data.map((element, i) => {
                    if (i > 2) {
                        const player = `
                            <div class="player-rank">
                                <h5>${i + 1}th</h5>
                                <div class="player-pic" style="background-image: url(${element.imageProfile})"></div>
                                <h5 class="usernamee">${element.username}</h5>
                                <h4>${element.score}</h4>
                            </div>
                        `;
                        if (i % 2 === 0) {
                            return player.trim();
                        }
                    }
                }).join("")}
            </div>
        </div>
        <div id="the-rest2">
            ${data.data.map((element, i) => {
                if (i > 2) {
                    const player = `
                        <div class="player-rank">
                            <h5>${i + 1}th</h5>
                            <div class="player-pic" style="background-image: url(${element.imageProfile})"></div>
                            <h5 class="usernamee">${element.username}</h5>
                            <h4>${element.score}</h4>
                        </div>
                    `;
                    return player.trim();
                }
            }).join("")}
        </div>
    `;
    const rankPart = document.querySelector("#rank-part");
    const all = document.createElement("div");
    all.innerHTML = rank.trim();
    rankPart.append(all);
}

export const rankFunct = async () => {
    main.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    profileId.style.display = "none";
    friendsPart.style.display = "none";
    rankPart.style.display = "flex";

    const topRanked = document.querySelector("#top-ranked");
    if (topRanked) {
        document.querySelector("#rank-part").innerHTML = "";
    }
    const response = await fetch("/users_rank/");
    if (response.ok) {
        const jsonData = await response.json();
        if (jsonData.status === "success") {
            console.log("data of rank: ", jsonData);
            getRank(jsonData);
        }
    }
}

// rankBtn.addEventListener("click", rankFunct);