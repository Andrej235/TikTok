import { EnterSpecialState_UpdatePost as UpdateSpecialPost, ExitSpecialState_UpdatePost as CloseSpecialPost, getSpecialPost } from '/js/main.js'

let userId = document.cookie.replace(/\D/g, "");
export let getUserId = () => userId;
if (userId === "")
    userId = 0;

let isInSpecialPostOpenState = false;
export let getIsInSpecialPostOpenState = () => isInSpecialPostOpenState;



//Prevent tab from changing focus
window.addEventListener('keydown', function (event) {
    if (event.key == 'Tab') {
        event.preventDefault();
    }
});


const userProfileBtn = document.querySelector("#user-profile-btn");
const openPublishPopupBtn = document.querySelector("#plus-btn");

const profilePage = document.querySelector("#profile-popup");
let isProfilePageOpen = false;

//Profile page references
const profileName = profilePage.querySelector("#profile-name");
const profilePostsInfoValue = profilePage.querySelector("#posts-info-value");
const profileCommentsInfoValue = profilePage.querySelector("#comments-info-value");
const profileLikesInfoValue = profilePage.querySelector("#likes-info-value");

const profilePublishedPostsTabBtn = profilePage.querySelector("#published-posts");
const profileLikedPostsTabBtn = profilePage.querySelector("#liked-posts");

const profileLogOutBtn = profilePage.querySelector("#log-out-btn");
const profileLogInScreen = profilePage.querySelector("#log-in-screen");
const logInEmailInputField = profileLogInScreen.querySelector("#email-field");
const logInPasswordInputField = profileLogInScreen.querySelector("#password-field");
const logInBtn = profileLogInScreen.querySelector("#log-in-btn");

let registerFieldsActive = false;
const logInPageStateChageBtn = profileLogInScreen.querySelector("#register-change-state-btn");
const registerNameInputField = profileLogInScreen.querySelector("#name-field");
const registerRepeatPasswordInputField = profileLogInScreen.querySelector("#repeat-password-field");
const logInTitle = profileLogInScreen.querySelector("#log-in-title");

//Profile page
userProfileBtn.addEventListener('click', () => {
    if (isInSpecialPostOpenState)
        ExitSpecialState();

    if (userId < 1)
        profileLogInScreen.classList.add("active");
    else
        OpenUserProfile(userId, true);
});

profilePublishedPostsTabBtn.addEventListener("click", () => {
    fetch(`https://localhost:7002/api/post/get/publishedbyuser/${userId}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(posts => PopulateProfilePostGrid(posts))
        .catch(err => console.error(err));
});

profileLikedPostsTabBtn.addEventListener("click", () => {
    fetch(`https://localhost:7002/api/post/get/likedbyuser/${userId}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(posts => PopulateProfilePostGrid(posts))
        .catch(err => console.error(err));
});

export function OpenUserProfile(id = 0, showExtraMenus = false) {
    if (id < 1)
        return;

    if (showExtraMenus) {
        openPublishPopupBtn.classList.add("active");
        profileLikedPostsTabBtn.classList.add("active");
    }
    else {
        openPublishPopupBtn.classList.remove("active");
        profileLikedPostsTabBtn.classList.remove("active");
    }

    isProfilePageOpen = true;
    profilePage.classList.add("active");
    UpdateProfileInfo(id);
}

const profilePostBoxGrid = document.querySelector("#post-grid");
const profilePostRowTemplate = document.querySelector("#post-box-row-template");
const profilePostImageTemplate = document.querySelector("#post-box-image-template");
function UpdateProfileInfo(id = 0) {
    fetch(`https://localhost:7002/api/user/get/${id}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(user => {
            profileName.innerText = user.name;
            profilePostsInfoValue.innerText = user.publishedPostIds.length;
            profileCommentsInfoValue.innerText = user.publishedCommentIds.length;

            fetch(`https://localhost:7002/api/post/get/publishedbyuser/${id}`, {
                method: 'GET'
            })
                .then(response => response.json())
                .then(posts => {
                    PopulateProfilePostGrid(posts);

                    let numberOfLikesUserReceivedOnPosts = 0;
                    posts.forEach(post => {
                        numberOfLikesUserReceivedOnPosts += post.postLikeIds.length;
                    });
                    profileLikesInfoValue.innerText = numberOfLikesUserReceivedOnPosts;
                })
                .catch(err => console.error(err));
        })
        .catch(err => console.error(err));
}

function PopulateProfilePostGrid(posts) {
    profilePostBoxGrid.innerHTML = "";
    const numberOfPosts = posts.length;
    for (var i = 0; i < numberOfPosts / 2; i++) {
        const newRow = document.importNode(profilePostRowTemplate.content, true);
        profilePostBoxGrid.appendChild(newRow);
    }

    const postRows = profilePostBoxGrid.querySelectorAll(".post-box-row");
    postRows.forEach((row, i) => {

        const newImage = document.importNode(profilePostImageTemplate.content, true);
        newImage.querySelector("img").src = posts[i * 2].mediaUrl;
        newImage.querySelector("img").addEventListener("click", () => OpenSpecificPost(posts[i * 2].id));
        row.appendChild(newImage);

        if (i * 2 + 1 < posts.length) {
            const newImage2 = document.importNode(profilePostImageTemplate.content, true);
            newImage2.querySelector("img").src = posts[i * 2 + 1].mediaUrl;
            newImage2.querySelector("img").addEventListener("click", () => OpenSpecificPost(posts[i * 2 + 1].id));
            row.appendChild(newImage2);
        }
    });
}

function OpenSpecificPost(id = 0) {
    if (id < 1 || isInSpecialPostOpenState)
        return;

    isInSpecialPostOpenState = true;
    profilePage.classList.remove("active");
    UpdateSpecialPost(id);
}

const postDeleteBtn = document.querySelector("#post-delete-btn");
export function ToggleDeleteBtn(state) {
    if (state == undefined)
        postDeleteBtn.classList.toggle("active");

    state ? postDeleteBtn.classList.add("active") : postDeleteBtn.classList.remove("active");
}
postDeleteBtn.addEventListener("click", () => {
    fetch(`https://localhost:7002/api/post/delete/${getSpecialPost().id}`, {
        method: 'DELETE'
    })
        .then(() => ExitSpecialState())
        .catch(err => console.error(err));
        //TODO: updating like button doesn't work when entering special state + when a post is deleted it doesn't dissapear from user profile before refreshing it
});

export function ExitSpecialState() {
    CloseSpecialPost();
    profilePage.classList.add("active");
    isInSpecialPostOpenState = false;
}


//Log in
profileLogOutBtn.addEventListener("click", () => {
    console.log("Logged out");
    document.cookie = `userId = 0`;
    userId = 0;
    profileLogInScreen.classList.add("active");
});

logInBtn.addEventListener("click", () => {
    if (userId != 0) {
        console.log(`Already logged in as id: ${userId}.`);
        return;
    }
    if (!registerFieldsActive) {
        if (logInEmailInputField.value !== "" && logInPasswordInputField.value !== "") {

            const options = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Email: logInEmailInputField.value,
                    Password: logInPasswordInputField.value
                })
            };

            fetch('https://localhost:7002/api/user/login', options)
                .then(response => response.json())
                .then(id => {
                    if (id === 0) {
                        console.log("Invalid login info");
                        return;
                    }

                    userId = id;
                    document.cookie = `userId = ${id}`;
                    console.log("Logged in");
                    console.log(id)
                    profileLogInScreen.classList.remove("active");
                    UpdateProfileInfo();
                    GetAllPosts();
                })
                .catch(err => console.error(err));
        }
    }
    else {
        if (registerNameInputField.value !== "" && logInEmailInputField.value !== "" && logInPasswordInputField.value !== "" && logInPasswordInputField.value === registerRepeatPasswordInputField.value) {
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Name: registerNameInputField.value,
                    Email: logInEmailInputField.value,
                    Password: logInPasswordInputField.value
                })
            };

            fetch('https://localhost:7002/api/user/create', options)
                .then(response => response.json())
                .then(user => {
                    if (user.id === undefined) {
                        console.log(logInEmailInputField.value);
                        return;
                    }
                    else {
                        console.log("Registered");
                    }
                    userId = user.id;
                    document.cookie = `userId = ${user.id}`;
                    console.log(user.id)
                    profileLogInScreen.classList.remove("active");
                    UpdateProfileInfo();
                    GetAllPosts();
                })
                .catch(err => console.error(err));
        }
    }
})

logInPageStateChageBtn.addEventListener("click", () => {
    registerFieldsActive = !registerFieldsActive;
    logInBtn.querySelector("h1").innerText = registerFieldsActive ? "Register" : "Login";
    logInTitle.innerText = registerFieldsActive ? "Register" : "Login";
    logInPageStateChageBtn.innerText = registerFieldsActive ? "Login" : "Register";
    registerNameInputField.classList.toggle("active");
    registerRepeatPasswordInputField.classList.toggle("active");
});

//Publishing
const publishPopup = document.querySelector("#publish-popup");
const publishBtn = publishPopup.querySelector(".publish-btn");
const fetchRandomImgBtn = publishPopup.querySelector(".random-photo-btn");
const publishImg = publishPopup.querySelector(".photo");
const captionInputField = publishPopup.querySelector(".caption-input-field");
let isPublishPopupActive = false;

openPublishPopupBtn.addEventListener('click', () => {
    publishPopup.classList.add("active");
    isPublishPopupActive = true;
});

let isFetchingImage = false;
fetchRandomImgBtn.addEventListener("click", () => {
    if (!isFetchingImage)
        AssignRandomImage();
});

function AssignRandomImage() {
    isFetchingImage = true;
    fetch('https://picsum.photos/1080/1920', {
        method: "GET"
    })
        .then(res => {
            publishImg.src = res.url;
            isFetchingImage = false;
        })
        .catch(err => console.error(err));
}

//Publish button logic
publishBtn.addEventListener('click', () => {
    if (userId === undefined || userId == 0) {
        console.log("User has to be logged in to be able to publish posts");
        return;
    }

    const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
            {
                "Caption": captionInputField.value,
                "MediaUrl": publishImg.src,
                "PostCreator": {
                    "Id": userId,
                    "Name": " ",
                    "Email": " ",
                    "Password": " "
                }
            }
        )
    };

    fetch('https://localhost:7002/api/post/publish', options)
        .then(() => {
            publishPopup.classList.remove("active");
            isPublishPopupActive = false;
            captionInputField.value = "";
            AssignRandomImage();
            UpdateProfileInfo(userId);
        })
        .catch(err => console.error(err));
});



document.addEventListener("keydown", e => {
    if (e.key === 'Escape') {
        if (isInSpecialPostOpenState) {
            ExitSpecialState();
        }
        else if (isPublishPopupActive) {
            publishPopup.classList.remove("active");
            isPublishPopupActive = false;
        } else if (isProfilePageOpen) {
            profilePage.classList.remove("active");
            isProfilePageOpen = false;
        }
    }
});



//Function calls on start
AssignRandomImage();