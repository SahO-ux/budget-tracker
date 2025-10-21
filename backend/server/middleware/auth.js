import jwt from "jsonwebtoken";

import { models } from "../modules-loader.js";

/**
 * Middleware: expects Authorization: Bearer <token>
 * Verifies token, sets req.userId (string) and req.user (lean object) when possible.
 */
export default async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== "string" || !header.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or malformed" });
  }
  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload || !payload.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    req.userId = payload.id;
    // try to attach user object (safe, lean)
    try {
      const user = await models.User.findById(payload.id)
        .select("-passwordHash")
        .lean();
      if (!user) return res.status(401).json({ message: "User not found" });
      req.user = user;
    } catch (err) {
      // ignore user attach errors
      console.warn(
        "authMiddleware: failed to attach user object:",
        err.message
      );
    }
    return next();
  } catch (err) {
    console.error("authMiddleware error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
