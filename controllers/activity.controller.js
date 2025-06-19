import Activity from "../models/Activity.js";

export const getMyActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch activities", error: err.message });
  }
};
