import { Router } from "express";
import User from "../models/User.js";
import auth from "../middleware/auth.js";

const router = Router();

router.put("/:id/follow", auth, async (req, res) => {
  const me = await User.findById(req.user);
  const them = await User.findById(req.params.id);

  if (!them) return res.status(404).json({ msg: "User not found" });

  const i = me.following.indexOf(them._id);
  if (i === -1) {
    me.following.push(them._id);
    them.followers.push(me._id);
  } else {
    me.following.splice(i, 1);
    them.followers.pull(me._id);
  }

  await me.save();
  await them.save();
  res.json({ following: me.following.length });
});

router.get("/me/notifications", auth, async (req, res) => {
  const user = await User.findById(req.user).select("notifications");
  res.json(user.notifications.reverse().slice(0, 20));
});

export default router;