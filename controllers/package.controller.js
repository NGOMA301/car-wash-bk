import Package from "../models/Package.js";
import { logActivity } from "../utils/logActivity.js";

// Create a package (assign to user)
export const createPackage = async (req, res) => {
  try {
    const newPackage = await Package.create({
      ...req.body,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user._id,
      action: "create",
      resourceType: "package",
      resourceId: newPackage._id,
      message: `Created package: ${newPackage.packageName || "N/A"}`,
    });

    res.status(201).json(newPackage);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error creating package", error: err.message });
  }
};

// Get all packages created by the user
export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(packages);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching packages", error: err.message });
  }
};

// Get one package by ID (only if created by the user)
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!pkg)
      return res
        .status(404)
        .json({ message: "Package not found or not authorized" });
    res.json(pkg);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching package", error: err.message });
  }
};

// Delete a package (only if created by the user)
export const deletePackage = async (req, res) => {
  try {
    const deleted = await Package.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!deleted)
      return res
        .status(404)
        .json({ message: "Package not found or not authorized" });

    await logActivity({
      user: req.user._id,
      action: "delete",
      resourceType: "package",
      resourceId: deleted._id,
      message: `Deleted package`,
    });

    res.json({ message: "Package deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting package", error: err.message });
  }
};

// Update a package (only if created by the user)
export const updatePackage = async (req, res) => {
  try {
    const updated = await Package.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ message: "Package not found or not authorized" });

    await logActivity({
      user: req.user._id,
      action: "update",
      resourceType: "package",
      resourceId: updated._id,
      message: `Updated package: ${updated.packageName || "N/A"}`,
    });

    res.json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating package", error: err.message });
  }
};
