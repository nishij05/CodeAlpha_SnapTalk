const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
require("dotenv").config();

// ===============================
// 👤 Protected Route (Get current user info)
// ===============================
router.get("/protected", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (err) {
    console.error("Protected route error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ===============================
// ➕ Follow a user
// ===============================
router.post("/:id/follow", auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user.id;

    if (targetId === userId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!targetUser.followers.includes(userId)) {
      targetUser.followers.push(userId);
      await targetUser.save();
    }

    if (!currentUser.following.includes(targetId)) {
      currentUser.following.push(targetId);
      await currentUser.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Follow error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// ===============================
// ➖ Unfollow a user
// ===============================
router.post("/:id/unfollow", auth, async (req, res) => {
  try {
    const targetId = req.params.id;
    const userId = req.user.id;

    const targetUser = await User.findById(targetId);
    const currentUser = await User.findById(userId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== userId
    );
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetId
    );

    await targetUser.save();
    await currentUser.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Unfollow error:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// Update profile image
router.put("/profile-image", auth, async (req, res) => {
  try {
    const { image } = req.body; // Base64 string
    const user = await User.findById(req.user.id);
    user.profileImage = image;
    await user.save();
    res.json({ success: true });
  } catch (err) {
    console.error("Profile image upload failed:", err);
    res.status(500).json({ error: "Server Error" });
  }
});

// update editProfile route
router.put("/update-profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, password, image } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;
    if (image) user.profileImage = image;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();
    res.json({ updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
