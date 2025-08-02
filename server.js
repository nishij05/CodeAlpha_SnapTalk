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

app.use(express.static(path.join(__dirname, "public")));

// ===== Route Imports =====
const registerRoute = require("./routes/user/signup");
const loginRoute = require("./routes/user/login");
const postRoute = require("./routes/user/post");
const userRoute = require("./routes/api/users"); // contains /follow, /unfollow, /protected

// ===== Use Routes =====
app.use("/api/users", registerRoute); // /register
app.use("/api/users", loginRoute); // /login, /protected
app.use("/api/users", userRoute); // /:id/follow, /:id/unfollow, /protected
app.use("/api/posts", postRoute); // Post related endpoints

// ===== Connect MongoDB =====
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(5000, () =>
      console.log("🚀 Server running on http://localhost:5000")
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
