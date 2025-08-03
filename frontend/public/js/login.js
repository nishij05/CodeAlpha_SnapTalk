const form = document.getElementById("loginForm");
const errorDiv = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = form.email.value.trim();
  const password = form.password.value;

  try {
    const res = await axios.post("https://codealpha-snaptalk-1.onrender.com/api/users/login", {
      email,
      password,
    });

    const { user, token } = res.data;

    // ✅ Save user info and token with Bearer prefix
    localStorage.setItem("token", token);
    localStorage.setItem("snapUser", JSON.stringify(user));

    // console.log("Token stored:", `Bearer ${token}`);

    alert("Login successful ✅");
    window.location.href = "home.html"; // redirect to home after login
  } catch (err) {
    if (err.response && err.response.data) {
      errorDiv.textContent = Object.values(err.response.data).join(", ");
    } else {
      errorDiv.textContent = "Something went wrong";
    }
  }
});
