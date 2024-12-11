import { rplayers } from "./registers.js";

var socket = null;

// document.addEventListener("DOMContentLoaded", () =>  {
	
	const canvas = document.getElementById('canvas');
	canvas.width = 600; 
	canvas.height = 300;
	const ctx = canvas.getContext('2d');
	const img = new Image();
	img.src = "./img2.jpg";
	let semi = [];
	let final = [];
	let bracket;
	let pmatch = 0;
	let isTourn = false;
	let gameStart = false;
	let noMatch = false;
	let ballPosition = { x: 400, y: 200 }; 
	let ballRadius = 10;
	let myreq;
	let is_chat = false;
	let paddle1 = {
        x: 10,        
        y: 110,       
        w: 5,        
        h: 80,        
    };
	let paddle2 = {
        x: 10,        
        y: 110,       
        w: 5,
        h: 80,        
    };
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
	let crtf;
	/*******************************************************************************************************/
	//																	My change
	/*******************************************************************************************************/
	
	const startContainer = document.createElement("div");
	const waitContainer = document.createElement("div");
	const app = document.getElementById('pingpong-game');
	const main_counter = document.getElementById("main_counter");
	const gameContainer = document.getElementById("game-container1")
	const game_over = document.getElementById("game_over"); 
	//newwwwwwwwwwwwwwwww 
	const closeBtn = document.createElement("button");
	closeBtn.type = "button";
	closeBtn.classList.add("btn-close");
	closeBtn.ariaLabel = "Close";
	const bodyElement = document.querySelector("body");
	const header = document.createElement("h1");
	header.id = "header-mode";
	header.innerHTML = `CHOOSE MODE`;
	const parent = document.createElement("div");
	const container = document.createElement("div");
	container.id = "cont-modes";
	parent.id = "choose-mode";
	const twoPlayers = document.createElement("div");
	twoPlayers.id = "two-players";
	twoPlayers.classList.add("mode");
	twoPlayers.innerHTML = `Two Players.`
	const tournament = document.createElement("div");
	tournament.id = "tournament";
	tournament.classList.add("mode");
	tournament.innerHTML = `Tournament.`;
	const remote = document.createElement("div");
	remote.id = "remote";
	remote.classList.add("mode");
	remote.innerHTML = `Remote.`
	container.append(twoPlayers, tournament, remote);
	parent.append(header, container);
	bodyElement.append(parent);
	parent.append(header, container, closeBtn);
	const commingUp = document.createElement("div");
	commingUp.className = "comingUp";
	commingUp.innerHTML = `
	<h1 id=nextmatch>Next Match : </h1>
	<hr>
	<div class="announce">
		<h1 id="announce1"> Next Match:</h1>
		<h1 id="announce2"> Next Match:</h1>
	</div>
	<div class="pressEnter">
		<h2> Press enter....<h2>
	</div>
	`;
	parent.append(commingUp);
	document.querySelector('.comingUp').style.display = 'none';


	startContainer.className = "start-container1";
	waitContainer.className = "wait-container1";
	let gameType;
	let roomCode;
	let room_is_created = false;
	let pad_num;

	startContainer.innerHTML = `
	<h1>Welcome to PONG</h1>
	<button class="select" id="startGame1">Start a Game</button>
	`;

	waitContainer.innerHTML=`
	<div class="loader-container1">
		<div class="loading-text1">Loading<span class="dots1"></span></div>
	</div>
	`;
	app.appendChild(startContainer);
	app.appendChild(waitContainer);
	app.append(game_over);
	document.getElementById("startGame1").addEventListener("click", async function() {
		wait_page();
		if (gameType === 'remote')
		{
			await fetchUser();
			wait_page();
			await fetchRoom();
		}
		else
		{
			await fetchUser();
			wait_page();
			await createRoom(0);
		}
	});
	/* send from the one who stay*/
	window.addEventListener("beforeunload", (event) => {
		if (socket && socket.readyState === WebSocket.OPEN) {;
			socket.send(JSON.stringify({ type: "close"}));
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
		}
		else {
			matchdata.id = data.data.id;
			matchdata.user = data.data.id;
			matchdata.level = data.data.level;
			matchdata.userName = data.data.username;
			matchdata.score = data.data.score
			matchdata.result = -1;
		}
	}

	export function displayGame(){
		thisblur()
		parent.append(header, container);
		bodyElement.append(parent);
		parent.append(header, container, closeBtn);
		header.style.display = "flex";
		container.style.display = "flex";
		parent.style.display = "flex";
		gameType = 'remote';
		container.style.display = "none";
		header.style.display = "none";
		parent.append(app);
		app.style.display = "flex";
		startContainer.classList.add("active");
		startContainer.style.display = "block";
		closeBtn.style.display = "none"
	}
	function hideGame(){
		header.style.display = "none";
		container.style.display = "none";
		parent.style.display = "none";
		gameType = 'remote';
		container.style.display = "none";
		header.style.display = "none";
		app.style.display = "none";
		gameContainer.style.display = "none";
		game_over.style.display = "none";
		undoblur();
		is_chat = false
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
		if (matchdata.result === 0)
			matchdata.x_result = "loss";
		else
			matchdata.x_result = "won";
	
		let postdata = 
		{
			id : matchdata.id,
			user : matchdata.id,
			opponent: matchdata.opponent,
			result: matchdata.x_result,
			level:  matchdata.level,
			score: matchdata.score,
			Type: "PONG"
		}
		if (postdata.level < 0)
			postdata.level = 0;
		if (postdata.score < 0)
			postdata.score = 0;
		fetch('/user/store_match/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-CSRFToken': crtf
			},
			body: JSON.stringify(postdata)
		})
	}
	

	export async function  createRoom(is_reserved) {
		try
		{
			let gamemode;
			if (gameType === "tourn")
				gamemode = "local"
			else 
			gamemode = gameType;
			const res = await fetch('/pong/prooms/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					"code": generateRoomCode(),
					"type": gamemode,
					'is_reserved':is_reserved
				})
			})
			if (is_reserved)
				is_chat = true;
	    	let data = await res.json()
	    	roomCode = data.code;
	    	wait_page();
	    	connectWebSocket();
			return data;
		}
	    catch(error )
		{
	        console.error("Error creating room:", error);
	    }
	}

	function disconnect()
	{
		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.close();
		}
	}


export async function fettchTheRoom(Theroom){
	try{
		const response = await fetch(`/pong/fprooms/room/${Theroom}/`);
        is_chat = true
        const room = await response.json();
        roomCode = room.code;
		gameType = 'remote'
        connectWebSocket();
    } catch (error) {
        console.error("Error fetching or creating room:", error);
    }
}


export async function fetchRoom() {
    try {
		const response = await fetch('/pong/prooms/');
        
        if (!response.ok) {
            console.log("No available rooms. Creating a new room...");
            return await createRoom(0);
        }
        const room = await response.json();

        if (room.players < 3) {
            console.log(`Joining room ${room.code} with ${room.players} players.`);
            roomCode = room.code;
            connectWebSocket();
        } else {
            console.log("Room is full, creating a new room...");
            await createRoom(0);
        }
    } catch (error) {
        console.error("Error fetching or creating room:", error);
    }
}

	function connectWebSocket() {
		const host = window.location.host;         
		socket = new WebSocket(`wss://${host}/wss/playp/${roomCode}/`);

		socket.onopen = function() {
			console.log('WebSocket connection established.');
			if (gameType === "local" || gameType === "tourn")
			{
				console.log("local match send ...")
				socket.send(JSON.stringify({ type: "local" }));
			}
		};
		socket.onmessage = function(event) {
			const data = JSON.parse(event.data);
			if (data.type === "GAME_STATE") {
				const ball = data.ball				
				const paddle_serv1 = data.paddle1;
				const paddle_serv2 = data.paddle2;
				ballPosition.x = ball.x;
				ballPosition.y = ball.y;
				ballRadius = 10;
				paddle1.x = paddle_serv1.x;
				paddle1.y = paddle_serv1.y;
				paddle2.x = paddle_serv2.x;
				paddle2.y = paddle_serv2.y;
				document.getElementById("player1Score").innerHTML = paddle_serv1.score;
				document.getElementById("player2Score").innerHTML = paddle_serv2.score;
				myreq =  requestAnimationFrame(renderGame);
			}
			else if (data.type === 'ASSIGN_PAD_NUM') {
				pad_num = data.pad_num;
			}
			else if (data.event === 'START')
				{
					startventListener();
					start_game();
				}
			else if (data.event === 'END')
				Game_over(data.message);
			else if (data.event === "OVER" && gameType === "remote" && !is_chat){
				noMatch = true;
				left_game(data.pad_num);
			}
			else if (data.event  === "USERS")
			{
				let message = data.message
				if (matchdata.id === message.user1)
				{
					matchdata.opponent = message.user2;
					matchdata.openName = message.userName2;
				}
				else
				{
					matchdata.opponent = message.user1;
					matchdata.openName = message.userName1;
				}
			}
		};
	}
	

	function wait_page()
	{
	    waitContainer.classList.add("active");
	    startContainer.classList.remove("active");
	    startContainer.style.display = "none";
	}


	async function start_game(){
		await fetchUser();
		wait_page();
		await fetchcrtf();
		if (socket.readyState === WebSocket.OPEN)
		{
			socket.send(JSON.stringify({
				"type": "START",
				"message": {
					"id": matchdata.id,
					"name": matchdata.userName
				}
			}));
		}
		
        startContainer.classList.remove("active");
		waitContainer.classList.remove("active");
		main_counter.style.display = "block";
		let Tournament = document.querySelector('.allbrackets');
		Tournament.style.display = "none";
		document.querySelector(".counter").style.display = "block"

		resetDOM()
		runAnimation();
		
		setTimeout(() => {
			if (socket.readyState === WebSocket.OPEN)
				socket.send(JSON.stringify({ type: "start"}));
			if (!noMatch)
				gameContainer.style.display = "block";
			myreq =  requestAnimationFrame(renderGame);

		}, 3500)
		if (socket.readyState === WebSocket.OPEN)
		{
			socket.send(JSON.stringify({
				"type": "DUSER",
				"message": ""
			}));
		}
		gameStart = true;

	}
	function playTournemt(){
		if (pmatch < 4 ){
			createRoom(0);
			app.style.display = "flex";
			startContainer.classList.remove("active");
			startContainer.style.display = "none";
			pmatch += 1;
		}
		else if (pmatch < 6 && pmatch > 3){
			createRoom(0);
			app.style.display = "flex";
			startContainer.classList.remove("active");
			startContainer.style.display = "none";
			pmatch += 1;
		}
		else{
			createRoom(0);
			app.style.display = "flex";
			startContainer.classList.remove("active");
			startContainer.style.display = "none";
			pmatch += 1;
		}
	}
	function update_tournment(pmatch, winner, color){
		app.style.display = "none";
		let Tournament = document.querySelector('.allbrackets');
		Tournament.style.display = "flex";
		let curr_matach1 =  bracket[0];
		let curr_matach2 =  bracket[1];
		if (pmatch === 4)
		{
			curr_matach1 =  document.getElementById("1stbracket").value;
			curr_matach2 =  document.getElementById("2ndbracket").value;
		}
		if (pmatch === 5)
		{
			curr_matach1 =  document.getElementById("3rdbracket").value;
			curr_matach2 =  document.getElementById("4thbracket").value;
		}
		if (pmatch === 6)
		{
			curr_matach1 =  document.getElementById("Finalist1").value;
			curr_matach2 =  document.getElementById("Finalist2").value;
		}
		document.querySelector('.comingUp').style.display = 'flex';
		document.querySelector(".announce").style.display = "flex";
		document.querySelector(".pressEnter").style.display = "flex";
		document.querySelector("#announce1").style.color = "#2f93ba";
		document.querySelector("#announce2").style.color = "#c71539";
		document.querySelector("#announce1").innerHTML = curr_matach1 + " v";
		document.querySelector("#announce2").innerHTML = "s " + curr_matach2;
		if (pmatch === 7)
		{
			// commingUp.innerHTML = The Winner is
			document.querySelector("#announce1").innerHTML = "";
			document.querySelector("#announce2").style.color = color;
			document.querySelector("#announce2").innerHTML = winner;
			document.querySelector("#nextmatch").innerHTML = "The winner is:";
			document.querySelector("#nextmatch").style.color = "#BFA100";
			document.querySelector(".pressEnter").style.display = "none";
			pmatch = 0;
			gameStart = false
		}

		// update player 
	}


	function Game_over(winner)
	{
		disconnect();
		cancelAnimationFrame(myreq);
		document.querySelector(".counter").style.display = "none"

		if (gameType != 'tourn')
			removEventListener();
		if (gameType === 'tourn')
		{
			gameContainer.style.display = "none";
			if (!isTourn)
			{
				//4 matches quarter end 6 matche semi end 7 matches end
				// always remove first two from bracket and then semi 
				// function to keep count and start matche first call is by enter key
				//winner taker pad num 
				if (pmatch <= 4)
				{
					if (winner === '0')
					{
						semi.push(bracket[0]);
					}
					else{
						semi.push(bracket[1]);
					}
					if (semi.length === 1)
						document.getElementById("1stbracket").value = semi[0];
					else if (semi.length === 2) 
						document.getElementById("2ndbracket").value = semi[1];
					else if (semi.length === 3)
						document.getElementById("3rdbracket").value = semi[2];
					else if (semi.length === 4)
						document.getElementById("4thbracket").value = semi[3];
					if (bracket.length - 2 > 0)
						bracket.splice(0, 2);
					gameStart = false
				}
				else if (pmatch <= 6 && pmatch > 4){
					if (winner === '0')
						final.push(semi[0]);
					else
						final.push(semi[1]);
					if (final.length === 1)
						document.getElementById("Finalist1").value = final[0];
					else if (final.length === 2)
						document.getElementById("Finalist2").value = final[1];
					semi.splice(0, 2);
					gameStart = false
				}
				let theWinner ;
				let color;
				if (pmatch === 7)
				{
					if (winner === '0')
					{
						theWinner = final[0]
						color = "#2f93ba"
					}
					else
					{
						theWinner = final[1]
						color = "#c71539"
					}
					isTourn = true;
					gameStart = false
				}
				update_tournment(pmatch, theWinner, color);
			}
		}

		else if (gameType === "remote")
		{
			gameStart = false
			if (pad_num === parseInt(winner))
			{
				gameContainer.style.display = "none";
				game_over.style.display = "block";
				document.getElementById("result1").innerHTML = "You  Win";
				if (pad_num === 0){
					game_over.style.backgroundColor = "#0095DD";
				}
				else
				{
					game_over.style.backgroundColor =  "#ff0000";
				}
				matchdata.score += 30;
				matchdata.result = 1;
				matchdata.level += 1;
			}
			else
			{
				gameContainer.style.display = "none";
				game_over.style.display = "block";
				document.getElementById("result1").innerHTML = "You lose";
				if (pad_num === 0)
					game_over.style.backgroundColor = "#0095DD";
				else
					game_over.style.backgroundColor =  "#ff0000";
				matchdata.score -= 20;
				matchdata.result = 0;
				matchdata.level -= 1;
			}
			postMatch();
			if (is_chat){
				setTimeout(() => {
					hideGame()
				}, 2500)
			}
			if (!is_chat)
				document.querySelector("#play-again").style.display = "block";
			is_chat = false
		}
		else 
		{
			gameStart = false
			if (0 === parseInt(winner))
				{
					gameContainer.style.display = "none";
					game_over.style.display = "block";
					game_over.style.backgroundColor = "#0095DD";
					document.getElementById("result1").innerHTML = "Blue  Won";
				}
				else
				{
					gameContainer.style.display = "none";
					game_over.style.display = "block";
					document.getElementById("result1").innerHTML = "Red  Won";
					game_over.style.backgroundColor =  "#ff0000";
				}
				document.querySelector("#play-again").style.display = "block";
		}
	}

	function left_game(left_pad)
	{
		if (left_pad === pad_num){
			console.log("you lose");
		}
		else
		{
			if (left_pad === 0){
				Game_over(1);
				
			}
			else{
				Game_over(0);
			}
		}
	}

	// function post_loser(loser){
	// 		fetchcrtf();
	// 		let id = matchdata.opponent;
	// 		let opponent = matchdata.id;
	// 		fetch('/user/')
	// 		matchdata.level -= 1;
	// 		matchdata.score -= 20;
	// 		let postdata = 
	// 		{
	// 			id : matchdata.id,
	// 			user : matchdata.id,
	// 			opponent: matchdata.opponent,
	// 			result: "loss",
	// 			level:  matchdata.level,
	// 			score: matchdata.score,
	// 			Type: "PONG"
	// 		}
	// 		if (postdata.level < 0)
	// 			postdata.level = 0;
	// 		if (postdata.score < 0)
	// 			postdata.score = 0;
	// 		fetch('/user/store_match/', {
	// 			method: 'POST',
	// 			headers: {
	// 				'Content-Type': 'application/json',
	// 				'X-CSRFToken': crtf
	// 			},
	// 			body: JSON.stringify(postdata)
	// 		})
			
	// }

	function generateRoomCode() {
	    return Math.random().toString(36).substring(2, 8).toUpperCase();
	}

	const nums = document.querySelectorAll('.nums span');
	const counter = document.querySelector('.counter');
	const repl = document.getElementById('replay');

	function resetDOM() {
		counter.classList.remove('hide');
		document.querySelector(".tagcolor").style.display = "none"
		nums.forEach(num => {
			num.classList.value = '';
		});

	    nums[0].classList.add('in');
	}

	function runAnimation() {
		document.querySelector(".tagcolor").style.display = "block"
		let mytag;
		let tagcolor;
		if (pad_num === 1 )
		{
			mytag = "you are red"
			tagcolor = "#FF0000"
		}
		else
		{
			
			tagcolor = "#0095dd"
			mytag = "you are blue"
		}
		if (gameType === "remote")
		{
			document.querySelector("#myTagColor").style.color = tagcolor;
			document.querySelector("#myTagColor").innerHTML = mytag;
		}
		nums.forEach((num, idx) => {
			const penultimate = nums.length - 1;
			num.addEventListener('animationend', (e) => {
				if(e.animationName === 'goIn' && idx !== penultimate){
					num.classList.remove('in');
					num.classList.add('out');
				} else if (e.animationName === 'goOut' && num.nextElementSibling){
					num.nextElementSibling.classList.add('in');
				} else {
					counter.classList.add('hide');
				}
			});
		});

	}

	/*   add event for handle   */
	function startventListener(){
		window.addEventListener("keydown", keyisdown);
		window.addEventListener("keyup", keyisup);
	}



	/*  add handle key press*/
		function keyisdown(event)
		{
			if (gameType === 'remote')
			{
				if (gameStart && (event.key === "ArrowUp")) {
					socket.send(JSON.stringify({ 
						type: "move", 
						move: "Up", 
						pad_num: pad_num 
					}));
				} 
				else if (gameStart && (event.key === "ArrowDown"))
				{
					 socket.send(JSON.stringify({ 
						type: "move", 
						move: "Down", 
						pad_num: pad_num 
					}));
				}
			}
			else
			{
				if (gameStart && (event.key === "ArrowUp")) {
					socket.send(JSON.stringify({ 
						type: "move", 
						move: "Up", 
						pad_num: 0 
					}));
				}
				else if (gameStart && (event.key === "ArrowDown"))
				{
					socket.send(JSON.stringify({ 
						type: "move", 
						move: "Down", 
						pad_num: 0 
					}));
				}
				if (gameStart && (event.key === "w" || event.key === "W")) {
					socket.send(JSON.stringify({ 
						type: "move", 
						move: "Up", 
						pad_num: 1 
					}));
				}
				else if (gameStart && (event.key === "s" || event.key === "S"))
				{
					socket.send(JSON.stringify({ 
						type: "move", 
						move: "Down", 
						pad_num: 1 
					}));
				}

			}
			if (event.key === "Enter") {
				if (Array.isArray(bracket) && !bracket.length)
					bracket = rplayers();
				if (Array.isArray(bracket) && bracket.length) 
				{
					if (!isTourn && !gameStart)
					{
						document.querySelector('.comingUp').style.display = 'none';
						document.querySelector(".announce").style.display = "none";
						document.querySelector(".pressEnter").style.display = "none";
						playTournemt();
					}
				} 
			}
		}
	/*   add handle  key up */
		function keyisup(event){
			if (gameType === "remote")
				{
					if (gameStart && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
						socket.send(JSON.stringify({ 
							type: "move", 
							move: "Stop", 
							pad_num: pad_num
						}));
					}
				}
				else
				{
					if (gameStart && (event.key === "ArrowUp" || event.key === "ArrowDown")) 
					{
						socket.send(JSON.stringify({ 
							type: "move", 
							move: "Stop", 
							pad_num: 0
						}));
					}
					else if (gameStart && (event.key === "w" || event.key === "W" || event.key === "s" || event.key === "S" ))
					{
						socket.send(JSON.stringify({ 
							type: "move", 
							move: "Stop", 
							pad_num: 1
						}));
					}
				}
		}

	function removEventListener(){
		window.removeEventListener("keydown", keyisdown)
		window.removeEventListener("keyup", keyisup)
	}
	

	function renderGame() {
		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	
		// Draw the paddle
		ctx.fillStyle = "#ff0000";
		ctx.fillRect(paddle1.x, paddle1.y, paddle1.w, paddle1.h);
		ctx.fillStyle = "#0095DD";
		ctx.fillRect(paddle2.x, paddle2.y, paddle2.w, paddle2.h);
	
		// Draw the ball
		ctx.beginPath();
		ctx.arc(ballPosition.x, ballPosition.y, ballRadius, 0, Math.PI * 2);
		ctx.fillStyle = "#0095DD";
		ctx.fill();
		ctx.closePath();
		ctx.stroke();
	
	}
	/* ************************************ Abed Changes ******************************************* */
	function thisblur(){
		const freeze = document.querySelector("#freeze");
		freeze.classList.add("unclick");
		const design = document.querySelector("#design");
		design.style.filter = "blur(3px)";
		const games = document.querySelector("#games");
		games.style.filter = "blur(3px)";
		const nav = document.querySelector("#nav");
		nav.style.filter = "blur(3px)";
	}

	function undoblur(){
		freeze.classList.remove("unclick");
		document.querySelector("#design").style.filter = "blur(0px)";
		document.querySelector("#games").style.filter = "blur(0px)";
		document.querySelector("#nav").style.filter = "blur(0px)";
	}

	const handlePlayBtn = () => {
		resetDOM()
		thisblur()
		// const same = document.querySelector(".same-User");
		// same.style.display = "none";
		// --------------------------------- //
		parent.append(header, container);
		bodyElement.append(parent);
		parent.append(header, container, closeBtn);
		header.style.display = "flex";
		container.style.display = "flex";
		parent.style.display = "flex";
		const handleRemoteGame = () => {
			gameType = 'remote';
			container.style.display = "none";
			header.style.display = "none";
			parent.append(app);
			app.style.display = "flex";
			startContainer.classList.add("active");
			startContainer.style.display = "block";
		}

		remote.addEventListener("click", handleRemoteGame);
		const handleTournament = () => {
			startventListener();
			gameType = 'tourn';
			const TournamentContainer = document.querySelector('.container');
			container.style.display = "none";
			header.style.display = "none";
			TournamentContainer.style.display = "flex";
			parent.append(TournamentContainer);
			bracket = rplayers();
			container.style.display = "none";
			header.style.display = "none";
			parent.append(app);
		}
		tournament.addEventListener("click", handleTournament);

		const handleLocaleGame = () => {
			
			gameType = 'local';
			container.style.display = "none";
			header.style.display = "none";
			parent.append(app);
			app.style.display = "flex";
			
			startContainer.classList.add("active");
			startContainer.style.display = "block";
		}
		twoPlayers.addEventListener("click", handleLocaleGame);
		const closeGame = () => {
			resetDOM()
			undoblur();
			parent.style.display = "none";
			startContainer.classList.remove("active");
			startContainer.style.display = "none";
			gameType = "";
			app.style.display = "none";
			counter.classList.add('hide');
	
			nums.forEach(num => {
				num.classList.value = '';
			});
	
			nums[0].classList.add('out');
			// const TournamentContainer2 = document.querySelector('.allbrackets');
			// TournamentContainer2.style.display = "none";
			// const parent = document.querySelector("#choose-mode");
			// parent.append(TournamentContainer2);
			playAgain();
		}

		closeBtn.addEventListener("click", closeGame);
	}

	const playAgain = () =>{
		disconnect();
		document.querySelector(".counter").style.display = "none"
		document.querySelector("#play-again").style.display = "none";
		if (gameType === "tourn")
			document.querySelector('.comingUp').style.display = 'none';
		isTourn = false;
		roomCode = "";
		is_chat = false
		room_is_created = false;
		gameStart = false
		pad_num = 0;
		semi = [];
		final = [];
		bracket = [];
		pmatch = 0;
		matchdata = [];
		game_over.style.display = "none";
		gameContainer.style.display = "none";
		startContainer.classList.add("active");
	    startContainer.style.display = "block";
		const TournamentContainer = document.querySelector('.container');
		TournamentContainer.style.display = "none";
		// if (gameType === "tourn")
		document.querySelector(".comingUp").style.display = "none";
		document.querySelector(".allbrackets").style.display = "none";

	}

    document.querySelector("#play-again").addEventListener("click", playAgain);
	const play_button = document.querySelector("#play-block");
	play_button.addEventListener("click", handlePlayBtn);
	const pingPong = document.querySelector("#ping-pong");
	pingPong.addEventListener("click", handlePlayBtn);

// });
