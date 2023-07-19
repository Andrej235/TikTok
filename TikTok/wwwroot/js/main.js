import { getUserId as GetUserId, getIsInSpecialPostOpenState as GetSpecialState, OpenUserProfile, ExitSpecialState, ToggleDeleteBtn } from '/js/layoutLogic.js'

// Right Side
const likeButtons = document.querySelectorAll(".like-button");
const commentButtons = document.querySelectorAll(".comment-button");
const shareButtons = document.querySelectorAll(".share-button");

//Constant string literals
const btnEnabledAnimationClass = "click-enabled";

//Likes
likeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (GetUserId() === undefined || GetUserId() == 0) {
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
                UserId: GetUserId(),
                PostId: posts[postShownIndex].id
            })
        };

        fetch(apiEndpoint, options)
            .catch(err => console.error(err));

        btn.classList.contains(btnEnabledAnimationClass) ? posts[postShownIndex].postLikeIds.splice(posts.indexOf(GetUserId()), 1) : posts[postShownIndex].postLikeIds[posts[postShownIndex].postLikeIds.length] = GetUserId();
        mediaWrapper_Active.querySelector(".number-of-likes-post").innerText = posts[postShownIndex].postLikeIds.length;
        btn.classList.toggle(btnEnabledAnimationClass);
    })
})

//Comments
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
        if (GetUserId() === undefined || GetUserId() == 0) {
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
                        "Id": GetUserId(),
                        "Name": " ",
                        "Email": " ",
                        "Password": " "
                    }
                })
        };

        fetch('https://localhost:7002/api/comment/publish', options)
            .then(res => res.json())
            .then(com => {
                commentInputField.value = "";
                posts[postShownIndex].postCommentIds[posts[postShownIndex].postCommentIds.length] = com.id;
                UpdateCommentSection();
            })
            .catch(err => console.error(err));
    }
}

const commentSection = document.querySelector("#comment-section-wrapper");
const commentSectionFooter = document.querySelector("#comment-section-footer");
const commentsHeaderNumber = document.querySelector("#comments-number");
let isCommentSectionOpen = false;

commentButtons.forEach(btn => {
    btn.addEventListener('click', e => {
        UpdateCommentSection();
        isCommentSectionOpen = true;
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
            const commentsLikeIds = comments.map(c => c.commentLikeIds);
            commentsList.innerHTML = "";
            commentsHeaderNumber.textContent = "Comments: " + comments.length;

            comments.forEach((com, i) => {
                const newComment = document.importNode(commentTemplate.content, true);
                const newCommentDOMId = `comment-id${com.id}`;
                newComment.querySelector(".comment-wrapper").id = newCommentDOMId;

                const newCommentProfileName = newComment.querySelector(".profile-name");

                if (com.isEdited)
                    newCommentProfileName.classList.add("edited");

                fetch(`https://localhost:7002/api/user/get/${com.commentCreatorId}`, {
                    method: 'GET'
                })
                    .then(response => response.json())
                    .then(user => newCommentProfileName.innerText = user.name)
                    .catch(err => console.error(err));


                fetch('https://localhost:7002/api/post/get/3', {
                    method: 'GET'
                })
                    .then(response => response.json())
                    .then(parentPost => {
                        if (commentsLikeIds[i].includes(parentPost.postCreatorId))
                            newCommentProfileName.classList.add("liked-by-post-creator");
                    })
                    .catch(err => console.error(err));


                const newCommentLikeBtn = newComment.querySelector(".comment-like-btn");
                for (var j = 0; j < commentsLikeIds[i].length; j++) {
                    if (commentsLikeIds[i][j] == GetUserId()) {
                        newCommentLikeBtn.classList.add(btnEnabledAnimationClass);
                        break;
                    }
                }

                newCommentLikeBtn.addEventListener("click", () => {
                    newCommentLikeBtn.classList.toggle(btnEnabledAnimationClass);
                    const options = {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            UserId: GetUserId(),
                            CommentId: com.id
                        })
                    };

                    const isLiking = newCommentLikeBtn.classList.contains(btnEnabledAnimationClass);
                    fetch(`https://localhost:7002/api/comment/${isLiking ? "like" : "unlike"}`, options)
                        .then(() => {
                            const likesTextContent = newCommentLikeBtn.querySelector("h1").textContent;
                            let numOfLikes = !isNaN(parseInt(likesTextContent)) ? parseInt(likesTextContent) : 0;

                            numOfLikes = isNaN(numOfLikes) ? 0 :
                                isLiking ? numOfLikes + 1 : numOfLikes - 1;

                            newCommentLikeBtn.querySelector("h1").textContent = numOfLikes !== 0 ? numOfLikes : "";

                            fetch(`https://localhost:7002/api/post/get/${posts[postShownIndex].id}`, {
                                method: 'GET'
                            })
                                .then(response => response.json())
                                .then(parentPost => {
                                    if (parentPost.postCreatorId == GetUserId())
                                        if (isLiking)
                                            newCommentProfileName.classList.add("liked-by-post-creator");
                                        else
                                            newCommentProfileName.classList.remove("liked-by-post-creator");
                                })
                                .catch(err => console.error(err));
                        })
                        .catch(err => console.error(err));
                });

                const newCommentContent = newComment.querySelector(".comment-text");
                newCommentLikeBtn.querySelector("h1").textContent = commentsLikeIds[i].length > 0 ? commentsLikeIds[i].length : "";
                newCommentContent.textContent = com.content;

                const newCommentEditBtn = newComment.querySelector(".comment-edit-btn");
                const newCommentDeleteBtn = newComment.querySelector(".comment-delete-btn");

                if (com.commentCreatorId == GetUserId()) {
                    newCommentEditBtn.classList.add("active");

                    //Editing
                    const uneditedComment = newCommentContent.innerText;
                    newCommentEditBtn.addEventListener("click", () => {
                        if (newCommentContent.contentEditable != 'true') {
                            //console.log("Edit comment " + com.id);
                            newCommentContent.contentEditable = true;
                            newCommentDeleteBtn.classList.add("active");
                        }
                        else {
                            newCommentDeleteBtn.classList.remove("active");
                            if (newCommentContent.innerText !== uneditedComment) {
                                //console.log("User edited their comment");

                                const options = {
                                    method: 'PUT',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        Value: newCommentContent.innerText
                                    })
                                };

                                fetch(`https://localhost:7002/api/comment/edit/${com.id}`, options)
                                    .then(response => response.json())
                                    .then(response => {
                                        newCommentProfileName.classList.add("edited");
                                        console.log(response)
                                    })
                                    .catch(err => console.error(err));
                            }
                            else {
                                console.log("User canceled editing their comment");
                            }
                            newCommentContent.contentEditable = false;
                        }
                    });
                }

                commentsList.appendChild(newComment);

                //Deleting
                newCommentDeleteBtn.addEventListener("click", () => {
                    fetch(`https://localhost:7002/api/comment/delete/${com.id}`, {
                        method: 'DELETE'
                    })
                        .then(() => {
                            posts[postShownIndex].postCommentIds.splice(posts[postShownIndex].postCommentIds.indexOf(com.id), 1);
                            commentsList.querySelector(`#${newCommentDOMId}`).remove()
                        })
                        .catch(err => console.error(err));
                })

            })
        })
        .catch(err => console.error(err));
}

//Sharing
let isSharingOnCooldown = false;
const sharedPopup = document.querySelector("#share-popup");
shareButtons.forEach(btn => {
    btn.addEventListener("click", e => {
        if (isSharingOnCooldown)
            return;

        isSharingOnCooldown = true;
        navigator.clipboard.writeText(posts[postShownIndex].mediaUrl);
        btn.classList.add("active");

        fetch(`https://localhost:7002/api/post/addshare/${!GetSpecialState() ? posts[postShownIndex].id : specialPost.id}`, {
            method: 'PUT'
        })
            .catch(err => console.error(err));

        if (!GetSpecialState()) {
            posts[postShownIndex].postNumberOfShares++;
            UpdateButtonsOnCurrentPost();
        }
        else {
            specialPost.postNumberOfShares++;
            UpdateButtonsOnCurrentPost(specialPost);
        }

        setTimeout(() => {
            btn.classList.remove("active");
        }, 125);

        setTimeout(() => {
            isSharingOnCooldown = false;
        }, 250);
    });
});



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

    if (posts[postId].caption !== "") {
        mediaWrapper_Next.querySelector(".caption-wrapper").classList.add("active");
        mediaWrapper_Next.querySelector(".caption-content").innerText = posts[postId].caption;
    }
    else {
        mediaWrapper_Next.querySelector(".caption-wrapper").classList.remove("active");
        mediaWrapper_Next.querySelector(".caption-content").innerText = "";
    }

    UpdatePostCreatorName(posts[postId].postCreatorId);
    UpdateButtonsOnCurrentPost();
}

async function UpdatePostCreatorName(userId = 0, mediaWrapper = mediaWrapper_Next) {
    fetch(`https://localhost:7002/api/user/get/${userId}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(user => mediaWrapper.querySelector(".caption-creator-name").innerText = user.name)
        .catch(err => console.error(err));
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

    if (posts[postId].caption !== "") {
        mediaWrapper_Previous.querySelector(".caption-wrapper").classList.add("active");
        mediaWrapper_Previous.querySelector(".caption-content").innerText = posts[postId].caption;
    }
    else {
        mediaWrapper_Previous.querySelector(".caption-wrapper").classList.remove("active");
        mediaWrapper_Previous.querySelector(".caption-content").innerText = "";
    }

    UpdatePostCreatorName(posts[postId].postCreatorId, mediaWrapper_Previous);
    UpdateButtonsOnCurrentPost();
}

async function UpdateButtonsOnCurrentPost(post = posts[postShownIndex]) {
    const isLiked = GetUserId() != undefined && GetUserId() != 0 && post.postLikeIds.includes(parseInt(GetUserId()));

    if (isLiked)
        mediaWrapper_Active.querySelector(".like-button").classList.add(btnEnabledAnimationClass);
    else
        mediaWrapper_Active.querySelector(".like-button").classList.remove(btnEnabledAnimationClass);

    mediaWrapper_Active.querySelector(".number-of-likes-post").innerText = post.postLikeIds.length;
    mediaWrapper_Active.querySelector(".number-of-comments-post").innerText = post.postCommentIds.length;
    mediaWrapper_Active.querySelector(".number-of-shares-post").innerText = post.postNumberOfShares;//posts[postId].postCommentIds.length;

    mediaWrapper_Active.querySelector(".caption-creator-name").removeEventListener("click", OpenPostCreatorsProfile);
    mediaWrapper_Active.querySelector(".caption-creator-name").addEventListener("click", OpenPostCreatorsProfile);
}

function OpenPostCreatorsProfile() {
    console.log(`Open user profile ${posts[postShownIndex].postCreatorId}`);

    if (!GetSpecialState())
        OpenUserProfile(posts[postShownIndex].postCreatorId);
    else {
        OpenUserProfile(specialPost.postCreatorId);
        ExitSpecialState();
    }
}

//Document event listeners and calling of main functions
document.addEventListener("click", e => {
    if (isCommentSectionOpen && !e.target.classList.contains("comment-section-element")) {
        commentSection.classList.remove("open");
        commentSectionFooter.classList.remove("open");
        mediaWrapper_Active.querySelector(".number-of-comments-post").innerText = posts[postShownIndex].postCommentIds.length;
    }
});

document.addEventListener("keydown", e => {
    if (isCommentSectionOpen && e.key === 'Escape') {
        commentSection.classList.remove("open");
        commentSectionFooter.classList.remove("open");
        mediaWrapper_Active.querySelector(".number-of-comments-post").innerText = posts[postShownIndex].postCommentIds.length;
    }
    else if (e.key === 'ArrowDown' && !GetSpecialState()) {
        ShowNextMedia();
    }
    else if (e.key === 'ArrowUp' && !GetSpecialState()) {
        ShowPreviousMedia();
    }
});

GetAllPosts().then(() => {
    mediaWrapper_Previous.querySelector(".photo").src = posts[0].mediaUrl;

    mediaWrapper_Active.querySelector(".photo").src = posts[0].mediaUrl;

    mediaWrapper_Next.querySelector(".photo").src = posts[1].mediaUrl;
    mediaWrapper_Next.querySelector(".caption-content").innerText = posts[1].caption;

    UpdatePostCreatorName(posts[0].postCreatorId, mediaWrapper_Active);
    UpdatePostCreatorName(posts[0].postCreatorId);

    if (posts[0].caption != "") {
        mediaWrapper_Active.querySelector(".caption-wrapper").classList.add("active");
        mediaWrapper_Active.querySelector(".caption-content").innerText = posts[0].caption;
    }
    else
        mediaWrapper_Active.querySelector(".caption-wrapper").classList.remove("active");

    if (posts[1].caption != "") {
        mediaWrapper_Next.querySelector(".caption-wrapper").classList.add("active");
        mediaWrapper_Next.querySelector(".caption-content").innerText = posts[0].caption;
    }
    else
        mediaWrapper_Next.querySelector(".caption-wrapper").classList.remove("active");
});

//Exports
let specialPost;
export let getSpecialPost = () => specialPost;
export function EnterSpecialState_UpdatePost(id = 0) {
    if (id == 0)
        return;

    GetAllPosts()
        .then(() => {
            specialPost = posts[posts.map(p => p.id).indexOf(id)];
            //console.log(specialPost);

            mediaWrapper_Active.querySelector(".photo").src = specialPost.mediaUrl;

            if (specialPost.caption !== "") {
                mediaWrapper_Active.querySelector(".caption-wrapper").classList.add("active");
                mediaWrapper_Active.querySelector(".caption-content").innerText = specialPost.caption;
            }
            else {
                mediaWrapper_Active.querySelector(".caption-wrapper").classList.remove("active");
                mediaWrapper_Active.querySelector(".caption-content").innerText = "";
            }

            UpdatePostCreatorName(specialPost.postCreatorId, mediaWrapper_Active);
            UpdateButtonsOnCurrentPost(specialPost);
            if (specialPost.postCreatorId == GetUserId()) {
                ToggleDeleteBtn(true);
            }
        })
}

export function ExitSpecialState_UpdatePost() {
    const post = posts[postShownIndex];

    setTimeout(() => {
        mediaWrapper_Active.querySelector(".photo").src = post.mediaUrl;
        if (post.caption !== "") {
            mediaWrapper_Active.querySelector(".caption-wrapper").classList.add("active");
            mediaWrapper_Active.querySelector(".caption-content").innerText = post.caption;
        }
        else {
            mediaWrapper_Active.querySelector(".caption-wrapper").classList.remove("active");
            mediaWrapper_Active.querySelector(".caption-content").innerText = "";
        }

        UpdatePostCreatorName(post.postCreatorId, mediaWrapper_Active);
        UpdateButtonsOnCurrentPost(post);
    }, 250)

    if (post.postCreatorId == GetUserId()) {
        ToggleDeleteBtn(false);
    }
}

const posts = [];
let postShownIndex = 0;
export async function GetAllPosts() {
    const options = { method: 'GET' };

    return fetch('https://localhost:7002/api/post/getall', options)
        .then(response => response.json())
        .then(response => {
            response.forEach((post, i) => {
                posts[i] = post;
            });
            //console.log(posts);
            UpdateButtonsOnCurrentPost();
        })
        .catch(err => console.error(err));
}