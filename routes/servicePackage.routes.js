import express from "express";
import {
  createServicePackage,
  getAllServicePackages,
  getServicePackageById,
  updateServicePackage,
  deleteServicePackage,
} from "../controllers/servicePackage.controller.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", requireAuth, createServicePackage);
router.get("/", requireAuth, getAllServicePackages);
router.get("/:id", requireAuth, getServicePackageById);
router.put("/:id", requireAuth, updateServicePackage);
router.delete("/:id", requireAuth, deleteServicePackage);

export default router;
