import mongoose from "mongoose";
import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import { VIP_CONFIG, getVipLevelConfig } from "../config/vipConfig.js";

/**
 * Calculates user's qualifying spend within the qualification period (default: 365 days).
 * Only paid and non-cancelled/non-refunded/non-failed orders are counted.
 */
export const getQualifyingSpendForUser = async (userId, session = null) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return 0;

  const now = new Date();
  const periodStart = new Date(now.getTime() - VIP_CONFIG.periodDays * 24 * 60 * 60 * 1000);

  const query = orderModel.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        createdAt: { $gte: periodStart },
        paymentStatus: { $in: ["paid", "Paid"] },
        orderStatus: {
          $nin: [
            "cancelled", "Cancelled",
            "failed", "Failed",
            "refunded", "Refunded",
            "Cancel Requested",
            "Return Requested"
          ]
        }
      }
    },
    {
      $group: {
        _id: "$userId",
        totalQualifyingSpend: { $sum: "$amount" }
      }
    }
  ]);

  if (session) query.session(session);
  const result = await query;

  if (result && result.length > 0) {
    return Math.max(0, result[0].totalQualifyingSpend || 0);
  }
  return 0;
};

/**
 * Recalculates and updates user's VIP membership level atomically from authoritative order records.
 */
export const recalculateUserVIPStatus = async (userId, session = null) => {
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) return null;

  const qualifyingSpend = await getQualifyingSpendForUser(userId, session);
  const vipInfo = getVipLevelConfig(qualifyingSpend);

  const now = new Date();
  const periodStart = new Date(now.getTime() - VIP_CONFIG.periodDays * 24 * 60 * 60 * 1000);
  const periodEnd = new Date(now.getTime() + VIP_CONFIG.periodDays * 24 * 60 * 60 * 1000);

  const userQuery = userModel.findById(userId);
  if (session) userQuery.session(session);
  const user = await userQuery;

  if (!user) return null;

  const previousLevel = user.membership?.level || "MEMBER";
  const isUpgrade = vipInfo.level !== previousLevel;

  user.membership = {
    level: vipInfo.level,
    periodStart: user.membership?.periodStart || periodStart,
    periodEnd,
    qualifyingSpend,
    upgradedAt: isUpgrade ? now : (user.membership?.upgradedAt || now)
  };

  user.markModified("membership");
  if (session) {
    await user.save({ session });
  } else {
    await user.save();
  }

  return {
    ...vipInfo,
    walletBalance: user.walletBalance || 0,
    rewardPoints: user.rewardPoints || 0
  };
};

/**
 * Process cashback and points rewards for an order.
 * GUARANTEES IDEMPOTENCY: Executed EXACTLY ONCE per order.
 */
export const processOrderRewards = async (orderId, session = null) => {
  if (!orderId) return { success: false, message: "Invalid orderId" };

  const orderQuery = orderModel.findById(orderId);
  if (session) orderQuery.session(session);
  const order = await orderQuery;

  if (!order) return { success: false, message: "Order not found" };

  // IDEMPOTENCY GUARD: Exit immediately if already processed
  if (order.rewardsProcessed) {
    return { success: true, message: "Rewards already processed", order };
  }

  const pStatus = (order.paymentStatus || "").toLowerCase();
  if (pStatus !== "paid") {
    return { success: false, message: "Order is not paid" };
  }

  const userQuery = userModel.findById(order.userId);
  if (session) userQuery.session(session);
  const user = await userQuery;

  if (!user) return { success: false, message: "User not found" };

  // 1. Recalculate current qualifying spend & VIP status before awarding
  const currentVIP = await recalculateUserVIPStatus(order.userId, session);

  // 2. Calculate server-authoritative Cashback & Points using VIP Config
  const cashbackEarned = Math.round((order.amount || 0) * (currentVIP.cashbackRate || 0.01));
  const basePoints = Math.floor((order.amount || 0) * 0.5);
  const pointsEarned = Math.floor(basePoints * (currentVIP.pointsMultiplier || 1.0));

  // 3. Atomically credit user balance & points
  user.walletBalance = Math.max(0, (user.walletBalance || 0) + cashbackEarned);
  user.rewardPoints = Math.max(0, (user.rewardPoints || 0) + pointsEarned);

  if (session) {
    await user.save({ session });
  } else {
    await user.save();
  }

  // 4. Mark order as rewards processed
  order.rewardsProcessed = true;
  order.cashbackEarned = cashbackEarned;
  order.pointsEarned = pointsEarned;

  if (session) {
    await order.save({ session });
  } else {
    await order.save();
  }

  // 5. Update qualifying spend and tier post-purchase
  const updatedVIP = await recalculateUserVIPStatus(order.userId, session);

  return {
    success: true,
    cashbackEarned,
    pointsEarned,
    vipInfo: updatedVIP
  };
};

/**
 * Reverts cashback and points if an order is cancelled or refunded.
 * Recalculates qualifying spend and downgrades membership if necessary.
 */
export const revertOrderRewards = async (orderId, session = null) => {
  if (!orderId) return { success: false, message: "Invalid orderId" };

  const orderQuery = orderModel.findById(orderId);
  if (session) orderQuery.session(session);
  const order = await orderQuery;

  if (!order) return { success: false, message: "Order not found" };

  if (order.rewardsProcessed) {
    const userQuery = userModel.findById(order.userId);
    if (session) userQuery.session(session);
    const user = await userQuery;

    if (user) {
      user.walletBalance = Math.max(0, (user.walletBalance || 0) - (order.cashbackEarned || 0));
      user.rewardPoints = Math.max(0, (user.rewardPoints || 0) - (order.pointsEarned || 0));

      if (session) {
        await user.save({ session });
      } else {
        await user.save();
      }
    }

    order.rewardsProcessed = false;
    order.cashbackEarned = 0;
    order.pointsEarned = 0;

    if (session) {
      await order.save({ session });
    } else {
      await order.save();
    }
  }

  // Recalculate qualifying spend post-cancellation/refund
  const updatedVIP = await recalculateUserVIPStatus(order.userId, session);

  return {
    success: true,
    vipInfo: updatedVIP
  };
};
