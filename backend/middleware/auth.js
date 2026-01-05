import jwt from "jsonwebtoken";

export default function (req, res, next) {
  const token = req.header("x-auth");
  if (!token) return res.status(401).json({ msg: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.id;
    next();
  } catch {
    res.status(400).json({ msg: "Invalid token" });
  }
}