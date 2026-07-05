import saleModel from "../models/saleModel.js";

// ── Admin: Create a sale banner ───────────────────────────────────────────────
export const createSale = async (req, res) => {
  try {
    const {
      title, subtitle, badge, discountPercent, discountLabel,
      bgColor, textColor, buttonText, buttonLink, image,
      category, validFrom, validTo, priority, publicId, folder
    } = req.body;

    if (!title || !validTo) {
      return res.json({ success: false, message: "Title and validTo are required" });
    }

    const sale = new saleModel({
      title, subtitle, badge, discountPercent, discountLabel,
      bgColor, textColor, buttonText, buttonLink, image,
      category, validFrom, validTo,
      priority: priority || 0,
      active: true,
      publicId: publicId || "",
      folder: folder || "cartnow/ads",
      expiresAt: new Date(validTo)
    });

    await sale.save();
    res.json({ success: true, message: "Sale created successfully", sale });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Admin: Get all sales ───────────────────────────────────────────────────────
export const getAllSales = async (req, res) => {
  try {
    const sales = await saleModel.find({}).sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, sales });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Admin: Toggle active status ───────────────────────────────────────────────
export const toggleSale = async (req, res) => {
  try {
    const sale = await saleModel.findById(req.params.id);
    if (!sale) return res.json({ success: false, message: "Sale not found" });
    
    const wasActive = sale.active;
    sale.active = !wasActive;
    
    if (sale.active) {
      sale.expiresAt = new Date(sale.validTo);
    } else {
      sale.expiresAt = null;
    }
    
    await sale.save();
    res.json({ success: true, message: `Sale ${sale.active ? "activated" : "deactivated"}`, sale });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Admin: Delete a sale ──────────────────────────────────────────────────────
export const deleteSale = async (req, res) => {
  try {
    await saleModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Sale deleted" });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

// ── Public: Get active, valid sales (for user home page) ──────────────────────
export const getActiveSales = async (req, res) => {
  try {
    const now = new Date();
    const sales = await saleModel.find({
      active: true,
      validFrom: { $lte: now },
      validTo: { $gte: now },
    }).sort({ priority: -1, createdAt: -1 });
    res.json({ success: true, sales });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};
