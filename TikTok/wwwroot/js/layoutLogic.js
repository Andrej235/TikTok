const userId = 1; //TODO --- Change to be actuall user ID



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

profilePublishedPostsTabBtn.addEventListener("click", () => {
    console.log("Show users published posts");
});

profileSavedPostsTabBtn.addEventListener("click", () => {
    console.log("Show users saved posts");
});

profileLikedPostsTabBtn.addEventListener("click", () => {
    console.log("Show users liked posts");
});

userProfileBtn.addEventListener('click', () => {
    isProfilePageOpen = true;
    profilePage.classList.add("active");
    UpdateProfileInfo();
});

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
                    let numberOfLikesUserReceivedOnPosts = 0;
                    posts.forEach(post => {
                        numberOfLikesUserReceivedOnPosts += post.postLikeIds.length;
                    });

                    //TODO: Check if it works after adding the liking system and maybe add 
                    //number of likes user received on comments on this number as well
                    profileLikesInfoValue.innerText = numberOfLikesUserReceivedOnPosts;
                    console.log(posts);
                })
                .catch(err => console.error(err));

            console.log(user)
        })
        .catch(err => console.error(err));
}



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
    if (e.key === 'Escape' && isPublishPopupActive) {
        publishPopup.classList.remove("active");
        isPublishPopupActive = false;
    }

    if (e.key === 'Escape' && isProfilePageOpen) {
        isProfilePageOpen = false;
        profilePage.classList.remove("active");
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