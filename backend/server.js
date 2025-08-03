const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

// ===== Root Test Route =====
app.get("/", (req, res) => {
  res.send("🚀 SnapTalk API is live!");
});

// ===== Serve Static Frontend (Optional) =====
// Only needed if you want to serve your frontend from the same backend.
// If you're deploying frontend separately (e.g. on Vercel), you can comment this out.
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ===== Routes =====
const registerRoute = require("./routes/user/signup");
const loginRoute = require("./routes/user/login");
const postRoute = require("./routes/user/post");
const userRoute = require("./routes/api/users");

app.use("/api/users", registerRoute); // /api/users/register
app.use("/api/users", loginRoute); // /api/users/login
app.use("/api/users", userRoute); // /api/users/:id/follow etc.
app.use("/api/posts", postRoute); // /api/posts routes

// ===== Connect MongoDB and Start Server =====
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    console.log("📦 Connected to DB:", mongoose.connection.name);
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
