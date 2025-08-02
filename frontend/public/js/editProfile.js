const token = localStorage.getItem("token");
const snapUser = JSON.parse(localStorage.getItem("snapUser"));

const previewImage = document.getElementById("previewImage");
const nameInput = document.getElementById("newName");
const emailInput = document.getElementById("newEmail");
const passwordInput = document.getElementById("newPassword");
const confirmInput = document.getElementById("confirmPassword");
const fileInput = document.getElementById("newProfileImage");

// Load existing user data
window.onload = async function () {
  if (!token || !snapUser) {
    alert("Please login first.");
    window.location.href = "login.html";
    return;
  }

  previewImage.src = snapUser.profileImage || "https://i.pravatar.cc/150";
  nameInput.value = snapUser.name || "";
  emailInput.value = snapUser.email || "";
};

// Preview image
fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file && file.size < 2 * 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("Upload image smaller than 2MB");
  }
});

// Submit updated data
document.getElementById("editProfileForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmInput.value.trim();
  const image = previewImage.src;

  if (!name || !email) {
    return alert("Name and email are required.");
  }

  if (password && password !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  try {
    const payload = { name, email, image };
    if (password) payload.password = password;

    const res = await axios.put(
      "http://localhost:5000/api/users/update-profile",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    localStorage.setItem("snapUser", JSON.stringify(res.data.updatedUser));
    alert("Profile updated successfully!");
    window.location.href = "profile.html";
  } catch (err) {
    console.error("❌ Update failed:", err);
    alert("Failed to update profile.");
  }
});
