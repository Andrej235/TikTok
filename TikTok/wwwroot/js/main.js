//const userId = 1; --- Somehow defined in layoutLogic.js and works here

// Right Side
const likeButtons = document.querySelectorAll(".like-button");
const commentButtons = document.querySelectorAll(".comment-button");
//const saveButton = document.querySelectorAll(".save-button");
//const shareButton = document.querySelectorAll(".share-button");

//Constant string literals
const btnEnabledAnimationClass = "click-enabled";

likeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (userId === undefined || userId == 0) {
            console.log("User has to be logged in to be able to like posts");
            return;
        }

        const apiEndpoint = btn.classList.contains(btnEnabledAnimationClass) ? 'https://localhost:7002/api/post/unlike' : 'https://localhost:7002/api/post/like';
        const options = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                UserId: userId,
                PostId: posts[postShownIndex].id
            })
        };

        fetch(apiEndpoint, options)
            .catch(err => console.error(err));

        btn.classList.contains(btnEnabledAnimationClass) ? UnlikePostVisualUpdate() : posts[postShownIndex].postLikeIds[posts[postShownIndex].postLikeIds.length] = userId;
        btn.classList.toggle(btnEnabledAnimationClass);
    })
})
async function UnlikePostVisualUpdate() {
    posts[postShownIndex].postLikeIds.forEach((id, i) => {
        if (id == userId)
            posts[postShownIndex].postLikeIds[i] = 0;
    })
}

const commentTemplate = document.querySelector("#comment-template");
const commentsList = document.querySelector("#comments-list-wrapper");
const commentInputField = document.querySelector("#comment-input-field");
const commentPublishBtn = document.querySelector("#publish-comment-btn");
commentInputField.addEventListener("keydown", e => {
    if (e.key === "Enter")
        PublishComment();
});

commentPublishBtn.addEventListener("click", () => PublishComment());

function PublishComment() {
    if (commentInputField.value !== "") {
        if (userId === undefined || userId == 0) {
            console.log("User has to be logged in to be able to publish comments");
            return;
        }

        const postId = posts[postShownIndex].id;
        const commentContent = commentInputField.value;

        const options = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
                {
                    "Content": commentContent,
                    "ParentPost":
                    {
                        "Id": postId,
                        "Caption": " ",
                        "MediaUrl": " ",
                        "PostCreator":
                        {
                            "Id": -1,
                            "Name": " ",
                            "Email": " ",
                            "Password": " "
                        }
                    }, "CommentCreator": {
                        "Id": userId,
                        "Name": " ",
                        "Email": " ",
                        "Password": " "
                    }
                })
        };

        fetch('https://localhost:7002/api/comment/publish', options)
            .then(() => {
                commentInputField.value = "";
                UpdateCommentSection()
            })
            .catch(err => console.error(err));
    }
}

const commentSection = document.querySelector("#comment-section-wrapper");
const commentSectionFooter = document.querySelector("#comment-section-footer");
const commentsHeaderNumber = document.querySelector("#comments-number");

commentButtons.forEach(btn => {
    btn.addEventListener('click', e => {
        UpdateCommentSection();
        commentSection.classList.add("open");
        commentSectionFooter.classList.add("open");
    })
})

async function UpdateCommentSection() {
    fetch(`https://localhost:7002/api/comment/post/get/${posts[postShownIndex].id}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(comments => {
            commentsList.innerHTML = "";
            commentsHeaderNumber.textContent = "Comments: " + comments.length;

            comments.forEach(com => {
                const newComment = document.importNode(commentTemplate.content, true);
                const newCommentProfileName = newComment.querySelector(".profile-name");
                const newCommentText = newComment.querySelector(".comment-text");

                fetch(`https://localhost:7002/api/user/get/${com.commentCreatorId}`, {
                    method: 'GET'
                })
                    .then(response => response.json())
                    .then(user => newCommentProfileName.innerText = user.name)
                    .catch(err => console.error(err));

                newCommentText.textContent = com.content;

                commentsList.appendChild(newComment);
            })
        })
        .catch(err => console.error(err));
}

/*saveButton.addEventListener('click', function (e) {
    console.log("Saved");

    if (!saveButton.classList.contains(btnEnabledAnimationClass)) {
        saveButton.classList.remove(clickDisabledClassName);
        saveButton.classList.add(btnEnabledAnimationClass);
    }
    else {
        saveButton.classList.remove(btnEnabledAnimationClass);
        saveButton.classList.add(clickDisabledClassName);
    }
})*/

//shareButton.addEventListener('click', function (e) {
//    console.log("Shared");
//    shareButton.classList.toggle(btnEnabledAnimationClass);
//});



//Scrolling
let mediaWrapper_Previous = document.querySelector(".media-wrapper.previous");
let mediaWrapper_Active = document.querySelector(".media-wrapper.active");
let mediaWrapper_Next = document.querySelector(".media-wrapper.next");

function ShowNextMedia() {
    if (postShownIndex >= posts.length - 1)
        return;
    postShownIndex++;

    const next = mediaWrapper_Next;
    mediaWrapper_Next = mediaWrapper_Previous;
    mediaWrapper_Previous = mediaWrapper_Active;
    mediaWrapper_Active = next;

    mediaWrapper_Next.classList.remove("previous");
    mediaWrapper_Next.classList.add("next");

    mediaWrapper_Active.classList.remove("next");
    mediaWrapper_Active.classList.add("active");

    mediaWrapper_Previous.classList.remove("active");
    mediaWrapper_Previous.classList.add("previous");

    const postId = postShownIndex + 1 < posts.length ? postShownIndex + 1 : 0;
    mediaWrapper_Next.querySelector(".photo").src = posts[postId].mediaUrl;
    UpdateLikeOnCurrentPost();
}

function ShowPreviousMedia() {
    if (postShownIndex <= 0)
        return;
    postShownIndex--;

    const next = mediaWrapper_Next;
    mediaWrapper_Next = mediaWrapper_Active;
    mediaWrapper_Active = mediaWrapper_Previous;
    mediaWrapper_Previous = next;

    mediaWrapper_Next.classList.remove("active");
    mediaWrapper_Next.classList.add("next");

    mediaWrapper_Active.classList.remove("previous");
    mediaWrapper_Active.classList.add("active");

    mediaWrapper_Previous.classList.remove("next");
    mediaWrapper_Previous.classList.add("previous");

    const postId = postShownIndex - 1 > 0 ? postShownIndex - 1 : 0;
    mediaWrapper_Previous.querySelector(".photo").src = posts[postId].mediaUrl;
    UpdateLikeOnCurrentPost();
}

const posts = [];
let postShownIndex = 0;
async function GetAllPosts() {
    const options = { method: 'GET' };

    return fetch('https://localhost:7002/api/post/getall', options)
        .then(response => response.json())
        .then(response => {
            response.forEach((post, i) => {
                posts[i] = post;
            });
            console.log(posts);
            UpdateLikeOnCurrentPost();
        })
        .catch(err => console.error(err));
}

async function UpdateLikeOnCurrentPost() {
    if (userId === undefined || userId == 0)
        return;

    let isLiked = false;
    for (var i = 0; i < posts[postShownIndex].postLikeIds.length; i++) {
        if (posts[postShownIndex].postLikeIds[i] == userId) {
            isLiked = true;
            break;
        }
    }

    if (isLiked)
        mediaWrapper_Active.querySelector(".like-button").classList.add(btnEnabledAnimationClass);
    else
        mediaWrapper_Active.querySelector(".like-button").classList.remove(btnEnabledAnimationClass);
}



//Document event listeners and calling of main functions
document.addEventListener("click", e => {
    if (!e.target.classList.contains("comment-section-element")) {
        commentSection.classList.remove("open");
        commentSectionFooter.classList.remove("open");
    }
});

document.addEventListener("keydown", e => {
    if (e.key === 'Escape') {
        commentSection.classList.remove("open");
        commentSectionFooter.classList.remove("open");
    }
    else if (e.key === 'ArrowDown') {
        ShowNextMedia();
    }
    else if (e.key === 'ArrowUp') {
        ShowPreviousMedia();
    }
});

GetAllPosts().then(() => {
    mediaWrapper_Previous.querySelector(".photo").src = posts[0].mediaUrl;
    mediaWrapper_Active.querySelector(".photo").src = posts[0].mediaUrl;
    mediaWrapper_Next.querySelector(".photo").src = posts[1].mediaUrl;
});