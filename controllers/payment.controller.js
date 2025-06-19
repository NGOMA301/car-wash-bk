import Payment from "../models/Payment.js";
import { generateInvoicePDF } from "../utils/generateInvoicePDF.js";
import path from "path";
import fs from "fs";
import { logActivity } from "../utils/logActivity.js";

// Create a payment
export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create({
      ...req.body,
      user: req.user._id,
    });
    await logActivity({
      user: req.user._id,
      action: "create",
      resourceType: "payment",
      resourceId: payment._id,
      message: `Created payment of ${payment.amountPaid} RWF`,
    });

    res.status(201).json(payment);
  } catch (err) {
    console.log(err.message)
    res
      .status(500)
      .json({ message: "Failed to create payment", error: err.message });
  }
};

// Get all payments for the logged-in user
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate("servicePackage")
      .populate({
        path: "servicePackage",
        populate: [{ path: "car" }, { path: "package" }],
      })
      .populate("user", "username")
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch payments", error: err.message });
  }
};

// Get a single payment by ID if it belongs to the user
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("servicePackage")
      .populate({
        path: "servicePackage",
        populate: [{ path: "car" }, { path: "package" }],
      })
      .populate("user", "username");

    if (!payment)
      return res
        .status(404)
        .json({ message: "Payment not found or unauthorized" });
    res.json(payment);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch payment", error: err.message });
  }
};

// Delete a payment if it belongs to the user
export const deletePayment = async (req, res) => {
  try {
    const deleted = await Payment.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Payment not found or unauthorized" });

    await logActivity({
      user: req.user._id,
      action: "delete",
      resourceType: "payment",
      resourceId: deleted._id,
      message: `Deleted payment`,
    });

    res.json({ message: "Payment deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete payment", error: err.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate("user", "username")
      .populate({
        path: "servicePackage",
        populate: [{ path: "car" }, { path: "package" }],
      });

    if (!payment) {
      return res
        .status(404)
        .json({ message: "Payment not found or unauthorized" });
    }

    if (!payment.servicePackage) {
      return res.status(400).json({
        message: "Service package is missing. It may have been deleted.",
      });
    }

    if (!payment.servicePackage.car) {
      return res.status(400).json({
        message: "Car linked to this service is missing or was deleted.",
      });
    }

    if (!payment.servicePackage.package) {
      return res.status(400).json({
        message: "Package linked to this service is missing or was deleted.",
      });
    }

    const invoicePath = await generateInvoicePDF(payment);
    const filename = `invoice_${payment._id}.pdf`;

    res.download(invoicePath, filename, (err) => {
      if (err) console.error("Download error:", err);
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ message: "Failed to generate invoice", error: err.message });
  }
};


// Daily report (with null check and deletion messages)
export const getDailyReport = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ message: "Date is required in YYYY-MM-DD format." });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);

    const payments = await Payment.find({
      paymentDate: { $gte: start, $lt: end },
      user: req.user._id,
    })
      .populate({
        path: "servicePackage",
        populate: [
          { path: "car", select: "plateNumber" },
          { path: "package", select: "packageName packageDescription" },
        ],
      })
      .sort({ paymentDate: -1 });

    const report = payments.map((payment) => {
      const car = payment?.servicePackage?.car;
      const pkg = payment?.servicePackage?.package;

      return {
        plateNumber: car?.plateNumber || null,
        plateNumberStatus: car
          ? "OK"
          : "Car record missing or deleted",

        packageName: pkg?.packageName || null,
        packageStatus: pkg
          ? "OK"
          : "Package record missing or deleted",

        packageDescription: pkg?.packageDescription || null,
        amountPaid: payment.amountPaid,
        paymentDate: payment.paymentDate,
      };
    });

    res.status(200).json({
      date,
      count: report.length,
      data: report,
    });
  } catch (err) {
    console.log(err.message);
    res
      .status(500)
      .json({ message: "Failed to generate report", error: err.message });
  }
};
