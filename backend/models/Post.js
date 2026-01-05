import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  media: {
    type: String,        // image/video filename or URL
    default: null
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  text: {
    type: String,
    trim: true
  },

  media: {
    type: String,        // image/video filename or URL
    default: null
  },

  tags: [
    {
      type: String,
      trim: true
    }
  ],

  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  comments: [commentSchema],

  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("Post", postSchema);
