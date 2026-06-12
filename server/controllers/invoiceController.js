import invoiceModel from "../models/invoiceModel.js";
import orderModel from "../models/orderModel.js";
import { checkAndGenerateInvoice } from "../utils/invoicePdfGenerator.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Customers retrieve their invoices
export const getMyInvoices = async (req, res) => {
  try {
    const customerId = req.user._id;
    const invoices = await invoiceModel
      .find({ customerId })
      .populate("orderId")
      .sort({ createdAt: -1 });

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Sellers retrieve invoices containing their products
export const getSellerInvoices = async (req, res) => {
  try {
    const sellerId = req.seller._id;
    const invoices = await invoiceModel
      .find({ sellerIds: sellerId })
      .populate("orderId")
      .sort({ createdAt: -1 });

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admins retrieve all invoices with dynamic filters
export const getAdminInvoices = async (req, res) => {
  try {
    const { q, startDate, endDate, status } = req.query;
    const query = {};

    if (q) {
      const regex = new RegExp(q, "i");
      query.$or = [
        { invoiceNumber: regex },
        { paymentMethod: regex },
      ];
    }

    if (status) {
      query.paymentStatus = status;
    }

    if (startDate || endDate) {
      query.invoiceDate = {};
      if (startDate) query.invoiceDate.$gte = new Date(startDate);
      if (endDate) query.invoiceDate.$lte = new Date(endDate);
    }

    const invoices = await invoiceModel
      .find(query)
      .populate("orderId")
      .populate("customerId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Secure PDF Download Gate
export const downloadInvoicePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const invoice = await invoiceModel.findById(id);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Role-based Security Gate
    const userId = req.user?._id?.toString();
    const sellerId = req.seller?._id?.toString();
    const isAdmin = req.isAdmin; // admin auth middleware sets req.isAdmin = true or verifies password

    const isCustomerOwner = userId && invoice.customerId.toString() === userId;
    const isSellerOwner = sellerId && invoice.sellerIds.some(sid => sid.toString() === sellerId);

    if (!isCustomerOwner && !isSellerOwner && !isAdmin && !req.headers.token) {
      return res.status(403).json({ success: false, message: "Access Denied: Unauthorized to view this invoice" });
    }

    const filePath = path.join(__dirname, "..", "public", "invoices", `${invoice.invoiceNumber}.pdf`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Invoice physical file does not exist" });
    }

    res.download(filePath, `${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Re-generate Invoice PDF
export const regenerateInvoice = async (req, res) => {
  try {
    const { id } = req.body;
    const invoice = await invoiceModel.findById(id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }

    // Delete existing file if any
    const filePath = path.join(__dirname, "..", "public", "invoices", `${invoice.invoiceNumber}.pdf`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Re-trigger invoice compilation
    await checkAndGenerateInvoice(invoice.orderId);

    res.json({ success: true, message: "Invoice PDF successfully re-generated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
