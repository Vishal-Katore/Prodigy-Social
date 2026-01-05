import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import Post from "../models/Post.js";
import auth from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

/* =========================
   FIX PATHS
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public folder is OUTSIDE backend
const mediaPath = path.join(__dirname, "..", "..", "public", "media");

/* =========================
   MULTER CONFIG
========================= */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, mediaPath),
  filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

/* =========================
   NOTIFICATIONS
========================= */
const notify = (id, text, link) =>
  User.findByIdAndUpdate(id, {
    $push: { notifications: { text, link } }
  });

/* =========================
   CREATE POST
========================= */
router.post("/", auth, upload.single("media"), async (req, res) => {
  try {
    const post = await Post.create({
      author: req.user,
      text: req.body.text,
      media: req.file ? req.file.filename : null,
      tags: req.body.tags?.split(",").map(t => t.trim())
    });

    const me = await User.findById(req.user);
    me.followers.forEach(f =>
      notify(f, `${me.name} posted something`, "/feed.html")
    );

    res.json(post);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

/* =========================
   GET POSTS
========================= */
router.get("/", auth, async (_, res) => {
  const posts = await Post.find()
    .sort({ date: -1 })
    .populate("author", "name avatar");

  res.json(posts);
});

/* =========================
   LIKE / UNLIKE
========================= */
router.put("/:id/like", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);

  const index = post.likes.findIndex(
    id => id.toString() === req.user.toString()
  );

  index === -1
    ? post.likes.push(req.user)
    : post.likes.splice(index, 1);

  await post.save();
  res.json({ likes: post.likes.length });
});

/* =========================
   COMMENT
========================= */
router.post("/:id/comment", auth, upload.single("media"), async (req, res) => {
  const post = await Post.findById(req.params.id);

  post.comments.push({
    user: req.user,
    text: req.body.text,
    media: req.file ? req.file.filename : null
  });

  await post.save();
  res.json(post.comments);
});

/* =========================
   TRENDING POSTS
========================= */
router.get("/trending", auth, async (_, res) => {
  const posts = await Post.aggregate([
    { $addFields: { likesCount: { $size: "$likes" } } },
    { $sort: { likesCount: -1 } },
    { $limit: 10 }
  ]);

  res.json(posts);
});

/* =========================
   DELETE POST ✅
========================= */
router.delete("/:id", auth, async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ msg: "Post not found" });
  }

  // only author can delete
  if (post.author.toString() !== req.user.toString()) {
    return res.status(403).json({ msg: "Not authorized" });
  }

  await post.deleteOne();
  res.json({ msg: "Post deleted" });
});

export default router;
