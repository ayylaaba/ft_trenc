const chatButton = document.querySelector("#chat");
export const chatPage = document.querySelector("#chat-part");

import { profileId } from "./profile.js";
import { main } from "./home.js";
import {settingPage} from "./setting.js";
import { rankPart } from "./rank.js";
import { friendsPart } from "./friends.js";

const chatFunction = () => {
    profileId.style.display = "none";
    main.style.display = "none";
    settingPage.style.display = "none";
    rankPart.style.display = "none";
    friendsPart.style.display = "none";
    chatPage.style.display = "block";
    // document.querySelector("#profile-img").style.display = "block";
}

chatButton.addEventListener("click", chatFunction);

const data_example = async() => { // get characters.
    try {
        const data = await fetch("https://dattebayo-api.onrender.com/characters");
        if (data.ok)
        {
            const json_data = await data.json();
            return json_data.characters;
        }
    } catch (err) {
        console.error(err);
    }
}

const container = document.querySelector("#msgs");

const scrollToBottom = ()=> {
    container.scrollTop = container.scrollHeight;
}

const data_characters = async() => {
    const characters = await data_example();
    characters.forEach(character => {
        const user = document.createElement("div");
        document.querySelector("#chats").appendChild(user);
        user.innerHTML = character.name;
        // document.querySelector("#chats div").style.border = "none";
        user.addEventListener("click", ()=> {
            const users = document.querySelectorAll("#chats div");
            users.forEach(userr => {
                userr.classList.remove("selected-user");
                userr.style.width = "90%";
                userr.style.boxShadow = "0 0 5px #0e2c2e";
            })
            user.style.width = "95%";
            user.style.boxShadow = "0 0 5px #9bf9ff";
            user.classList.add("selected-user");
            document.querySelector("#chat-pic").style.backgroundImage  = `url("${character.images[0]}")`;
            document.querySelector("#secondd h3").innerHTML = character.name;
        })
    })
}

const sendMsg = document.querySelector("#something");

const frontChat = (event)=> {
    if (event.key === "Enter" && sendMsg.value != "") {
        // console.log(sendMsg.value);
        if (sendMsg.value != "friend" && sendMsg.value != "alaykum salam") {
            const msg = document.createElement("div");
            msg.classList.add("my-msg");
            document.querySelector("#msgs").appendChild(msg);
            msg.innerHTML = `${sendMsg.value}`;
            sendMsg.value = "";
            scrollToBottom();
        } else {
            const msg = document.createElement("div");
            document.querySelector("#msgs").appendChild(msg);
            msg.classList.add("friend-msg");
            msg.innerHTML = `${sendMsg.value}`;
            sendMsg.value = "";
            scrollToBottom();
        }
    }
}

sendMsg.addEventListener("keyup", frontChat);

data_characters();
