// check login status on page load
window.onload = async function () {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("snapUser"));
  } catch (e) {
    console.error("Invalid JSON in localStorage for snapUser");
  }

  const signupBtn = document.getElementById("signupBtn");
  const profileMenu = document.getElementById("profileMenu");
  const usernameDisplay = document.getElementById("usernameDisplay");

  if (user && user.name) {
    signupBtn.style.display = "none";
    profileMenu.style.display = "block";

    document.querySelector(".profile-btn").innerHTML = `
    <img src="${
      user.profileImage || "https://i.pravatar.cc/40"
    }" class="nav-avatar" />
    My Profile
  `;
    // Inject actual username into the dropdown
    const usernameDisplay = document.getElementById("usernameDisplay");
    usernameDisplay.textContent = `Welcome, ${user.name}`;
  } else {
    signupBtn.style.display = "inline-block";
    profileMenu.style.display = "none";
  }

  // Fetch and display posts
  try {
    const res = await fetch("https://codealpha-snaptalk-1.onrender.com/api/posts"); // Adjust the URL if needed
    const posts = await res.json();
    displayPosts(posts);
  } catch (err) {
    console.error("Failed to load posts:", err);
  }
};

function displayPosts(posts) {
  const snapUser = JSON.parse(localStorage.getItem("snapUser"));
  const feed = document.querySelector(".feed");
  feed.innerHTML = "";

  posts.forEach((post) => {
    const posterId = post.postedBy?._id;
    const isFollowing = snapUser?.following?.includes(posterId);
    const isLiked = post.likes?.includes(snapUser?.id);
    const likeCount = post.likes?.length || 0;
    const followText = isFollowing ? "Unfollow" : "Follow";
    const likeClass = isLiked ? "fa-solid liked" : "fa-regular";

    const commentsHTML =
      post.comments
        ?.map(
          (c) =>
            `<li><strong>${c.commentedBy?.name || "Anonymous"}:</strong> ${
              c.text
            }</li>`
        )
        .join("") || "";

    const postHTML = `
      <div class="post">
        <div class="post-header">
<img src="${
      post.postedBy?.profileImage || "https://i.pravatar.cc/40"
    }" class="avatar" />
          <span class="username">${post.postedBy?.name || "Anonymous"}</span>
          ${
            snapUser?.id !== posterId
              ? `<button class="follow-btn" onclick="toggleFollow(this, '${posterId}')">${followText}</button>`
              : ""
          }
        </div>

        <p class="caption">${post.caption || ""}</p>

        <img src="data:image/jpeg;base64,${post.image}" class="post-image" />

        <div class="post-action">
          <div class="like-wrapper">
            <i class="fa-heart like-icon ${likeClass}" onclick="likePost(this, '${
      post._id
    }')"></i>
            <span class="like-count">${likeCount}</span>
          </div>

          <div class="comment-wrapper">
            <i class="fa-regular fa-comment" onclick="toggleCommentBox(this)"></i>
            Comment
          </div>

          <div class="comment-box" style="display: none">
            <input type="text" class="comment-input" placeholder="Write a comment..." />
            <button onclick="addComment(this, '${post._id}')">Post</button>
          </div>

          <ul class="comments">${commentsHTML}</ul>
        </div>
      </div>
    `;

    feed.insertAdjacentHTML("beforeend", postHTML);
  });
}

// toggle dropdown
function toggleDropdown() {
  const menu = document.getElementById("dropDownMenu");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// logout
function logout() {
  localStorage.removeItem("snapUser");
  location.reload();
}

function likePost(icon, postId) {
  const isLiked = icon.classList.contains("liked");
  const token = localStorage.getItem("token");
  const url = `https://codealpha-snaptalk-1.onrender.com/api/posts/${postId}/${
    isLiked ? "unlike" : "like"
  }`;

  axios
    .post(url, {}, { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => {
      icon.classList.toggle("liked");
      icon.classList.toggle("fa-solid");
      icon.classList.toggle("fa-regular");
      const countSpan = icon.parentElement.querySelector(".like-count");
      countSpan.textContent = res.data.likes.length;
    })
    .catch((err) => console.error("Like/unlike error:", err));
}

function addComment(btn, postId) {
  const post = btn.closest(".post");
  const input = post.querySelector(".comment-input");
  const comment = input.value.trim();
  const token = localStorage.getItem("token");

  if (!comment) return;

  axios
    .post(
      `https://codealpha-snaptalk-1.onrender.com/api/posts/${postId}/comment`,
      { text: comment },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    .then((res) => {
      const commentList = post.querySelector(".comments");
      const newComment = `<li><strong>${
        res.data.comments.at(-1)?.commentedBy?.name
      }:</strong> ${comment}</li>`;
      commentList.insertAdjacentHTML("beforeend", newComment);
      input.value = "";
    })
    .catch((err) => console.error("Comment error:", err));
}

function toggleFollow(btn, targetUserId) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to follow users.");
    return;
  }

  const isFollowing = btn.innerText === "Unfollow";
  const url = `https://codealpha-snaptalk-1.onrender.com/api/users/${targetUserId}/${
    isFollowing ? "unfollow" : "follow"
  }`;

  axios
    .post(
      url,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    .then(async () => {
      btn.innerText = isFollowing ? "Follow" : "Unfollow";
      alert(`${isFollowing ? "Unfollowed" : "Followed"} successfully`);

      const res = await axios.get("https://codealpha-snaptalk-1.onrender.com/api/users/protected", {
        headers: { Authorization: `Bearer ${token}` }, // ✅ fixed header
      });

      const updatedUser = res.data.user;
      localStorage.setItem("snapUser", JSON.stringify(updatedUser));

      // Optionally: re-render feed here to update all follow buttons
    })
    .catch((err) => {
      console.error("Follow/unfollow failed:", err);
      alert("Action failed");
    });
}

function toggleCommentBox(button) {
  const post = button.closest(".post");
  const commentBox = post.querySelector(".comment-box");

  if (commentBox.style.display === "none") {
    commentBox.style.display = "flex";
  } else {
    commentBox.style.display = "none";
  }
}

function commentPost(button) {
  const post = button.closest(".post");
  const input = post.querySelector(".comment-input");
  input.focus();
}
