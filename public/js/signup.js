const form = document.getElementById("registerForm");
const errorDiv = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  const password2 = form.password2.value;

  if (password !== password2) {
    errorDiv.textContent = "Passwords do not match";
    return;
  }

  try {
    const res = await axios.post("http://localhost:5000/api/users/register", {
      name,
      email,
      password,
      password2,
    });

    const { user, token } = res.data;

    // Store user and token in localStorage
    localStorage.setItem("token", token);
    localStorage.setItem("snapUser", JSON.stringify(user));

    alert("Account created successfully ✅");
    window.location.href = "home.html";
  } catch (err) {
    if (err.response && err.response.data) {
      errorDiv.textContent = Object.values(err.response.data).join(", ");
    } else {
      errorDiv.textContent = "Something went wrong";
    }
  }
});
