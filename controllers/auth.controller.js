import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import useragent from "useragent";
import geoip from "geoip-lite";
import multer from "multer";
import path from "path";

import User from "../models/User.js";
import Session from "../models/Session.js";

// Multer config for profile image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profiles");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `user-${req.user._id}${ext}`);
  },
});

export const uploadProfile = multer({ storage }).single("profile");

// Utility to extract session data
const createSession = async (req, userId) => {
  const sessionId = uuidv4();
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const geo = geoip.lookup(ip);
  const location = geo ? `${geo.city || ""}, ${geo.country}` : "Unknown";

  const ua = useragent.parse(req.headers["user-agent"]);
  const session = new Session({
    user: userId,
    sessionId,
    ip,
    location,
    userAgent: req.headers["user-agent"],
    device: ua.device.toString(),
    platform: ua.os.toString(),
    browser: ua.toAgent(),
  });

  await session.save();
  return sessionId;
};

export const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashed });

    const sessionId = await createSession(req, user._id);
    const token = jwt.sign(
      { id: user._id, sessionId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, { httpOnly: true, sameSite: "lax" }).json({
      message: "User registered",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ message: "Register error", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const sessionId = await createSession(req, user._id);

    const token = jwt.sign(
      { id: user._id, sessionId },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );
    res
      .cookie("token", token, { httpOnly: true, sameSite: "lax" })
      .json({ message: "Logged in", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err.message });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "Access token is required" });
    }

    // Step 1: Get user info from Google
    const googleRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${credential}` },
      }
    );

    if (!googleRes.ok) {
      throw new Error("Failed to fetch user info from Google");
    }

    const profile = await googleRes.json();
    const { email, name, sub, picture  } = profile;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Google profile is missing an email" });
    }

    // Step 2: Check or create user
    let user = await User.findOne({ email });

    if (!user) {
      const dummyPassword = await bcrypt.hash(sub, 10); // sub = unique Google ID
      user = await User.create({
        username: email,
        email,
        fullName: name,
        password: dummyPassword,
        provider: "google",
        profileImage: picture,
      });
    }

    const sessionId = await createSession(req, user._id);

    // Step 4: Generate token with sessionId
    const token = jwt.sign(
      { id: user._id, sessionId: sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Step 5: Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    res
      .status(200)
      .json({ message: "Logged in with Google", userId: user._id });
  } catch (err) {
    console.error("Google Login Failed:", err);
    res
      .status(500)
      .json({ message: "Google Login Failed", error: err.message });
  }
};

export const logout = async (req, res) => {
  try {
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    await Session.deleteOne({ sessionId: decoded.sessionId });

    res.clearCookie("token").json({ message: "Logged out" });
  } catch (err) {
    res.status(401).json({ message: "Logout failed", error: err.message });
  }
};


export const getMe = (req, res) => {
  res.json(req.user);
};

// Get all active sessions for user
export const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(sessions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch sessions", error: err.message });
  }
};

// Get and update user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to load profile", error: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const { username, email, fullName } = req.body;
    

    let profileImage;
    if (req.file) {
      profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    const updateData = {
      username,
      email,
      fullName,
    };


    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update profile",
      error: err.message,
    });
  }
};

export const logoutSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({ sessionId, user: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Emit socket event to that session (user’s device)
    if (global.io) {
      global.io.to(sessionId).emit("force-logout", {
        sessionId,
        message: "You have been logged out from another device",
      });
    }

    await Session.deleteOne({ _id: session._id });

    res.json({ message: "Logged out from session", sessionId });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to logout from session", error: err.message });
  }
};

export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      sessionId,
      user: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get session", error: err.message });
  }
};

export const logoutFromAllSessions = async (req, res) => {
  try {
    // Delete all sessions for the logged-in user
    await Session.deleteMany({ user: req.user._id });

    // Clear the auth token cookie
    res.clearCookie("token");

    res.json({ message: "Logged out from all sessions" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to logout from all sessions",
      error: err.message,
    });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {

    const users = await User.find().select("-password").sort({ createdAt: -1 });

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};