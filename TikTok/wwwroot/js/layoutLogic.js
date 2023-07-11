let userId = document.cookie.replace(/\D/g, "");
if (userId === "")
    userId = 0;
console.log(userId);

const userProfileBtn = document.querySelector("#user-profile-btn");
const plusBtn = document.querySelector("#plus-btn");

const profilePage = document.querySelector("#profile-popup");
let isProfilePageOpen = false;

//Profile page references
const profileName = profilePage.querySelector("#profile-name");
const profilePostsInfoValue = profilePage.querySelector("#posts-info-value");
const profileCommentsInfoValue = profilePage.querySelector("#comments-info-value");
const profileLikesInfoValue = profilePage.querySelector("#likes-info-value");

const profilePublishedPostsTabBtn = profilePage.querySelector("#published-posts");
const profileSavedPostsTabBtn = profilePage.querySelector("#saved-posts");
const profileLikedPostsTabBtn = profilePage.querySelector("#liked-posts");

const profileLogOutBtn = profilePage.querySelector("#log-out-btn");
const profileLogInScreen = profilePage.querySelector("#log-in-screen");
const logInEmailInputField = profileLogInScreen.querySelector("#email-field");
const logInPasswordInputField = profileLogInScreen.querySelector("#password-field");
const logInBtn = profileLogInScreen.querySelector("#log-in-btn");

userProfileBtn.addEventListener('click', () => {
    isProfilePageOpen = true;
    profilePage.classList.add("active");

    if (userId < 1)
        profileLogInScreen.classList.add("active");
    else
        UpdateProfileInfo();
});

profilePublishedPostsTabBtn.addEventListener("click", () => {
    fetch(`https://localhost:7002/api/post/get/publishedbyuser/${userId}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(posts => PopulateProfilePostGrid(posts))
        .catch(err => console.error(err));
});

profileSavedPostsTabBtn.addEventListener("click", () => {
    console.log("Show users saved posts");
});

profileLikedPostsTabBtn.addEventListener("click", () => {
    fetch(`https://localhost:7002/api/post/get/likedbyuser/${userId}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(posts => PopulateProfilePostGrid(posts))
        .catch(err => console.error(err));
});


const profilePostBoxGrid = document.querySelector("#post-grid");
const profilePostRowTemplate = document.querySelector("#post-box-row-template");
const profilePostImageTemplate = document.querySelector("#post-box-image-template");
function UpdateProfileInfo() {
    fetch(`https://localhost:7002/api/user/get/${userId}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(user => {
            profileName.innerText = user.name;
            profilePostsInfoValue.innerText = user.publishedPostIds.length;
            profileCommentsInfoValue.innerText = user.publishedCommentIds.length;

            fetch(`https://localhost:7002/api/post/get/publishedbyuser/${userId}`, {
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
        row.appendChild(newImage);

        if (i * 2 + 1 < posts.length) {
            const newImage2 = document.importNode(profilePostImageTemplate.content, true);
            newImage2.querySelector("img").src = posts[i * 2 + 1].mediaUrl;
            row.appendChild(newImage2);
        }
    });
}

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
})

//Publishing
const publishPopup = document.querySelector("#publish-popup");
const publishBtn = publishPopup.querySelector(".publish-btn");
const fetchRandomImgBtn = publishPopup.querySelector(".random-photo-btn");
const publishImg = publishPopup.querySelector(".photo");
const captionInputField = publishPopup.querySelector(".caption-input-field");
let isPublishPopupActive = false;

plusBtn.addEventListener('click', () => {
    publishPopup.classList.add("active");
    isPublishPopupActive = true;
});

document.addEventListener("keydown", e => {
    if (e.key === 'Escape') {
        if (isPublishPopupActive) {
            publishPopup.classList.remove("active");
            isPublishPopupActive = false;
        }

        if (isProfilePageOpen) {
            profilePage.classList.remove("active");
            isProfilePageOpen = false;
        }
    }
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
        })
        .catch(err => console.error(err));
});



//Function calls on start
AssignRandomImage();