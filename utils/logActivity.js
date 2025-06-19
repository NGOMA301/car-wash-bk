import Activity from "../models/Activity.js";

export const logActivity = async ({
  user,
  action,
  resourceType,
  resourceId,
  message,
  metadata = {},
}) => {
  try {
    await Activity.create({
      user,
      action,
      resourceType,
      resourceId,
      message,
      metadata,
    });
  } catch (err) {
    console.error("Failed to log activity:", err.message);
  }
};
