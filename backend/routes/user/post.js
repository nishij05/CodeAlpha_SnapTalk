const express = require("express");
const router = express.Router();
const multer = require("multer");
const Post = require("../../models/Post");
const auth = require("../../middleware/auth");

// Setup Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

//create post (protected)
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const newPost = new Post({
      caption: req.body.caption,
      image: req.file.buffer.toString("base64"),
      postedBy: req.user.id,
    });

    const savedPost = await newPost.save();
    res.json(savedPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

//  GET all posts (public)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("postedBy", "name profileImage");
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// get posts by user (protected)
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
});

// delete a post by id
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.postedBy.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this post" });
    }
    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// edit post caption
router.put("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // authorization check
    if (post.postedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized" });
    }
    post.caption = req.body.caption || post.caption;
    await post.save();
    res.json(post);
  } catch (err) {
     console.error("Update failed:", err);
    res.status(500).json({ error: "Update failed" });
  }
});
module.exports = router;

// Like a post
router.post("/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
      await post.save();
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Like failed" });
  }
});

// Unlike a post
router.post("/:id/unlike", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.likes = post.likes.filter((id) => id.toString() !== req.user.id);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Unlike failed" });
  }
});

// Comment on a post
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ text: req.body.text, commentedBy: req.user.id });
    await post.save();
    const updatedPost = await Post.findById(req.params.id)
      .populate("comments.commentedBy", "name")
      .populate("postedBy", "name");
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: "Comment failed" });
  }
});
