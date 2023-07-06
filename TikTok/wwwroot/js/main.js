// Right Side
const likeButton = document.querySelector("#like-button");
const commentButton = document.querySelector("#comment-button");
const saveButton = document.querySelector("#save-button");
const shareButton = document.querySelector("#share-button");

// Bottom Side
const userProfileBtn = document.querySelector("#user-profile-btn");
const plusBtn = document.querySelector("#plus-btn");

//Constant string literals
const clickEnabledClassName = "click-enabled";
const clickDisabledClassName = "click-disabled";

likeButton.addEventListener('click', function (e) {
    console.log("Video liked");
    if (!likeButton.classList.contains(clickEnabledClassName)) {
        likeButton.classList.remove(clickDisabledClassName);
        likeButton.classList.add(clickEnabledClassName);
    }
    else {
        likeButton.classList.remove(clickEnabledClassName);
        likeButton.classList.add(clickDisabledClassName);
    }

})

const commentTemplate = document.querySelector("#comment-template");
const commentsList = document.querySelector("#comments-list-wrapper");
const commentInputField = document.querySelector("#comment-input-field");
commentInputField.addEventListener("keydown", e => {
    if (e.key === "Enter" && commentInputField.value !== "") {
        const commentText = commentInputField.value;
        const newComment = document.importNode(commentTemplate.content, true);
        const newCommentProfileName = newComment.querySelector(".profile-name");
        const newCommentText = newComment.querySelector(".comment-text");

        newCommentProfileName.append("BaneCane109");
        newCommentText.textContent = commentText;

        commentsList.appendChild(newComment);
        commentInputField.value = "";
        UpdateCommentCount();
    }
});

const commentSection = document.querySelector("#comment-section-wrapper");
const commentsHeaderNumber = document.querySelector("#comments-number");
let isCommentSectionOpen = false;
commentButton.addEventListener('click', e => {
    console.log("Comments Opened");
    if (!isCommentSectionOpen) {
        UpdateCommentCount();

        commentSection.classList.remove("closed");
        commentSection.classList.add("open");
        isCommentSectionOpen = true;
    }
})

document.addEventListener("click", e => {
    if (isCommentSectionOpen && !e.target.classList.contains("comment-section-element")) {// !== commentSection && e.target !== commentButton) {
        commentSection.classList.remove("open");
        commentSection.classList.add("closed");
        isCommentSectionOpen = false;
    }
});



saveButton.addEventListener('click', function (e) {
    console.log("Saved");

    if (!saveButton.classList.contains(clickEnabledClassName)) {
        saveButton.classList.remove(clickDisabledClassName);
        saveButton.classList.add(clickEnabledClassName);
    }
    else {
        saveButton.classList.remove(clickEnabledClassName);
        saveButton.classList.add(clickDisabledClassName);
    }

})

shareButton.addEventListener('click', function (e) {
    console.log("Shared");
    shareButton.classList.toggle(clickEnabledClassName);
});

userProfileBtn.addEventListener('click', function (e) {
    console.log("Open profile / login");
});

plusBtn.addEventListener('click', function (e) {
    console.log("Publish");
});


function UpdateCommentCount() {
    const comments = document.querySelectorAll(".comment-wrapper");
    commentsHeaderNumber.textContent = "Comments: " + comments.length;
}