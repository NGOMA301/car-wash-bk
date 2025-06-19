import ServicePackage from "../models/ServicePackage.js";
import { logActivity } from "../utils/logActivity.js";

// Create new service record
export const createServicePackage = async (req, res) => {
  try {
    const newService = await ServicePackage.create({
      ...req.body,
      user: req.user._id, // auto-attach the receptionist/user
    });

    await logActivity({
      user: req.user._id,
      action: "create",
      resourceType: "servicePackage",
      resourceId: newService._id,
      message: `Created service record`,
    });

    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create service record",
      error: err.message,
    });
  }
};

// Get all service records for the logged-in user
export const getAllServicePackages = async (req, res) => {
  try {
    const services = await ServicePackage.find({ user: req.user._id })
      .populate("car")
      .populate("package")
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch service records",
      error: err.message,
    });
  }
};

// Get single service record only if it belongs to the user
export const getServicePackageById = async (req, res) => {
  try {
    const service = await ServicePackage.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("car")
      .populate("package")
      .populate("user", "username");

    if (!service)
      return res.status(404).json({
        message: "Service not found or unauthorized",
      });

    res.json(service);
  } catch (err) {
    res.status(500).json({
      message: "Error fetching service record",
      error: err.message,
    });
  }
};

// Update service record only if it belongs to the user
export const updateServicePackage = async (req, res) => {
  try {
    const updated = await ServicePackage.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!updated)
      return res
        .status(404)
        .json({ message: "Service not found or unauthorized" });

    await logActivity({
      user: req.user._id,
      action: "update",
      resourceType: "servicePackage",
      resourceId: updated._id,
      message: `Updated service record`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Error updating service record",
      error: err.message,
    });
  }
};

// Delete service record only if it belongs to the user
export const deleteServicePackage = async (req, res) => {
  try {
    const deleted = await ServicePackage.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Service not found or unauthorized" });

    await logActivity({
      user: req.user._id,
      action: "delete",
      resourceType: "servicePackage",
      resourceId: deleted._id,
      message: `Deleted service record`,
    });

    res.json({ message: "Service record deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting service record",
      error: err.message,
    });
  }
};
