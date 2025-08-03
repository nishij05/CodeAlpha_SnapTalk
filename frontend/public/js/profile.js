const username = document.getElementById("username");
const postCount = document.getElementById("postCount");
const followersCount = document.getElementById("followersCount");
const followingCount = document.getElementById("followingCount");
const profileImage = document.getElementById("profileImage");
const uploadInput = document.getElementById("uploadInput");
const token = localStorage.getItem("token");

if (!token) {
  alert("You are not logged in. Redirecting...");
  window.location.href = "login.html";
}

// Fetch user info and render profile
async function fetchAndRenderProfile() {
  try {
    const res = await axios.get(
      "https://codealpha-snaptalk-1.onrender.com/api/users/protected",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const user = res.data.user;
    console.log("✅ Protected user:", user);

    username.innerText = user.name;
    followersCount.innerText = Array.isArray(user.followers)
      ? user.followers.length
      : 0;
    followingCount.innerText = Array.isArray(user.following)
      ? user.following.length
      : 0;

    const userId = user._id || user.id;

    const postRes = await axios.get(
      `https://codealpha-snaptalk-1.onrender.com/api/posts/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const posts = postRes.data;
    postCount.innerText = posts.length;

    const postSection = document.querySelector(".post-gallery");
    postSection.innerHTML = "";

    posts.forEach((post) => {
      const div = document.createElement("div");
      div.className = "post-box";
      div.innerHTML = `
        <img src="data:image/jpeg;base64,${post.image}" alt="${post.caption}" class="profile-post-img" />
        <p>${post.caption}</p>
        <button onclick="editPost('${post._id}', \`${post.caption}\`)">✏️ Edit</button>
        <button onclick="deletePost('${post._id}')">🗑️ Delete</button>
      `;
      postSection.appendChild(div);
    });

    if (user.profileImage) {
      profileImage.src = user.profileImage;
    }
  } catch (err) {
    console.error("❌ Error fetching user or posts:", err);
    alert("Unauthorized. Redirecting to Login...");
    window.location.href = "login.html";
  }
}

// Trigger fetch on load
fetchAndRenderProfile();

// Refresh profile data if follow/unfollow happened
window.addEventListener("focus", () => {
  if (localStorage.getItem("followUpdated") === "true") {
    fetchAndRenderProfile();
    localStorage.removeItem("followUpdated");
  }
});

uploadInput.addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    alert("Please upload an image smaller than 2MB.");
    return;
  }
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Image = e.target.result;

    profileImage.src = e.target.result; // Preview

    try {
      // Save image to DB
      await axios.put(
        "https://codealpha-snaptalk-1.onrender.com/api/users/profile-image",
        { image: base64Image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local storage snapshot
      const updatedUser = await axios.get(
        "https://codealpha-snaptalk-1.onrender.com/api/users/protected",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      localStorage.setItem("snapUser", JSON.stringify(updatedUser.data.user));
    } catch (error) {
      console.error("❌ Failed to upload profile image:", error);
      alert("Upload failed");
    }
  };
  reader.readAsDataURL(file);
});

// Logout logic
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("snapUser");
  alert("Logged out successfully");
  window.location.href = "login.html";
});

// DELETE post
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    axios
      .delete(`https://codealpha-snaptalk-1.onrender.com/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        alert("Post deleted");
        location.reload();
      })
      .catch((err) => {
        console.error("❌ Delete error:", err);
        alert("Failed to delete post.");
      });
  }
}

// EDIT post
function editPost(postId, oldCaption) {
  const newCaption = prompt("Edit caption:", oldCaption);
  if (newCaption && newCaption !== oldCaption) {
    axios
      .put(
        `https://codealpha-snaptalk-1.onrender.com/api/posts/${postId}`,
        { caption: newCaption },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then(() => {
        alert("Post updated");
        location.reload();
      })
      .catch((err) => {
        console.error("❌ Edit error:", err);
        alert("Failed to update post.");
      });
  }
}
