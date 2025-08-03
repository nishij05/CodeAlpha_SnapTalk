const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const validateLoginInput = require("../../validation/login");
require("dotenv").config();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) return res.status(400).json(errors);

  try {
    const allUsers = await User.find();
    console.log("Available users:", allUsers);

    const user = await User.findOne({ email });
    if (!user) {
      errors.email = "Email not found";
      return res.status(400).json(errors);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      errors.password = "Incorrect password";
      return res.status(400).json(errors);
    }

    const payload = {
      id: user._id,
      name: user.name,
      profileImage: user.profileImage,
    };

    jwt.sign(
      payload,
      process.env.SECRET_KEY,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ success: true, token, user: payload });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
