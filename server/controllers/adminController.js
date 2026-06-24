import sellerModel from "../models/sellerModel.js";
import userModel from "../models/userModel.js";
import deliverymanModel from "../models/deliverymanModel.js";
import categoryModel from "../models/categoryModel.js";
import collectionModel from "../models/collectionModel.js";
import brandModel from "../models/brandModel.js";
import productModel from "../models/productModel.js";
import orderModel from "../models/orderModel.js";
import returnRequestModel from "../models/returnRequestModel.js";
import auditLogModel from "../models/auditLogModel.js";
import platformSettingModel from "../models/platformSettingModel.js";
import notificationModel from "../models/notificationModel.js";
import productImageModel from "../models/productImageModel.js";
import categoryTemplateModel from "../models/categoryTemplateModel.js";
import categorySettingsModel from "../models/categorySettingsModel.js";
import categoryAttributeModel from "../models/categoryAttributeModel.js";
import categoryAttributeOptionModel from "../models/categoryAttributeOptionModel.js";
import categorySeoModel from "../models/categorySeoModel.js";
import activityLogModel from "../models/activityLogModel.js";
import jwt from "jsonwebtoken";
import deliveryAssignmentModel from "../models/deliveryAssignmentModel.js";

// Helper for writing audit logs
const writeLog = async (req, action, target, details) => {
  try {
    let email = "admin@cartnow.com";
    try {
      const { token } = req.headers;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && typeof decoded === "string") {
          email = decoded.replace(process.env.ADMIN_PASSWORD, "") || "admin@cartnow.com";
        }
      }
    } catch (e) {}
    await auditLogModel.create({ adminEmail: email, action, target, details });
  } catch (err) {
    console.error("Audit log write failed:", err);
  }
};

/* ================= SELLER MANAGEMENT ================= */
export const getAllSellers = async (req, res) => {
  try {
    const sellers = await sellerModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSellerDetails = async (req, res) => {
  try {
    const seller = await sellerModel.findById(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    const products = await productModel.find({ sellerId: req.params.id, isDeleted: { $ne: true } });
    res.json({ success: true, seller, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSellerStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const seller = await sellerModel.findByIdAndUpdate(id, { status }, { new: true });
    await writeLog(req, "Update Seller Status", seller.shopName, `Status set to: ${status}`);
    res.json({ success: true, message: `Seller status updated to ${status}`, seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSellerCommission = async (req, res) => {
  try {
    const { id, commissionRate } = req.body;
    const seller = await sellerModel.findByIdAndUpdate(id, { commissionRate }, { new: true });
    await writeLog(req, "Update Seller Commission", seller.shopName, `Commission set to: ${commissionRate}%`);
    res.json({ success: true, message: "Commission rate updated", seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processSellerPayout = async (req, res) => {
  try {
    const { sellerId, requestId, status } = req.body;
    const seller = await sellerModel.findById(sellerId);
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });

    const request = seller.payoutRequests.id(requestId);
    if (!request) return res.status(404).json({ success: false, message: "Payout request not found" });

    request.status = status;
    if (status === "approved") {
      seller.balance = Math.max(0, seller.balance - request.amount);
    }
    await seller.save();

    await writeLog(req, "Process Payout", seller.shopName, `Payout of $${request.amount} set to: ${status}`);
    res.json({ success: true, message: `Payout request ${status}`, seller });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSeller = async (req, res) => {
  try {
    const seller = await sellerModel.findByIdAndDelete(req.params.id);
    if (!seller) return res.status(404).json({ success: false, message: "Seller not found" });
    await writeLog(req, "Delete Seller Account", seller.shopName, `Seller ID: ${req.params.id}`);
    res.json({ success: true, message: "Seller account permanently removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CUSTOMER MANAGEMENT ================= */
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await userModel.find({}).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomerStatus = async (req, res) => {
  try {
    const { id, isBlocked } = req.body;
    const user = await userModel.findByIdAndUpdate(id, { isBlocked }, { new: true });
    const logAction = isBlocked ? "Block Customer" : "Unblock Customer";
    await writeLog(req, logAction, user.email, `Blocked: ${isBlocked}`);
    res.json({ success: true, message: `Customer ${isBlocked ? "blocked" : "unblocked"}`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findById(id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "Customer not found" });

    const orders = await orderModel.find({ userId: id }).sort({ createdAt: -1 });
    res.json({ success: true, user, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= DELIVERY AGENT MANAGEMENT ================= */
export const getAllDeliveryAgents = async (req, res) => {
  try {
    const agents = await deliverymanModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAgentDetails = async (req, res) => {
  try {
    const agent = await deliverymanModel.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: "Delivery agent not found" });
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAgentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const agent = await deliverymanModel.findByIdAndUpdate(id, { status }, { new: true });
    await writeLog(req, "Update Agent Status", agent.email, `Status set to: ${status}`);
    res.json({ success: true, message: `Delivery agent status updated to ${status}`, agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignAgentZone = async (req, res) => {
  try {
    const { id, zone } = req.body;
    const agent = await deliverymanModel.findByIdAndUpdate(id, { zone }, { new: true });
    await writeLog(req, "Assign Agent Zone", agent.email, `Zone set to: ${zone}`);
    res.json({ success: true, message: "Delivery zone assigned successfully", agent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CATEGORY MANAGEMENT ================= */
export const getAllCategories = async (req, res) => {
  try {
    const { includeArchived } = req.query;
    const query = {};
    if (includeArchived !== "true") {
      query.status = { $ne: "archived" };
    }
    const categories = await categoryModel.find(query).sort({ displayOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

export const createCategory = async (req, res) => {
  try {
    const {
      name,
      subcategories,
      description,
      icon,
      bannerImage,
      parentCategoryId,
      displayOrder,
      status,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords,
      visibilityRules
    } = req.body;

    const slug = slugify(name);

    // Create Category record
    const category = await categoryModel.create({
      name,
      slug,
      subcategories: subcategories || [],
      description: description || "",
      icon: icon || "",
      bannerImage: bannerImage || "",
      parentCategoryId: parentCategoryId || null,
      displayOrder: displayOrder || 0,
      status: status || "active",
      isFeatured: isFeatured || false,
      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",
      seoKeywords: seoKeywords || [],
      visibilityRules: visibilityRules || {}
    });

    // Create Category SEO record
    await categorySeoModel.create({
      categoryId: category._id,
      title: seoTitle || name,
      description: seoDescription || description || "",
      keywords: seoKeywords || []
    });

    await writeLog(req, "Create Category", name, `Created category with slug: ${slug}`);
    res.json({ success: true, message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const {
      id,
      name,
      subcategories,
      description,
      icon,
      bannerImage,
      parentCategoryId,
      displayOrder,
      status,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords,
      visibilityRules
    } = req.body;

    const slug = name ? slugify(name) : undefined;

    const updateFields = {
      name,
      description,
      icon,
      bannerImage,
      parentCategoryId: parentCategoryId || null,
      displayOrder,
      status,
      isFeatured,
      seoTitle,
      seoDescription,
      seoKeywords,
      visibilityRules
    };

    if (slug) updateFields.slug = slug;
    if (subcategories) updateFields.subcategories = subcategories;

    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const category = await categoryModel.findByIdAndUpdate(id, updateFields, { new: true });

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    // Update or create SEO configuration
    await categorySeoModel.findOneAndUpdate(
      { categoryId: id },
      {
        title: seoTitle || category.name,
        description: seoDescription || category.description || "",
        keywords: seoKeywords || []
      },
      { upsert: true, new: true }
    );

    await writeLog(req, "Update Category", category.name, `Updated category: ${category.name}`);
    res.json({ success: true, message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const category = await categoryModel.findByIdAndDelete(id);
    if (category) {
      // Clean up SEO, attributes, and options
      await categorySeoModel.deleteMany({ categoryId: id });
      const attrs = await categoryAttributeModel.find({ categoryId: id });
      for (const attr of attrs) {
        await categoryAttributeOptionModel.deleteMany({ attributeId: attr._id });
      }
      await categoryAttributeModel.deleteMany({ categoryId: id });
      await writeLog(req, "Delete Category", category.name, `Permanently removed category ID: ${id}`);
    }
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderCategories = async (req, res) => {
  try {
    const { order } = req.body; // array of { id, displayOrder }
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: "order must be an array" });
    }

    const promises = order.map(item =>
      categoryModel.findByIdAndUpdate(item.id, { displayOrder: item.displayOrder })
    );
    await Promise.all(promises);

    await writeLog(req, "Reorder Categories", "Categories", "Reordered categories sequence");
    res.json({ success: true, message: "Categories reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const archiveCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const category = await categoryModel.findByIdAndUpdate(id, { status: "archived" }, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    await writeLog(req, "Archive Category", category.name, `Archived category ID: ${id}`);
    res.json({ success: true, message: "Category archived successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const restoreCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const category = await categoryModel.findByIdAndUpdate(id, { status: "active" }, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    await writeLog(req, "Restore Category", category.name, `Restored category ID: ${id}`);
    res.json({ success: true, message: "Category restored successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const duplicateCategory = async (req, res) => {
  try {
    const { id } = req.body;
    const sourceCat = await categoryModel.findById(id);
    if (!sourceCat) {
      return res.status(404).json({ success: false, message: "Source category not found" });
    }

    // 1. Create duplicate category record
    const duplicatedName = `${sourceCat.name} (Copy)`;
    const duplicatedSlug = slugify(duplicatedName);

    const dupCat = await categoryModel.create({
      name: duplicatedName,
      slug: duplicatedSlug,
      subcategories: sourceCat.subcategories || [],
      description: sourceCat.description || "",
      icon: sourceCat.icon || "",
      bannerImage: sourceCat.bannerImage || "",
      parentCategoryId: sourceCat.parentCategoryId || null,
      displayOrder: (sourceCat.displayOrder || 0) + 1,
      status: "active",
      isFeatured: sourceCat.isFeatured || false,
      seoTitle: sourceCat.seoTitle ? `${sourceCat.seoTitle} Copy` : "",
      seoDescription: sourceCat.seoDescription || "",
      seoKeywords: sourceCat.seoKeywords || [],
      visibilityRules: sourceCat.visibilityRules || {}
    });

    // 2. Duplicate Category SEO
    const sourceSeo = await categorySeoModel.findOne({ categoryId: id });
    if (sourceSeo) {
      await categorySeoModel.create({
        categoryId: dupCat._id,
        title: sourceSeo.title ? `${sourceSeo.title} Copy` : "",
        description: sourceSeo.description || "",
        keywords: sourceSeo.keywords || []
      });
    }

    // 3. Duplicate Category Attributes and options
    const sourceAttrs = await categoryAttributeModel.find({ categoryId: id });
    for (const attr of sourceAttrs) {
      const dupAttr = await categoryAttributeModel.create({
        categoryId: dupCat._id,
        fieldName: attr.fieldName,
        label: attr.label,
        placeholder: attr.placeholder || "",
        description: attr.description || "",
        helpText: attr.helpText || "",
        fieldType: attr.fieldType,
        isRequired: attr.isRequired || false,
        isSearchable: attr.isSearchable || false,
        isFilterable: attr.isFilterable || false,
        isSortable: attr.isSortable || false,
        visibleOnListing: attr.visibleOnListing !== false,
        visibleOnSearch: attr.visibleOnSearch !== false,
        visibleOnSellerForm: attr.visibleOnSellerForm !== false,
        visibleOnAdminForm: attr.visibleOnAdminForm !== false,
        defaultValue: attr.defaultValue || "",
        validationRules: attr.validationRules || {},
        conditionalRules: attr.conditionalRules || {},
        displayOrder: attr.displayOrder || 0
      });

      // Duplicate options if any
      const sourceOpts = await categoryAttributeOptionModel.find({ attributeId: attr._id });
      for (const opt of sourceOpts) {
        await categoryAttributeOptionModel.create({
          attributeId: dupAttr._id,
          label: opt.label,
          value: opt.value,
          displayOrder: opt.displayOrder || 0,
          status: opt.status || "active"
        });
      }
    }

    await writeLog(req, "Duplicate Category", sourceCat.name, `Duplicated to: ${duplicatedName}`);
    res.json({ success: true, message: "Category duplicated successfully", category: dupCat });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= PRODUCT MODERATION ================= */
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await productModel.find({}).populate("sellerId", "shopName").sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProductStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const product = await productModel.findByIdAndUpdate(id, { status }, { new: true });
    await writeLog(req, "Update Product Moderation Status", product.name, `Moderation status set to: ${status}`);
    res.json({ success: true, message: `Product listing status updated to ${status}`, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const flagFakeProduct = async (req, res) => {
  try {
    const { id, isFake } = req.body;
    const product = await productModel.findByIdAndUpdate(id, { isFake, status: isFake ? "disabled" : "approved" }, { new: true });
    await writeLog(req, isFake ? "Flag Fake Listing" : "Unflag Listing", product.name, `Marked as fake/prohibited: ${isFake}`);
    res.json({ success: true, message: isFake ? "Listing disabled and flagged as fake" : "Listing unflagged", product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const product = await productModel.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    await writeLog(req, "Remove Product Listing", product.name, `Product ID: ${req.params.id}`);
    res.json({ success: true, message: "Product listing permanently removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ORDER & DELIVERY MANAGEMENT ================= */
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await orderModel.find({}).populate("deliverymanId", "name").sort({ createdAt: -1 });
    
    // Fetch active assignments for these orders
    const orderIds = orders.map(o => o._id);
    const assignments = await deliveryAssignmentModel.find({
      orderId: { $in: orderIds },
      status: { $nin: ["Cancelled", "Rejected"] }
    });

    const ordersWithAssignments = orders.map(order => {
      const orderObj = order.toObject();
      if (order.deliverymanId) {
        const driverIdStr = order.deliverymanId._id 
          ? order.deliverymanId._id.toString() 
          : order.deliverymanId.toString();
          
        const assignment = assignments.find(
          a => a.orderId.toString() === order._id.toString() &&
               a.agentId.toString() === driverIdStr
        );
        orderObj.assignmentStatus = assignment ? assignment.status : "Assigned";
        orderObj.assignedAt = assignment ? assignment.assignedAt : null;
      } else {
        orderObj.assignmentStatus = null;
        orderObj.assignedAt = null;
      }
      return orderObj;
    });

    res.json({ success: true, orders: ordersWithAssignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reassignOrderAgent = async (req, res) => {
  try {
    const { orderId, deliverymanId } = req.body;

    // Cancel existing active assignments
    await deliveryAssignmentModel.updateMany(
      { orderId, status: { $in: ["Assigned", "Accepted", "Picked Up", "Out for Delivery"] } },
      { status: "Cancelled" }
    );

    if (deliverymanId) {
      await deliveryAssignmentModel.create({
        orderId,
        agentId: deliverymanId,
        status: "Assigned"
      });
    }

    const order = await orderModel.findByIdAndUpdate(orderId, { deliverymanId }, { new: true });
    await writeLog(req, "Reassign Delivery Agent", `Order #${orderId}`, `Agent set to: ${deliverymanId || "unassigned"}`);
    res.json({ success: true, message: "Delivery agent assigned successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelOrderAdmin = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await orderModel.findByIdAndUpdate(orderId, { orderStatus: "Cancelled" }, { new: true });
    await writeLog(req, "Cancel Order", `Order #${orderId}`, `Order set to Cancelled`);
    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { orderId, resolution } = req.body;
    const order = await orderModel.findByIdAndUpdate(orderId, { orderStatus: resolution }, { new: true });
    await writeLog(req, "Resolve Order Dispute", `Order #${orderId}`, `Resolution: ${resolution}`);
    res.json({ success: true, message: "Order dispute resolved", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= RETURN & REFUND MANAGEMENT ================= */
export const getAllReturnRequestsAdmin = async (req, res) => {
  try {
    const returns = await returnRequestModel.find({}).populate("userId", "name").sort({ createdAt: -1 });
    res.json({ success: true, returns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReturnStatus = async (req, res) => {
  try {
    const { requestId, status, adminNote } = req.body;
    const returnReq = await returnRequestModel.findById(requestId);
    if (!returnReq) return res.status(404).json({ success: false, message: "Return request not found" });

    returnReq.status = status;
    if (adminNote) returnReq.adminNote = adminNote;
    await returnReq.save();

    if (status === "Completed" || status === "Approved") {
      await orderModel.findByIdAndUpdate(returnReq.orderId, { paymentStatus: "Refunded" });
    }

    await writeLog(req, "Update Return Status", `Return ID: ${requestId}`, `Status set to: ${status}`);
    res.json({ success: true, message: "Return request status updated", returnReq });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= REVIEW MODERATION ================= */
export const hideProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.body;
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (review) {
      review.comment = "[Review hidden by Administrator]";
      await product.save();
      await writeLog(req, "Hide Product Review", product.name, `Hidden review ID: ${reviewId}`);
    }

    res.json({ success: true, message: "Product review hidden" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProductReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.body;
    const product = await productModel.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    product.reviews = product.reviews.filter(r => r._id.toString() !== reviewId);
    await product.save();

    await writeLog(req, "Delete Product Review", product.name, `Removed review ID: ${reviewId}`);
    res.json({ success: true, message: "Product review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= PLATFORM SETTINGS & FINANCE ================= */
export const getFinanceSettings = async (req, res) => {
  try {
    let settings = await platformSettingModel.findOne({});
    if (!settings) {
      settings = await platformSettingModel.create({ commissionPercentage: 10, totalPlatformEarnings: 0 });
    }
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateFinanceSettings = async (req, res) => {
  try {
    const { commissionPercentage } = req.body;
    let settings = await platformSettingModel.findOneAndUpdate({}, { commissionPercentage }, { new: true, upsert: true });
    await writeLog(req, "Update Platform Finance Settings", "Platform", `Commission percentage set to: ${commissionPercentage}%`);
    res.json({ success: true, message: "Platform settings updated", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= NOTIFICATIONS ================= */
export const sendAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    
    if (targetRole === "customers") {
      const users = await userModel.find({});
      const notifications = users.map(u => ({ userId: u._id, title, message }));
      await notificationModel.insertMany(notifications);
    } else {
      const users = await userModel.find({});
      const notifications = users.map(u => ({ userId: u._id, title, message }));
      await notificationModel.insertMany(notifications);
    }

    await writeLog(req, "Send Platform Announcement", targetRole, `Title: ${title}`);
    res.json({ success: true, message: "Announcement broadcast successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= AUDIT LOGS ================= */
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await auditLogModel.find({}).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= ANALYTICS & REPORTS ================= */
export const getAdminRevenueAnalytics = async (req, res) => {
  try {
    const orders = await orderModel.find({ paymentStatus: "Paid" });
    const totalRev = orders.reduce((sum, o) => sum + Number(o.amount || 0), 0);
    res.json({ success: true, totalRevenue: totalRev, orderCount: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminOrderAnalytics = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, total: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminProductAnalytics = async (req, res) => {
  try {
    const products = await productModel.find({ isDeleted: { $ne: true } });
    res.json({ success: true, totalProducts: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminSellerAnalytics = async (req, res) => {
  try {
    const sellers = await sellerModel.find({});
    res.json({ success: true, totalSellers: sellers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminCustomerAnalytics = async (req, res) => {
  try {
    const customers = await userModel.find({});
    res.json({ success: true, totalCustomers: customers.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminDeliveryAnalytics = async (req, res) => {
  try {
    const agents = await deliverymanModel.find({});
    res.json({ success: true, totalAgents: agents.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= IMAGE RULES & MODERATION ================= */
export const configureImageRules = async (req, res) => {
  try {
    const { minImages, maxImages, allowedFormats, maxImageSizeMB, moderationEnabled } = req.body;
    let settings = await platformSettingModel.findOneAndUpdate(
      {},
      { minImages, maxImages, allowedFormats, maxImageSizeMB, moderationEnabled },
      { new: true, upsert: true }
    );
    await writeLog(req, "Configure Image Rules", "Platform", `Rules updated: Min ${minImages}, Max ${maxImages}`);
    res.json({ success: true, message: "Global image management rules updated", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const moderateProductMedia = async (req, res) => {
  try {
    const { imageId, action } = req.body;
    
    const image = await productImageModel.findById(imageId);
    if (!image) {
      return res.status(404).json({ success: false, message: "Product image not found" });
    }

    if (action === "delete") {
      const productId = image.productId;
      const wasCover = image.isCover;
      await productImageModel.findByIdAndDelete(imageId);

      if (wasCover) {
        const firstRemaining = await productImageModel.findOne({ productId }).sort({ displayOrder: 1 });
        if (firstRemaining) {
          firstRemaining.isCover = true;
          await firstRemaining.save();
        }
      }

      // Re-index remaining images
      const remainingImages = await productImageModel.find({ productId }).sort({ displayOrder: 1 });
      for (let i = 0; i < remainingImages.length; i++) {
        remainingImages[i].displayOrder = i;
        await remainingImages[i].save();
      }

      // Sync product model
      const product = await productModel.findById(productId);
      if (product) {
        product.images = remainingImages.map(img => img.imageUrl);
        await product.save();
      }

      await writeLog(req, "Moderate Product Media - Delete", `Product Image: ${imageId}`, `Deleted by administrator`);
      return res.json({ success: true, message: "Inappropriate product image removed by administrator" });
    }

    res.status(400).json({ success: false, message: "Invalid action" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductMediaAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const images = await productImageModel.find({ productId: id }).sort({ displayOrder: 1 });
    res.json({ success: true, images });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= CATEGORY DYNAMIC TEMPLATE SYSTEM ================= */
export const createCategoryTemplateField = async (req, res) => {
  try {
    const {
      categoryId,
      fieldName,
      fieldType,
      isRequired,
      validationRules,
      selectOptions, // Array or comma-separated string
      defaultValue,
      displayOrder,
      label,
      placeholder,
      description,
      helpText,
      isSearchable,
      isFilterable,
      isSortable,
      visibleOnListing,
      visibleOnSearch,
      visibleOnSellerForm,
      visibleOnAdminForm,
      conditionalRules
    } = req.body;

    const field = await categoryAttributeModel.create({
      categoryId,
      fieldName,
      fieldType,
      label: label || fieldName,
      placeholder: placeholder || "",
      description: description || "",
      helpText: helpText || "",
      fieldType,
      isRequired: isRequired || false,
      isSearchable: isSearchable || false,
      isFilterable: isFilterable || false,
      isSortable: isSortable || false,
      visibleOnListing: visibleOnListing !== false,
      visibleOnSearch: visibleOnSearch !== false,
      visibleOnSellerForm: visibleOnSellerForm !== false,
      visibleOnAdminForm: visibleOnAdminForm !== false,
      defaultValue: defaultValue || "",
      validationRules: validationRules || {},
      conditionalRules: conditionalRules || {},
      displayOrder: displayOrder || 0
    });

    // Populate selectOptions in categoryAttributeOptionModel if present
    const parsedOptions = Array.isArray(selectOptions)
      ? selectOptions
      : typeof selectOptions === "string" && selectOptions
      ? selectOptions.split(",").map(o => o.trim())
      : [];

    if (parsedOptions.length > 0) {
      for (let i = 0; i < parsedOptions.length; i++) {
        await categoryAttributeOptionModel.create({
          attributeId: field._id,
          label: parsedOptions[i],
          value: parsedOptions[i],
          displayOrder: i,
          status: "active"
        });
      }
    }

    await writeLog(req, "Create Category Template Field", fieldName, `Category ID: ${categoryId}`);
    
    // Return backward compatible response
    const fieldObj = field.toObject();
    fieldObj.selectOptions = parsedOptions;
    res.json({ success: true, message: "Template field created successfully", field: fieldObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategoryTemplateField = async (req, res) => {
  try {
    const {
      id,
      fieldName,
      fieldType,
      isRequired,
      validationRules,
      selectOptions,
      defaultValue,
      displayOrder,
      label,
      placeholder,
      description,
      helpText,
      isSearchable,
      isFilterable,
      isSortable,
      visibleOnListing,
      visibleOnSearch,
      visibleOnSellerForm,
      visibleOnAdminForm,
      conditionalRules
    } = req.body;

    const updateFields = {
      fieldName,
      fieldType,
      label,
      placeholder,
      description,
      helpText,
      isRequired,
      isSearchable,
      isFilterable,
      isSortable,
      visibleOnListing,
      visibleOnSearch,
      visibleOnSellerForm,
      visibleOnAdminForm,
      defaultValue,
      validationRules,
      conditionalRules,
      displayOrder
    };

    // Clean undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const field = await categoryAttributeModel.findByIdAndUpdate(id, updateFields, { new: true });
    if (!field) {
      return res.status(404).json({ success: false, message: "Template field not found" });
    }

    // Update select options if provided
    if (selectOptions !== undefined) {
      await categoryAttributeOptionModel.deleteMany({ attributeId: id });
      const parsedOptions = Array.isArray(selectOptions)
        ? selectOptions
        : typeof selectOptions === "string" && selectOptions
        ? selectOptions.split(",").map(o => o.trim())
        : [];

      if (parsedOptions.length > 0) {
        for (let i = 0; i < parsedOptions.length; i++) {
          await categoryAttributeOptionModel.create({
            attributeId: id,
            label: parsedOptions[i],
            value: parsedOptions[i],
            displayOrder: i,
            status: "active"
          });
        }
      }
    }

    await writeLog(req, "Update Category Template Field", field.fieldName, `Field ID: ${id}`);

    // Return compatibility response
    const fieldObj = field.toObject();
    const currentOptions = await categoryAttributeOptionModel.find({ attributeId: id }).sort({ displayOrder: 1 });
    fieldObj.selectOptions = currentOptions.map(o => o.value);

    res.json({ success: true, message: "Template field updated successfully", field: fieldObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategoryTemplateField = async (req, res) => {
  try {
    const { id } = req.body;
    const field = await categoryAttributeModel.findByIdAndDelete(id);
    if (field) {
      await categoryAttributeOptionModel.deleteMany({ attributeId: id });
      await writeLog(req, "Delete Category Template Field", field.fieldName, `Removed Field ID: ${id}`);
    }
    res.json({ success: true, message: "Template field deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const reorderCategoryAttributes = async (req, res) => {
  try {
    const { order } = req.body; // array of { id, displayOrder }
    if (!Array.isArray(order)) {
      return res.status(400).json({ success: false, message: "order must be an array" });
    }

    const promises = order.map(item =>
      categoryAttributeModel.findByIdAndUpdate(item.id, { displayOrder: item.displayOrder })
    );
    await Promise.all(promises);

    res.json({ success: true, message: "Attributes reordered successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const configureCategorySettings = async (req, res) => {
  try {
    const { categoryId, minImages, maxImages, requiresApproval, inventoryTrackingEnabled, skuRequired, barcodeRequired } = req.body;
    const settings = await categorySettingsModel.findOneAndUpdate(
      { categoryId },
      { minImages, maxImages, requiresApproval, inventoryTrackingEnabled, skuRequired, barcodeRequired },
      { new: true, upsert: true }
    );
    await writeLog(req, "Configure Category Settings", `Category ID: ${categoryId}`, `Min Images: ${minImages}`);
    res.json({ success: true, message: "Category settings updated successfully", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategoryTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = await categoryAttributeModel.find({ categoryId: id }).sort({ displayOrder: 1 });
    let settings = await categorySettingsModel.findOne({ categoryId: id });
    if (!settings) {
      settings = await categorySettingsModel.create({ categoryId: id });
    }

    // Populate selectOptions for dropdowns/radios
    const populatedFields = [];
    for (const f of fields) {
      const fieldObj = f.toObject();
      const options = await categoryAttributeOptionModel.find({ attributeId: f._id }).sort({ displayOrder: 1 });
      fieldObj.selectOptions = options.map(o => o.value);
      populatedFields.push(fieldObj);
    }

    res.json({ success: true, fields: populatedFields, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const aiFillCategory = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ success: false, message: "Category name is required" });
  }

  const getRuleBasedFallback = (catName) => {
    const normalized = catName.toLowerCase();
    
    let description = `Browse our selected collection of premium ${catName} items. Find the best deals and top brands online at CartNOW.`;
    let icon = "ShoppingBag";
    let seoTitle = `Buy ${catName} Online | Premium Collection at CartNOW`;
    let seoDescription = `Shop the latest ${catName} collections. Enjoy free shipping, easy returns, and premium quality on all products.`;
    let seoKeywords = `${normalized}, buy ${normalized}, shop ${normalized}, online, cartnow`;

    if (normalized.includes("electronic") || normalized.includes("tech") || normalized.includes("phone") || normalized.includes("computer")) {
      description = "Explore the latest in high-performance electronics, smart gadgets, and high-tech essentials.";
      icon = "Smartphone";
      seoTitle = "Electronics & Gadgets Online | Tech Store - CartNOW";
      seoKeywords = "electronics, gadgets, smartphones, laptops, smart home, technology";
    } else if (normalized.includes("clothing") || normalized.includes("apparel") || normalized.includes("wear") || normalized.includes("shirt") || normalized.includes("dress") || normalized.includes("fashion")) {
      description = "Discover on-trend fashion, designer clothing, and premium apparel curated for style and comfort.";
      icon = "Shirt";
      seoTitle = "Fashion & Clothing Online | Trendy Apparel - CartNOW";
      seoKeywords = "fashion, clothing, designer apparel, shirts, dresses, outfit";
    } else if (normalized.includes("shoe") || normalized.includes("footwear") || normalized.includes("boot") || normalized.includes("sneaker")) {
      description = "Step out in style with our premium collection of designer footwear, sneakers, boots, and casual shoes.";
      icon = "Footprints";
      seoTitle = "Premium Footwear & Shoes Online | Sneakers & Boots - CartNOW";
      seoKeywords = "footwear, shoes, sneakers, boots, sandals, walk in style";
    } else if (normalized.includes("jewelry") || normalized.includes("gem") || normalized.includes("watch") || normalized.includes("accessory")) {
      description = "Add the perfect finishing touch with our selection of fine jewelry, smartwatches, and premium accessories.";
      icon = "Gem";
      seoTitle = "Jewelry & Premium Accessories Online | Shop Fine Jewels - CartNOW";
      seoKeywords = "jewelry, accessories, rings, necklaces, watches, luxury accessories";
    } else if (normalized.includes("home") || normalized.includes("decor") || normalized.includes("kitchen") || normalized.includes("furniture")) {
      description = "Transform your living spaces with our curated home decor, modern furniture, and kitchen essentials.";
      icon = "Home";
      seoTitle = "Home Decor & Kitchen Essentials Online | Modern Living - CartNOW";
      seoKeywords = "home decor, kitchenware, furniture, interior design, lifestyle";
    } else if (normalized.includes("beauty") || normalized.includes("care") || normalized.includes("cosmetic")) {
      description = "Pamper yourself with premium skincare, cosmetics, and organic personal care essentials.";
      icon = "Sparkles";
      seoTitle = "Beauty & Personal Care Online | Cosmetics & Skincare - CartNOW";
      seoKeywords = "beauty, cosmetics, skincare, personal care, makeup, self care";
    }

    return {
      description,
      icon,
      seoTitle,
      seoDescription,
      seoKeywords
    };
  };

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.warn("AI configuration missing. Using rule-based fallback.");
      return res.json({ success: true, data: getRuleBasedFallback(name), isFallback: true });
    }

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;

    const prompt = `You are an expert e-commerce catalog optimizer. For the category name "${name}", generate standard metadata fields.
Return the output STRICTLY as a valid JSON object matching this schema exactly, and nothing else (no markdown wrappers like \`\`\`json, no notes):
{
  "description": "Engaging description of the category",
  "icon": "A single word for a standard Lucide icon representing this category (e.g. Smartphone, Gem, Shirt, Laptop, Compass, Heart, Footprints, ShoppingBag, Tv, Home, Sparkles)",
  "seoTitle": "High-converting SEO page title",
  "seoDescription": "Meta description under 160 characters",
  "seoKeywords": "comma, separated, list, of, keywords"
}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1000
        }
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.error?.message || "Gemini API error");
    }

    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    const jsonString = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    const parsedData = JSON.parse(jsonString);

    res.json({ success: true, data: parsedData });
  } catch (error) {
    console.error("AI category fill error, falling back:", error.message);
    res.json({ 
      success: true, 
      data: getRuleBasedFallback(name), 
      isFallback: true,
      warning: "AI service temporarily unavailable. Generated smart metadata instead." 
    });
  }
};

export const aiFillCategoryTemplate = async (req, res) => {
  const { categoryId, categoryName } = req.body;
  if (!categoryId || !categoryName?.trim()) {
    return res.status(400).json({ success: false, message: "Category ID and Name are required" });
  }

  // Define rule-based fallback attributes for common categories
  const getRuleBasedFallbackTemplate = (catName) => {
    const normalized = catName.toLowerCase();
    
    if (normalized.includes("electronic") || normalized.includes("tech") || normalized.includes("phone") || normalized.includes("computer")) {
      return [
        { fieldName: "brand", label: "Brand", fieldType: "Dropdown", selectOptions: ["Apple", "Samsung", "Sony", "Dell", "HP", "Lenovo", "Asus", "Xiaomi"], isRequired: true, isFilterable: true, isSearchable: true },
        { fieldName: "warranty_period", label: "Warranty Period", fieldType: "Dropdown", selectOptions: ["6 Months", "1 Year", "2 Years", "No Warranty"], isRequired: false, isFilterable: true, isSearchable: false },
        { fieldName: "color", label: "Color", fieldType: "Dropdown", selectOptions: ["Black", "White", "Silver", "Gray", "Blue"], isRequired: false, isFilterable: true, isSearchable: true }
      ];
    } else if (normalized.includes("clothing") || normalized.includes("apparel") || normalized.includes("wear") || normalized.includes("shirt") || normalized.includes("dress") || normalized.includes("fashion")) {
      return [
        { fieldName: "material", label: "Material", fieldType: "Dropdown", selectOptions: ["Cotton", "Polyester", "Wool", "Leather", "Denim", "Silk", "Linen"], isRequired: true, isFilterable: true, isSearchable: true },
        { fieldName: "color", label: "Color", fieldType: "Dropdown", selectOptions: ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Multi"], isRequired: true, isFilterable: true, isSearchable: true },
        { fieldName: "fit_type", label: "Fit Type", fieldType: "Dropdown", selectOptions: ["Regular Fit", "Slim Fit", "Loose Fit", "Oversized"], isRequired: false, isFilterable: true, isSearchable: false }
      ];
    } else {
      // General fallbacks
      return [
        { fieldName: "brand", label: "Brand", fieldType: "Dropdown", selectOptions: ["Generic", "Premium", "Other"], isRequired: false, isFilterable: true, isSearchable: true },
        { fieldName: "color", label: "Color", fieldType: "Dropdown", selectOptions: ["Black", "White", "Red", "Blue", "Multi"], isRequired: false, isFilterable: true, isSearchable: true },
        { fieldName: "material", label: "Material", fieldType: "Dropdown", selectOptions: ["Plastic", "Metal", "Wood", "Fabric", "Glass"], isRequired: false, isFilterable: true, isSearchable: true }
      ];
    }
  };

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let fieldsToInsert = [];

    if (geminiApiKey) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`;
      const prompt = `You are a professional catalog architect. For the product category named "${categoryName}", generate a list of 4-6 typical custom specification attribute fields.
Each field MUST have:
1. "fieldName": lower_snake_case key for database (e.g. storage_size, frame_material, display_resolution, voltage).
2. "label": user-friendly name (e.g. Storage Capacity, Frame Material, Resolution, Input Voltage).
3. "fieldType": choose ONLY from: ["Dropdown", "Multi Select", "Radio Button", "Checkbox", "Text", "Number"].
4. "selectOptions": array of typical options if Dropdown, Multi Select, or Radio Button.
5. "isRequired": boolean.
6. "isFilterable": boolean.
7. "isSearchable": boolean.

Return the output STRICTLY as a valid JSON array of objects, and nothing else (no markdown wrappers like \`\`\`json, no notes):
[
  {
    "fieldName": "storage_capacity",
    "label": "Storage Capacity",
    "fieldType": "Dropdown",
    "selectOptions": ["128GB", "256GB", "512GB", "1TB"],
    "isRequired": true,
    "isFilterable": true,
    "isSearchable": true
  }
]`;

      const response = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1500
          }
        })
      });

      const data = await response.json();
      if (response.ok) {
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        const jsonString = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
        fieldsToInsert = JSON.parse(jsonString);
      }
    }

    if (!fieldsToInsert || fieldsToInsert.length === 0) {
      console.warn("AI generation offline/failed. Using fallback templates.");
      fieldsToInsert = getRuleBasedFallbackTemplate(categoryName);
    }

    // Insert fields and their options into database
    const createdFields = [];
    for (let idx = 0; idx < fieldsToInsert.length; idx++) {
      const f = fieldsToInsert[idx];
      try {
        const fieldDoc = await categoryAttributeModel.create({
          categoryId,
          fieldName: f.fieldName,
          fieldType: f.fieldType || "Text",
          label: f.label || f.fieldName,
          isRequired: f.isRequired || false,
          isFilterable: f.isFilterable || false,
          isSearchable: f.isSearchable || false,
          displayOrder: idx
        });

        const opts = f.selectOptions || [];
        if (opts.length > 0) {
          for (let oIdx = 0; oIdx < opts.length; oIdx++) {
            await categoryAttributeOptionModel.create({
              attributeId: fieldDoc._id,
              label: opts[oIdx],
              value: opts[oIdx],
              displayOrder: oIdx,
              status: "active"
            });
          }
        }

        const fieldObj = fieldDoc.toObject();
        fieldObj.selectOptions = opts;
        createdFields.push(fieldObj);
      } catch (err) {
        // Skip duplicate index keys
        console.error("Failed to create attribute:", err.message);
      }
    }

    await writeLog(req, "AI Fill Category Template Attributes", categoryName, `Category ID: ${categoryId}`);
    res.json({ success: true, message: "Taxonomy blueprint filled by AI successfully!", fields: createdFields });

  } catch (error) {
    console.error("AI template fill error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= COLLECTION & BRAND MANAGEMENT ================= */
export const getAllCollections = async (req, res) => {
  try {
    const collections = await collectionModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, collections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCollection = async (req, res) => {
  try {
    const { name, banner, description, status } = req.body;
    const slug = slugify(name);
    const collection = await collectionModel.create({
      name,
      slug,
      banner: banner || "",
      description: description || "",
      status: status || "active"
    });
    await writeLog(req, "Create Collection", name, `Created collection with slug: ${slug}`);
    res.json({ success: true, message: "Collection created successfully", collection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCollection = async (req, res) => {
  try {
    const { id, name, banner, description, status } = req.body;
    const updateFields = { name, banner, description, status };
    if (name) {
      updateFields.slug = slugify(name);
    }
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const collection = await collectionModel.findByIdAndUpdate(id, updateFields, { new: true });
    if (!collection) return res.status(404).json({ success: false, message: "Collection not found" });

    await writeLog(req, "Update Collection", collection.name, `Updated collection: ${collection.name}`);
    res.json({ success: true, message: "Collection updated successfully", collection });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCollection = async (req, res) => {
  try {
    const { id } = req.body;
    const collection = await collectionModel.findByIdAndDelete(id);
    if (collection) {
      await writeLog(req, "Delete Collection", collection.name, `Removed collection ID: ${id}`);
    }
    res.json({ success: true, message: "Collection deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllBrands = async (req, res) => {
  try {
    const brands = await brandModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBrand = async (req, res) => {
  try {
    const { name, logo, banner, status } = req.body;
    const slug = slugify(name);
    const brand = await brandModel.create({
      name,
      slug,
      logo: logo || "",
      banner: banner || "",
      status: status || "active"
    });
    await writeLog(req, "Create Brand", name, `Created brand with slug: ${slug}`);
    res.json({ success: true, message: "Brand created successfully", brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id, name, logo, banner, status } = req.body;
    const updateFields = { name, logo, banner, status };
    if (name) {
      updateFields.slug = slugify(name);
    }
    // Remove undefined fields
    Object.keys(updateFields).forEach(key => updateFields[key] === undefined && delete updateFields[key]);

    const brand = await brandModel.findByIdAndUpdate(id, updateFields, { new: true });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });

    await writeLog(req, "Update Brand", brand.name, `Updated brand: ${brand.name}`);
    res.json({ success: true, message: "Brand updated successfully", brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.body;
    const brand = await brandModel.findByIdAndDelete(id);
    if (brand) {
      await writeLog(req, "Delete Brand", brand.name, `Removed brand ID: ${id}`);
    }
    res.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
