import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  avatar: { type: String, default: "/media/default.png" },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  notifications: [{
    text: String,
    link: String,
    date: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }]
});

userSchema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.compare = function (raw) {
  return bcrypt.compare(raw, this.password);
};

export default mongoose.model("User", userSchema);