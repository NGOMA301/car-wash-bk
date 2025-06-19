import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Session from "../models/Session.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized: No token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the associated session
    const session = await Session.findOne({ sessionId: decoded.sessionId });
    if (!session) {
      return res.status(401).json({ message: "Session expired or invalidated" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid user" });

    req.user = user;
    req.sessionId = decoded.sessionId; // Optional: in case you want to use this later
    next();
  } catch (err) {
    res.status(401).json({ message: "Auth failed", error: err.message });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};