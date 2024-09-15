export const friendsBtn = document.querySelector("#friends");
export const friendsPart = document.querySelector("#friends-part");

import { main } from "./home.js";
import { settingPage } from "./setting.js";
import { chatPage } from "./chat.js";
import { profileId } from "./profile.js"; 
import { rankPart } from "./rank.js";
import { get_csrf_token } from "./register.js";

export const friendsFunc = (dataObj) => {
    document.querySelector("#online-friends").style.display = "none";
    main.style.display = "none";
    settingPage.style.display = "none";
    chatPage.style.display = "none";
    profileId.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "block";
}

// friendsBtn.addEventListener("click", friendsFunc);

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

const createSuggestionCard = (jsonObject, i) => {
    const element = document.createElement("div");
    element.classList.add("friend-suggestion-card");
    const secondElement = document.createElement("div");
    secondElement.classList.add("frd-sug-header");
    const thirdElement = document.createElement("div");
    thirdElement.classList.add("frd-sug-statistics");
    const forthElement = document.createElement("div");
    forthElement.classList.add("add-del");
    element.append(secondElement, thirdElement, forthElement);

    const imageElement = document.createElement("div");
    imageElement.classList.add("frd-sug-img");
    imageElement.style.backgroundImage = `url(${jsonObject[i].imageProfile})`;
    // imageElement.style.backgroundSize= "cover";

    const sugInfos = document.createElement("div");
    sugInfos.classList.add("frd-sug-infos");
    secondElement.append(imageElement, sugInfos);

    const wins = document.createElement("div");
    wins.classList.add("wins");
    const loses = document.createElement("div");
    loses.classList.add("loses");
    const score = document.createElement("div");
    score.classList.add("score");
    thirdElement.append(wins, loses, score);

    const addBtnDiv = document.createElement("div");
    addBtnDiv.classList.add("add");
    const deleteBtnDiv = document.createElement("div");
    deleteBtnDiv.classList.add("delete");
    forthElement.append(addBtnDiv, deleteBtnDiv);

    const userName = document.createElement("h4");
    userName.classList.add("user-name");
    const pRank = document.createElement("p");
    pRank.innerHTML = "rank: 5";
    sugInfos.append(userName, pRank);

    const winsKey = document.createElement("h4");
    const winsValue = document.createElement("h4");
    winsKey.innerHTML = "Wins:";
    winsValue.classList.add("pts", "value");
    winsValue.innerHTML = "42";
    wins.append(winsKey, winsValue);

    const losesKey = document.createElement("h4");
    losesKey.innerHTML = "Loses:";
    const losesValue = document.createElement("h4");
    losesValue.innerHTML = "0";
    losesValue.classList.add("value");
    loses.append(losesKey, losesValue);

    const scoreKey = document.createElement("h4");
    scoreKey.innerHTML = "Score:";
    const scoreValue = document.createElement("h4");
    scoreValue.innerHTML = "2560";
    scoreValue.classList.add("value");
    score.append(scoreKey, scoreValue);

    const addBtn = document.createElement("button");
    addBtn.innerHTML = "Add";
    addBtn.classList.add("btn", "btn-lg");
    addBtnDiv.append(addBtn);
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Delete";
    deleteBtn.classList.add("btn", "btn-lg");
    deleteBtnDiv.append(deleteBtn);
    userName.innerHTML = jsonObject[i].username;
    document.querySelector("#suggestions").append(element);
}

const suggestionsFunction = async ()=> {
    const response = await fetch("/user/list/");
    if (response.ok) {
        const jsonResponse = await response.json();
        if (jsonResponse.status === "success") {
            for (let i = 0; i < jsonResponse.data.length; i++) {
                createSuggestionCard(jsonResponse.data, i);
            }
            const addBtnsListen = document.querySelectorAll(".add .btn");
            for(let i = 0; i < addBtnsListen.length; i++) {
                // listen for add-friend button click event to send the id for the backend;
                addBtnsListen[i].addEventListener("click", ()=> sendIdToBackend(jsonResponse.data[i].id, "add"));
            }
    
            const deleteBtnsListen = document.querySelectorAll(".delete .btn");
            for(let i = 0; i < deleteBtnsListen.length; i++) {
                deleteBtnsListen[i].addEventListener("click", ()=> sendIdToBackend(jsonResponse.data[i].id, "delete"));
            }
        }
        return jsonResponse.data;
    }
}

const sendIdToBackend = async (id, action) => {
    console.log(id);
    const token = await get_csrf_token();
    if (action === "add") {
        const response = await fetch(`/user/send_friend/${id}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': token,
            },
        });
        if (response.ok) {
            const jsonResponse = await response.json();
            if (jsonResponse.status === "success") {
                console.log("success response...");
            } else {
                console.log("failed response...");
            }
        }
    }
    // else {
    //     waiting for backend in case of delete.
    // }
}

document.addEventListener("DOMContentLoaded", suggestionsFunction);



// --------------------- display requests --------------------------//


const createRequestCards = (name, image) => {
    const element = document.createElement("div");
    element.classList.add("friend-suggestion-card");
    const secondElement = document.createElement("div");
    secondElement.classList.add("frd-sug-header");
    const thirdElement = document.createElement("div");
    thirdElement.classList.add("frd-sug-statistics");
    const forthElement = document.createElement("div");
    forthElement.classList.add("add-del");
    element.append(secondElement, thirdElement, forthElement);

    const imageElement = document.createElement("div");
    imageElement.classList.add("frd-sug-img");
    imageElement.style.backgroundImage = `url(${image})`;
    const sugInfos = document.createElement("div");
    sugInfos.classList.add("frd-sug-infos");
    secondElement.append(imageElement, sugInfos);

    const wins = document.createElement("div");
    wins.classList.add("wins");
    const loses = document.createElement("div");
    loses.classList.add("loses");
    const score = document.createElement("div");
    score.classList.add("score");
    thirdElement.append(wins, loses, score);

    const addBtnDiv = document.createElement("div");
    addBtnDiv.classList.add("add");
    const deleteBtnDiv = document.createElement("div");
    deleteBtnDiv.classList.add("delete");
    forthElement.append(addBtnDiv, deleteBtnDiv);

    const userName = document.createElement("h4");
    userName.classList.add("user-name");
    const pRank = document.createElement("p");
    pRank.innerHTML = "rank: 5";
    sugInfos.append(userName, pRank);

    const winsKey = document.createElement("h4");
    const winsValue = document.createElement("h4");
    winsKey.innerHTML = "Wins:";
    winsValue.classList.add("pts", "value");
    winsValue.innerHTML = "42";
    wins.append(winsKey, winsValue);

    const losesKey = document.createElement("h4");
    losesKey.innerHTML = "Loses:";
    const losesValue = document.createElement("h4");
    losesValue.innerHTML = "0";
    losesValue.classList.add("value");
    loses.append(losesKey, losesValue);

    const scoreKey = document.createElement("h4");
    scoreKey.innerHTML = "Score:";
    const scoreValue = document.createElement("h4");
    scoreValue.innerHTML = "2560";
    scoreValue.classList.add("value");
    score.append(scoreKey, scoreValue);

    const addBtn = document.createElement("button");
    addBtn.innerHTML = "Accept";
    addBtn.classList.add("btn", "btn-lg");
    addBtnDiv.append(addBtn);
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Refuse";
    deleteBtn.classList.add("btn", "btn-lg");
    deleteBtnDiv.append(deleteBtn);
    userName.innerHTML = name;
    document.querySelector("#requests").append(element);
}

const requestsFunction = async ()=> {
    const response = await fetch("https://dattebayo-api.onrender.com/characters");
    if (response.ok) {
        const jsonResponse = await response.json();
        // if (jsonResponse.status === "success") {
        // console.log(jsonResponse.characters);
        for (let i = 0; i <jsonResponse.characters.length; i++) {
            createRequestCards(jsonResponse.characters[i].name, jsonResponse.characters[i].images[0]);
        }
        // }
    }
}

document.addEventListener("DOMContentLoaded", requestsFunction);

// -------------- Display Friends --------------------

const createFriendCards = (name, image) => {
    const element = document.createElement("div");
    element.classList.add("friend-suggestion-card");
    const secondElement = document.createElement("div");
    secondElement.classList.add("frd-sug-header");
    const thirdElement = document.createElement("div");
    thirdElement.classList.add("frd-sug-statistics");
    const forthElement = document.createElement("div");
    forthElement.classList.add("add-del");
    element.append(secondElement, thirdElement, forthElement);

    const imageElement = document.createElement("div");
    imageElement.classList.add("frd-sug-img");
    imageElement.style.backgroundImage = `url(${image})`;
    const sugInfos = document.createElement("div");
    sugInfos.classList.add("frd-sug-infos");
    secondElement.append(imageElement, sugInfos);

    const wins = document.createElement("div");
    wins.classList.add("wins");
    const loses = document.createElement("div");
    loses.classList.add("loses");
    const score = document.createElement("div");
    score.classList.add("score");
    thirdElement.append(wins, loses, score);

    const addBtnDiv = document.createElement("div");
    addBtnDiv.classList.add("add");
    const deleteBtnDiv = document.createElement("div");
    deleteBtnDiv.classList.add("delete");
    forthElement.append(addBtnDiv, deleteBtnDiv);

    const userName = document.createElement("h4");
    userName.classList.add("user-name");
    const pRank = document.createElement("p");
    pRank.innerHTML = "rank: 5";
    sugInfos.append(userName, pRank);

    const winsKey = document.createElement("h4");
    const winsValue = document.createElement("h4");
    winsKey.innerHTML = "Wins:";
    winsValue.classList.add("pts", "value");
    winsValue.innerHTML = "42";
    wins.append(winsKey, winsValue);

    const losesKey = document.createElement("h4");
    losesKey.innerHTML = "Loses:";
    const losesValue = document.createElement("h4");
    losesValue.innerHTML = "0";
    losesValue.classList.add("value");
    loses.append(losesKey, losesValue);

    const scoreKey = document.createElement("h4");
    scoreKey.innerHTML = "Score:";
    const scoreValue = document.createElement("h4");
    scoreValue.innerHTML = "2560";
    scoreValue.classList.add("value");
    score.append(scoreKey, scoreValue);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "Unfriend";
    deleteBtn.classList.add("btn", "btn-lg");
    deleteBtnDiv.append(deleteBtn);
    userName.innerHTML = name;
    document.querySelector("#my-friends").append(element);
}

const friendsFunction = async() => {
    const response = await fetch("https://dattebayo-api.onrender.com/characters");
    if (response.ok) {
        const jsonResponse = await response.json();
        // if (jsonResponse.status === "success") {
        // console.log(jsonResponse.characters);
        for (let i = 0; i < jsonResponse.characters.length; i++) {
            createFriendCards(jsonResponse.characters[i].name, jsonResponse.characters[i].images[0]);
        }
        // }
    }
}

document.addEventListener("DOMContentLoaded", friendsFunction);



