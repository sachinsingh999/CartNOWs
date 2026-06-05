import notificationModel from "../models/notificationModel.js";

export const createNotification = async (userId, orderId, title, message) => {
  try {
    await notificationModel.create({
      userId,
      orderId,
      title,
      message,
    });
    console.log(`Notification created for user ${userId}: ${title}`);
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};
