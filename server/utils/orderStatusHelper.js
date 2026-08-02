import orderItemModel from "../models/orderItemModel.js";
import orderModel from "../models/orderModel.js";

/**
 * Calculates parent Order status based on array of item statuses.
 * 
 * Rules:
 * - All Cancelled -> Cancelled
 * - All Delivered -> Delivered / Completed
 * - All Returned -> Returned
 * - Some Delivered & Some Shipped/Processing -> Partially Delivered
 * - Some Shipped & Some Processing -> Partially Shipped
 * - Some Cancelled & Others Active -> Partially Cancelled
 * - Some Returned & Others Active -> Partially Returned
 * - All Confirmed/Processing/Packed/Ready -> Processing
 */
export const calculateParentOrderStatus = (items) => {
  if (!items || items.length === 0) return "Processing";

  const statuses = items.map((i) => (i.status || "").toLowerCase());

  if (statuses.every((s) => s === "cancelled")) return "Cancelled";
  if (statuses.every((s) => s === "delivered")) return "Delivered";
  if (statuses.every((s) => ["returned", "return approved"].includes(s))) return "Returned";
  if (statuses.every((s) => ["return pending", "return requested"].includes(s))) return "Return Pending";

  const hasReturnPending = statuses.some((s) => ["return pending", "return requested"].includes(s));
  const hasDelivered = statuses.some((s) => s === "delivered");
  const hasShipped = statuses.some((s) => ["shipped", "out for delivery"].includes(s));
  const hasCancelled = statuses.some((s) => s === "cancelled");
  const hasReturned = statuses.some((s) => ["return requested", "returned", "return approved"].includes(s));
  const hasProcessing = statuses.some((s) =>
    ["pending", "confirmed", "processing", "packed", "ready to ship"].includes(s)
  );

  if (hasReturnPending) return "Return Pending";
  if (hasDelivered && (hasShipped || hasProcessing)) return "Partially Delivered";
  if (hasShipped && hasProcessing) return "Partially Shipped";
  if (hasCancelled) return "Partially Cancelled";
  if (hasReturned) return "Partially Returned";

  return "Processing";
};

/**
 * Recalculates and updates the parent Order status in MongoDB
 */
export const syncParentOrderStatus = async (orderId) => {
  try {
    const childItems = await orderItemModel.find({ orderId }).lean();
    if (!childItems || childItems.length === 0) return null;

    const newStatus = calculateParentOrderStatus(childItems);

    const order = await orderModel.findById(orderId);
    if (order) {
      order.orderStatus = newStatus;

      // Synchronize embedded items in parent order model
      if (order.items && Array.isArray(order.items)) {
        order.items = order.items.map((embItem) => {
          const matchedChild = childItems.find(
            (c) =>
              String(c._id) === String(embItem.orderItemId || embItem._id) ||
              String(c.productId) === String(embItem.productId || embItem._id)
          );
          if (matchedChild) {
            return {
              ...embItem,
              status: matchedChild.status,
            };
          }
          return embItem;
        });
      }

      await order.save();
    }
    return newStatus;
  } catch (error) {
    console.error("Error in syncParentOrderStatus:", error);
    return null;
  }
};
