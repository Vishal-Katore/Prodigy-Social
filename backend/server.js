import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/users.js";

/* ES module __dirname fix */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Load env */
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

/* Middleware */
app.use(cors());
app.use(express.json());

/* ✅ Static files (public is OUTSIDE backend) */
app.use("/media", express.static(path.join(__dirname, "..", "public", "media")));
app.use(express.static(path.join(__dirname, "..", "public")));

/* API routes */
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

/* ✅ Catch-all route */
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "feed.html"));
});

/* DB + Server */
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running: http://localhost:${PORT}`);
    });
  })
  .catch(err => console.log(err));
