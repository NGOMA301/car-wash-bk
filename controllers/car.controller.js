import Car from "../models/Car.js";
import path from "path";
import fs from "fs";
import { logActivity } from "../utils/logActivity.js";

// Create car with image and user
export const createCar = async (req, res) => {
  try {
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const newCar = await Car.create({
      ...req.body,
      image: imagePath,
      createdBy: req.user._id,
    });

    await logActivity({
      user: req.user._id,
      action: "create",
      resourceType: "car",
      resourceId: newCar._id,
      message: `Created car ${newCar.plateNumber}`,
    });

    res.status(201).json(newCar);
  } catch (err) {
    res.status(500).json({ message: "Error creating car", error: err.message });
  }
};

// Get all cars created by the logged-in user
export const getAllCars = async (req, res) => {
  try {
    const cars = await Car.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(cars);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching cars", error: err.message });
  }
};

// Get single car by ID (only if created by the user)
export const getCarById = async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!car) return res.status(404).json({ message: "Car not found" });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: "Error fetching car", error: err.message });
  }
};

// Update car (only if created by the user)
export const updateCar = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const updatedCar = await Car.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      updateData,
      { new: true }
    );

    if (!updatedCar)
      return res
        .status(404)
        .json({ message: "Car not found or not authorized" });

    await logActivity({
      user: req.user._id,
      action: "update",
      resourceType: "car",
      resourceId: updatedCar._id,
      message: `Updated car ${updatedCar.plateNumber}`,
    });

    res.json(updatedCar);
  } catch (err) {
    res.status(500).json({ message: "Error updating car", error: err.message });
  }
};

// Delete car (only if created by the user)
export const deleteCar = async (req, res) => {
  try {
    const car = await Car.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!car)
      return res
        .status(404)
        .json({ message: "Car not found or not authorized" });

    // Optionally delete the image file
    if (car.image) {
      const imagePath = path.join("uploads", car.image);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await logActivity({
      user: req.user._id,
      action: "delete",
      resourceType: "car",
      resourceId: car._id,
      message: `Deleted car ${car.plateNumber}`,
    });

    res.json({ message: "Car deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting car", error: err.message });
  }
};
