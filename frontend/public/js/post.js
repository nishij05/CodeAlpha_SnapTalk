const form = document.getElementById("postForm");
const errorDiv = document.getElementById("errorMsg");
const token = localStorage.getItem("token");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const caption = document.getElementById("caption").value.trim();
  const imageFile = document.getElementById("image").files[0];

  if (!caption || !imageFile) {
    errorDiv.textContent = "Please fill in all fields.";
    return;
  }

  const formData = new FormData();
  formData.append("caption", caption);
  formData.append("image", imageFile);

  try {
    await axios.post("http://localhost:5000/api/posts", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    alert("Post created successfully!");
    window.location.href = "profile.html";
  } catch (err) {
    console.error(" Post error:", err);
    errorDiv.textContent =
      err.response?.data?.error || "Failed to create post.";
  }
});

document.getElementById("image").addEventListener("change", function () {
  const file = this.files[0];
  const preview = document.getElementById("previewImage");

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.style.display = "none";
  }
});
