// let username = '';
// let defaultName = username || 'Stranger';
// console.log(defaultName); // Prints: Stranger

// add styled class to the clicked button (.nav-button) in #nav
const sideBtns = document.querySelectorAll(".nav-button");
sideBtns[0].classList.add('link');

sideBtns.forEach ((sideBtn)=> {
    sideBtn.addEventListener("click", (event)=> {
        sideBtns.forEach (sideBtn => {sideBtn.classList.remove('link')});
        sideBtn.classList.add('link');
    })
});

// switch from login to home page.
// const loginBtn = document.querySelector(".login-btn");
// const loginPart = document.querySelector("#login-parent");
// const navBar = document.querySelector("#nav");
// const mainPart = document.querySelector("#main");
// const profilePart = document.querySelector("#profile-part");
// const chatPart = document.querySelector("#chat-part");
// const setting = document.querySelector("#setting-part");
// const friends = document.querySelector("#friends-part");

// loginBtn.addEventListener("click", ()=> {
//     navBar.style.display = "flex";
//     mainPart.style.display = "block";
//     loginPart.style.display = "none";
// })

// // switch from home to login page.
// const logoutBtn = document.querySelector("#logout");
// logoutBtn.addEventListener("click", ()=> {
//     setting.style.display = "none";
//     chatPart.style.display = "none";
//     profilePart.style.display = "none";
//     navBar.style.display = "none";
//     mainPart.style.display = "none";
//     friends.style.display = "none";
//     loginPart.style.display = "flex";
// })