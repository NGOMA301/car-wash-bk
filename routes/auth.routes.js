import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  googleLogin,
  getMySessions,
  getProfile,
  updateProfile,
  getSessionDetails,
  logoutSession,
  logoutFromAllSessions,
  getAllUsers,
} from "../controllers/auth.controller.js";
import { isAdmin, requireAuth } from "../middleware/authMiddleware.js";
import uploadP from "../middleware/profileUpload.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/login/google", googleLogin);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.get("/profile", requireAuth, getProfile);
router.put("/edit-profile", requireAuth,uploadP.single('profile'), updateProfile);
router.get("/sessions", requireAuth, getMySessions);
router.get("/sessions/:sessionId", requireAuth, getSessionDetails);
router.delete("/sessions/:sessionId", requireAuth, logoutSession);
router.delete("/sessions-all", requireAuth, logoutFromAllSessions);
router.get("/admin/users", requireAuth, isAdmin, getAllUsers);

export default router;
