/**
 * Checks if a user is an active participant in an order
 * @param {Object} order - Mongoose order document
 * @param {String} role - "customer" | "seller" | "deliveryman"
 * @param {String} userId - User/Seller/Deliveryman DB ID
 * @returns {Boolean}
 */
export const canCommunicate = (order, role, userId) => {
  if (!order || !role || !userId) return false;

  const userIdStr = userId.toString();

  if (role === "customer") {
    return order.userId && order.userId.toString() === userIdStr;
  }

  if (role === "deliveryman") {
    return order.deliverymanId && order.deliverymanId.toString() === userIdStr;
  }

  if (role === "seller") {
    // Extract seller IDs from order items
    const sellerIds = [];
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        // Try getting sellerId from item directly or nested in product
        const sId = item.product?.sellerId || item.sellerId;
        if (sId) {
          const sIdStr = sId.toString();
          if (!sellerIds.includes(sIdStr)) {
            sellerIds.push(sIdStr);
          }
        }
      });
    }
    return sellerIds.includes(userIdStr);
  }

  return false;
};

/**
 * Checks if order is completed / locked (delivered, cancelled, returned, refunded)
 * @param {Object} order
 * @returns {Boolean}
 */
export const isCommunicationLocked = (order) => {
  if (!order) return true;
  const status = (order.orderStatus || "").toLowerCase();
  return ["delivered", "cancelled", "returned", "refunded"].includes(status);
};

/**
 * Validates whether message sending is allowed between specific roles under current status
 * @param {Object} order
 * @param {String} senderRole - "customer" | "seller" | "deliveryman"
 * @param {String} receiverRole - "customer" | "seller" | "deliveryman"
 * @returns {Boolean}
 */
export const canSendMessage = (order, senderRole, receiverRole) => {
  if (!order) return false;
  if (isCommunicationLocked(order)) return false;

  const status = (order.orderStatus || "").toLowerCase();

  // Normalized statuses from order database (e.g. "Order Placed", "Confirmed", "Packed", "Assigned", "Picked Up", "Out For Delivery", etc.)

  // Customer <-> Deliveryman rules
  if (
    (senderRole === "customer" && receiverRole === "deliveryman") ||
    (senderRole === "deliveryman" && receiverRole === "customer")
  ) {
    return status === "out for delivery";
  }

  // Seller <-> Deliveryman rules
  if (
    (senderRole === "seller" && receiverRole === "deliveryman") ||
    (senderRole === "deliveryman" && receiverRole === "seller")
  ) {
    return [
      "confirmed",
      "packed",
      "assigned",
      "picked up",
      "out for delivery"
    ].includes(status);
  }

  // Customer <-> Seller rules (Allowed for general support prior to locking)
  if (
    (senderRole === "customer" && receiverRole === "seller") ||
    (senderRole === "seller" && receiverRole === "customer")
  ) {
    return [
      "order placed",
      "confirmed",
      "packed",
      "assigned",
      "picked up",
      "out for delivery"
    ].includes(status);
  }

  return false;
};

/**
 * Checks if a call can be initiated
 * @param {Object} order
 * @param {String} callerRole
 * @param {String} calleeRole
 * @returns {Boolean}
 */
export const canInitiateCall = (order, callerRole, calleeRole) => {
  // Call rules align exactly with message rules
  return canSendMessage(order, callerRole, calleeRole);
};
