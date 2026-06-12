import notificationModel from "../models/notificationModel.js";

export const createNotification = async (recipientId, orderId, title, message, recipientRole = "user") => {
  try {
    await notificationModel.create({
      userId: recipientRole === "user" ? recipientId : null,
      recipientId: recipientRole !== "user" ? recipientId : null,
      recipientRole,
      orderId,
      title,
      message,
    });
    console.log(`Notification created for ${recipientRole} ${recipientId}: ${title}`);
  } catch (error) {
    console.error("Error creating notification:", error.message);
  }
};
