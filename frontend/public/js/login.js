const form = document.getElementById("loginForm");
const errorDiv = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const res = await axios.post("http://localhost:5000/api/users/login", {
      email,
      password,
    });

    const { user, token } = res.data;

    // Save token and user (user has no image data in token)
    localStorage.setItem("token", token);
    localStorage.setItem("snapUser", JSON.stringify(user));

    alert("Login successful");
    window.location.href = "home.html";
  } catch (err) {
    if (err.response?.data) {
      errorDiv.textContent = Object.values(err.response.data).join(", ");
    } else {
      errorDiv.textContent = "Something went wrong";
    }
  }
});
