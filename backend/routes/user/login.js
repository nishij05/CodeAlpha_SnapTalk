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
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ email: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ password: "Incorrect password" });
    }

    // ✅ Only store minimal data in token
    const payload = {
      id: user._id,
      name: user.name,
    };

    jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "1h" }, (err, token) => {
      if (err) throw err;
      res.json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage || null
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
