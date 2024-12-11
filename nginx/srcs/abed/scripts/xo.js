// document.addEventListener("DOMContentLoaded", () =>  {
    const app = document.getElementById("app");
    const startContainer = document.createElement("div");
    const gameContainer = document.createElement("div");
    const waitContainer = document.createElement("div");
    const showResult = document.createElement("div");
    const Suser = document.createElement("div");
    let is_gameOver = false;
    let socket = null;
    let crtf;
    let matchdata = 
    {
        id:0,
        level:0,
        user:0,
        opponent:0,
        chose:"",
        result:0,
        x_resuSuserlt:"",
        score:0,
        userName:"",
        openName:"",
    };
    let gameStart = false;
    // const leftGameContainer = document.createElement("div");

    startContainer.className = "start-container";
    gameContainer.className = "game-container";
    waitContainer.className = "wait-container";
    showResult.className = "show-Result";
    Suser.className = "same-User"

    // gameContainer.className = "leftGame-container";


    startContainer.innerHTML = `
        <h1>Welcome to Tic Tac Toe</h1>
        <button class="select" id="startGame">Start a Game</button>
    `;


    gameContainer.innerHTML = `
            <div class="first_container">
            <h3> Turn For</h3>
            <div class="first_box align">X</div>
            <div class="first_box align">O</div>
            <div class="bg"></div>
        </div>
        <div id="game-board">
            <div class="square align" data-index="0"></div>
            <div class="square align" data-index="1"></div>
            <div class="square align" data-index="2"></div>
            <div class="square align" data-index="3"></div>
            <div class="square align" data-index="4"></div>
            <div class="square align" data-index="5"></div>
            <div class="square align" data-index="6"></div>
            <div class="square align" data-index="7"></div>
            <div class="square align" data-index="8"></div>
        </div>
        <div id="alert_move">Your are </div>
        <div id="enemyXo"></div>
        <button id="pplay-again">Play Again</button> <!-- Moved here -->
    `;
    waitContainer.innerHTML=`
        <div class="loader-container">
            <div class="loading-text">Loading<span class="dots"></span></div>
        </div>
        `;
    showResult.innerHTML = `
        <h2 id="result" ></h2>
        `;
    Suser.innerHTML = `
        <h2 id="sameUser"> you can't Play against yourself</h2>
    `;
    app.appendChild(startContainer);
    app.appendChild(gameContainer);
    app.appendChild(waitContainer);
    app.appendChild(showResult);
    app.appendChild(Suser);
    let charChoice = null;
    let roomCode =null;
    let currentTurn = 'X'; 
    let room_is_created = false;



    window.addEventListener("beforeunload", (event) => {
		if (socket && socket.readyState === WebSocket.OPEN) {
			alert("GOOD")
			socket.send(JSON.stringify({ type: "close" }));
			if (gameStart){
				if (matchdata.id == 0)
					fetchUser();

				fetchcrtf();
				matchdata.level -= 1;
				matchdata.score -= 10;
				let postdata = 
				{
					id : matchdata.id,
					user : matchdata.id,
					opponent: matchdata.opponent,
					result: "loss",
					level:  matchdata.level,
					score: matchdata.score,
					Type: "PONG"
				}
				if (postdata.level < 0)
					postdata.level = 0;
				if (postdata.score < 0)
					postdata.score = 0;
				console.log("crtf ", crtf);
				console.log("postdata ",postdata);
				fetch('https://localhost/user/store_match/', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'X-CSRFToken': crtf
					},
					body: JSON.stringify(postdata)
				})
				
			}
		}
	});


async function fetchUser(){
    const res = await fetch('/user/get_curr_user/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    
    if (!res.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
    }
    let data = await res.json();  
    if (data.status === '400') {
        console.log('User is not authenticated:', data.data);
    } else {
        matchdata.id = data.data.id;
        matchdata.user = data.data.id;
        matchdata.level = data.data.level;
        matchdata.userName = data.data.username;
        matchdata.score = data.data.score
        matchdata.result = -1;
        console.log("full name is ", data.data.score);
        console.log("LEVEL is ", matchdata.level, " User is ", matchdata.user, matchdata.id)
    }
}
function fetchcrtf(){
    fetch('/get_csrf_token/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();  
    })
    .then(data => {
        if (data.status === '400') {
            console.log('User is not authenticated:', data.data);
        } else {
            crtf = data.csrfToken;
        }
    })
}
function postMatch()
{
    console.log("match result is ", matchdata.result);
    if (matchdata.result == 0)
        matchdata.x_result = "loss";
    else if (matchdata.result == 1)
        matchdata.x_result = "won";
    else
        matchdata.x_result = "draw";

    let postdata = 
    {
        id : matchdata.id,
        user : matchdata.id,
        opponent: matchdata.opponent,
        result: matchdata.x_result,
        level:  matchdata.level,
        score: matchdata.score,
        Type: "XO"
    }
    if (postdata.level < 0)
        postdata.level = 0;
    if (postdata.score < 0)
        postdata.score = 0;
    console.log("crtf ", crtf);
    console.log("postdata ",postdata);
    fetch('/user/store_match/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': crtf
        },
        body: JSON.stringify(postdata)
    })
}
async function fetchRoom() {
    try {
        const response = await fetch('/api/xrooms/');        
        if (!response.ok) {
            console.log("No available rooms. Creating a new room...");
            return await createRoom();
        }
        
        const room = await response.json();
        console.log("Fetched room:", room);

        if (room.players < 3) {
            console.log(`Joining room ${room.code} with ${room.players} players.`);
            roomCode = room.code;
            connectWebSocket();
        } else {
            console.log("Room is full, creating a new room...");
            await createRoom();
        }
    } catch (error) {
        console.error("Error fetching or creating room:", error.message);
    }
}

export async  function createRoom() {
    try {
        const response = await fetch('/api/xrooms/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code: generateRoomCode() })
        });
        
        const data =  await response.json();
        roomCode = data.code;
        console.log("Created new room with code:", roomCode, "and data code is ", data);
        connectWebSocket();
        
        return data;
    } 
    catch (error) {
        console.error("Error creating room:", error);
    }
}


function disconnect() {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log("in closed");
        socket.close();
    }
}


function generateRoomCode() {
    return  Math.random().toString(36).substring(2, 8).toUpperCase();
    
}
document.getElementById("startGame").addEventListener("click", async function() {
    console.log("First Wait");
    await fetchUser()
    wait_page();
    await fetchRoom();
});

function wait_page()
{
    console.log("wait fuction");
    waitContainer.classList.add("active");
    startContainer.classList.remove("active");
    showResult.classList.remove("active");
    startContainer.style.display = "none";
}
function startGame() {
        console.log("start fuction");
        console.log("id", matchdata.id)
        fetchcrtf();
        socket.send(JSON.stringify({
            "event": "START",
            "message": {
                "id": matchdata.id,
                "name": matchdata.userName
            }
        }));
        startContainer.classList.remove("active");
        gameContainer.classList.add("active");
        waitContainer.classList.remove("active");
        socket.send(JSON.stringify({
            "event": "DUSER",
            "message": ""
        }));
        gameStart = true;

   }

    function connectWebSocket() {
        // Get the protocol and host from window.location
        const host = window.location.host;         // e.g., "example.com:3000"
        // Construct the WebSocket URL dynamically
        socket = new WebSocket(`wss://${host}/wss/playx/${roomCode}/`);
        socket.onopen = function() {
            console.log("Here New pr")
        };

        socket.onmessage = function(event) {
            const data = JSON.parse(event.data);
            const message = data.message;
            const eventType = data.event;
            
            console.log("event type is ", eventType, "message is ", message);
            switch (eventType) {
                case "CHOICE":
                    charChoice = message;
                    matchdata.chose = message;
                    wait_page();
                    break;
                case "START":
                    initializeGame();
                    break;
                case "MOVE":
                    handleMove(message);
                    break;
                case "TURN":
                    if (message.includes('X')) {
                        currentTurn = 'X';
                    } else {
                        currentTurn = 'O';
                    }
                    break;
                case "END":
                    console.log('game over ', message, 'with ', eventType)
                    console.log("this char ", charChoice)
                    if (message.includes(charChoice)) {
                        document.querySelector("#enemyXo").style.display = "none";
                            console.log("winner ........")
                                matchdata.result = 1;
                                matchdata.level += 1; 
                                matchdata.score +=15; 
                    } 
                    else
                    {
                        console.log("loser ........")
                        matchdata.result = 0;
                        matchdata.level -=1; 
                        matchdata.score -= 10; 
                    }                      
                    resetGame(message);
                    break;
                case "wait":
                    console.log("waitt")
                    wait_page();
                    break;
                case "DRAW":
                    matchdata.result = 2;
                    console.log("this is draw")
                    resetGame("DRAW");
                    break;
                case "OVER":
                    console.log("this is over")
                    if (!is_gameOver)
                        left_game(message);
                    break;
                case "USERS":
                    if (message == 'Suser')
                        hadnleSuser();
                    else
                        updateMatchData(message);
                    break;
            }
        };

        document.querySelectorAll('.square').forEach((element, index) => {

            element.addEventListener('click', function() {
                if (validMove(index) && isPlayerTurn()) {

                    element.innerHTML = currentTurn;
                    const moveData = {
                        "event": "MOVE",
                        "message": {
                            "index": index,
                            "player": currentTurn
                        }
                    };
                    socket.send(JSON.stringify(moveData));
                }
            });
        });

        function validMove(index) {
                if (!is_gameOver)
                    return document.querySelector(`.square[data-index='${index}']`).textContent === '';
                else
                    return false;
        }
        function isPlayerTurn() {
            return charChoice === currentTurn;
        }
        
        function handleMove(message) {
            const index = message.index;
            const player = message.player;
        
            document.querySelector(`.square[data-index='${index}']`).textContent = player;
            if (currentTurn === 'X') {
                currentTurn = 'O';
                document.querySelector(".bg").style.left = "85px";
                document.querySelector(".bg").style.backgroundColor = "#08D9D6";
                gameContainer.classList.add('player-o-turn');
            } else {
                currentTurn = 'X';
                document.querySelector(".bg").style.left = "0";
                document.querySelector(".bg").style.backgroundColor = "#FF2E63";
                gameContainer.classList.remove('player-o-turn');
            }
            
        }
        function updateMatchData(message)
        {
            if (matchdata.id == message.user1)
            {
                matchdata.opponent = message.user2;
                matchdata.openName = message.userName2;
            }
            else
            {
                matchdata.opponent = message.user1;
                matchdata.openName = message.userName1;

            }
            if (charChoice == 'X'){
                document.getElementById("enemyXo").textContent = `O is ${matchdata.openName }`;

                document.getElementById("enemyXo").style.backgroundColor = "#08D9D6"
                 document.getElementById("enemyXo").style.display = "flex";
            }
            else{

                document.getElementById("enemyXo").textContent = `X is ${matchdata.openName }`;
                document.getElementById("enemyXo").style.backgroundColor = "#FF2E63"
                 document.getElementById("enemyXo").style.display = "flex";
            }
            console.log("message.userName", message)
            console.log("Update Match ", matchdata.id, " ope ", matchdata.opponent);
        }
        function hadnleSuser()
        {
            console.log("in Suser");
            gameContainer.classList.remove("active");
            const same = document.querySelector(".same-User");
            same.style.display = "flex";
        }
        function initializeGame() {
            console.log("intitialze fuction");
            document.getElementById("alert_move").textContent = `You are ${charChoice}`;
            document.getElementById("alert_move").display = "flex";
            startGame();
        }

        function left_game(message){
            console.log("message is ", message,  "CHar ",  charChoice);
            if (message === charChoice)
            {
                    matchdata.result = 0;
                    matchdata.level -=1; 
                    matchdata.score -=10;
            }
            else
            {
                matchdata.result = 1;
                matchdata.level += 1; 
                matchdata.score +=15; 
            } 
            if (message == 'X')
                message = 'O'
            else
                message = 'X'
            resetGame(message);
            console.log("this one left");
        }
        function resetGame(message) {
            is_gameOver = true;
            gameStart = true;
            let curr_winner;
            console.log("charChoice ", matchdata.charChoice, "userName", matchdata.userName, "openName", matchdata.openName)
            if (charChoice == message)
                curr_winner = matchdata.userName;
            else
                curr_winner = matchdata.openName
            console.log('t his restGame', message);
            showResult.classList.add("active");
            showResult.style.display = "block";

            if(message != "DRAW")
            {
                document.querySelector("#result").innerHTML= `The Winner is  ${curr_winner}`

            }
            document.querySelector("#pplay-again").style.display = "block";
            document.getElementById("enemyXo").style.display = "none";
            document.getElementById("alert_move").style.display = "none";
            let WinCondation = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6]
            ];
            let boxes = document.querySelectorAll('.square');
            for (let i = 0; i < WinCondation.length; i++)
                {
                    let v0 = boxes[WinCondation[i][0]].innerHTML;
                    let v1 = boxes[WinCondation[i][1]].innerHTML;
                    let v2 = boxes[WinCondation[i][2]].innerHTML;
                if (v0 != "" && v0 === v1 && v0 === v2){
                    for (let j = 0; j < 3; j++)
                    {
                        if (message == charChoice)
                            boxes[WinCondation[i][j]].style.backgroundColor = "#00ffa2";
                        else
                            boxes[WinCondation[i][j]].style.backgroundColor = "#e00d0d";
                        boxes[WinCondation[i][j]].style.color = "#000";
                    }
                }
            }
            disconnect();
            postMatch();
        }
    }
    const playAgain = ()=> {
        disconnect();
        is_gameOver = false;
        currentTurn = 'X'; 
        matchdata = [];
        console.log('playAgain');
        room_is_created = false;
        gameContainer.classList.remove('player-o-turn');
        const same = document.querySelector(".same-User");
        same.style.display = "none";
        waitContainer.classList.remove("active")
        gameContainer.classList.remove("active");
        startContainer.classList.add("active");
        startContainer.style.display = "block";
        showResult.classList.remove("active");
        document.getElementById("alert_move").textContent = `Your are ${charChoice}`;
        document.getElementById("alert_move").style.display = "flex";
        document.querySelector(".bg").style.left = "0";
        document.querySelector("#result").innerHTML = "";
        document.querySelector("#pplay-again").style.display = "none";
        document.querySelector(".bg").style.backgroundColor = "#FF2E63";
        document.getElementById("enemyXo").style.display = "none"
        // gameContainer.classList.remove('player-o-turn'); 
        document.querySelectorAll('.square').forEach((element) => {
            // element.classList.remove('filled');
            element.textContent = '';
            element.style.removeProperty("background-color");
            element.style.color = "white";
        });
    }
    document.querySelector("#pplay-again").addEventListener("click", playAgain);
    // const app = document.querySelector("#app");
    const freeze = document.querySelector("#freeze");

    const displayXoFunction = () => {
        freeze.classList.add("unclick");
        app.style.display = "flex";
        const design = document.querySelector("#design");
        design.style.filter = "blur(3px)";
        const games = document.querySelector("#games");
        games.style.filter = "blur(3px)";
        const nav = document.querySelector("#nav");
        nav.style.filter = "blur(3px)";
        const same = document.querySelector(".same-User");
        same.style.display = "none";
    }

    const xoImgBtn = document.querySelector("#XO");
    xoImgBtn.addEventListener("click", displayXoFunction);

    const closeGame = () => {
        freeze.classList.remove("unclick");
        playAgain();
        if (gameStart){
            matchdata.level -= 1;
            matchdata.score -= 10;
            matchdata.result = 0;
        }
        disconnect()
        app.style.display = "none";
        document.querySelector("#design").style.filter = "blur(0px)";
        document.querySelector("#games").style.filter = "blur(0px)";
        document.querySelector("#nav").style.filter = "blur(0px)";
    }

    const escapeFunction = (event)=> {
        if (event.key === "Escape") {
            closeGame();
        }
    }

    document.addEventListener("keyup", escapeFunction);

    const closeBtn = document.querySelector(".btn-close");
    closeBtn.addEventListener("click", closeGame);
// });
/********  new    ********* */