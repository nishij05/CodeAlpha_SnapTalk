const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: String,
  commentedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const postSchema = new mongoose.Schema(
  {
    caption: String,
    image: String,
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
