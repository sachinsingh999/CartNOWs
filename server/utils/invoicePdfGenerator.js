import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import invoiceModel from "../models/invoiceModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Generates invoice record and A4 PDF invoice for confirmed/paid order.
 * @param {string} orderId - Mongoose Order ID
 * @returns {Promise<Object>} Generated Invoice document
 */
export const checkAndGenerateInvoice = async (orderId) => {
  try {
    // 1. Fetch Order
    const order = await orderModel.findById(orderId).populate("userId");
    if (!order) {
      console.log(`Order ${orderId} not found.`);
      return null;
    }

    // 2. Validate Invoice Generation Trigger Rules
    const orderStatus = order.orderStatus;
    const paymentStatus = order.paymentStatus;
    const isCod = order.paymentMethod.toLowerCase() === "cod";

    // Online Payments: generate when paid. COD: generate when delivered. Refunded: generate Credit Note.
    // Prevent cancelled / failed orders.
    const isCancelledOrFailed = ["cancelled", "failed", "failed payment"].includes(orderStatus.toLowerCase());

    const triggerPaid = !isCod && (paymentStatus === "paid" || orderStatus === "Refunded") && !isCancelledOrFailed;
    const triggerCodDelivered = isCod && (orderStatus === "Delivered" || orderStatus === "Refunded");

    if (!triggerPaid && !triggerCodDelivered) {
      console.log(`Order ${orderId} conditions not met for invoice. Status: ${orderStatus}, Payment: ${paymentStatus}`);
      return null;
    }

    // Check if invoice already exists
    const existing = await invoiceModel.findOne({ orderId });
    if (existing && existing.orderStatus === orderStatus) {
      return existing;
    }

    console.log(`Generating/updating invoice/credit note for Order #${orderId}...`);

    // 3. Resolve unique invoice number
    let invoiceNumber = "";
    let invoiceDate = new Date();
    if (existing) {
      invoiceNumber = existing.invoiceNumber;
      invoiceDate = existing.invoiceDate;
    } else {
      const year = new Date().getFullYear();
      const count = await invoiceModel.countDocuments({});
      invoiceNumber = `INV-${year}-${String(count + 1).padStart(6, "0")}`;
    }

    // 4. Resolve Seller IDs and calculate pricing details
    const sellerIds = [];
    const itemDetails = [];
    let subtotal = 0;

    for (const item of order.items) {
      const product = await productModel.findById(item.productId || item._id);
      let sId = null;
      let sku = "N/A";
      if (product) {
        sId = product.sellerId;
        sku = product.sku || "N/A";
        if (sId && !sellerIds.map(id => id.toString()).includes(sId.toString())) {
          sellerIds.push(sId);
        }
      }

      const qty = item.qty || 1;
      const unitPrice = Number(item.price || 0);
      const totalItemAmount = unitPrice * qty;
      subtotal += totalItemAmount;

      itemDetails.push({
        name: item.name,
        sku,
        qty,
        unitPrice,
        total: totalItemAmount,
      });
    }

    // GST Tax Calculations: 18% GST (CGST 9% + SGST 9%)
    // Base Tax formula: Tax = subtotal * 0.18
    const taxRate = 0.18;
    const totalTax = subtotal * taxRate;
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const igst = 0; // default to local CGST/SGST

    const discount = Number(order.discount || 0);
    const shippingCharges = 10; // shipping charges constant
    const grandTotal = subtotal + totalTax - discount + shippingCharges;

    // 5. Generate and save PDF document
    const invoicesDir = path.join(__dirname, "..", "public", "invoices");
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const pdfFileName = `${invoiceNumber}.pdf`;
    const pdfPath = path.join(invoicesDir, pdfFileName);
    const pdfUrl = `/invoices/${pdfFileName}`;

    await buildInvoicePdf({
      invoiceNumber,
      invoiceDate,
      order,
      itemDetails,
      subtotal,
      discount,
      shippingCharges,
      cgst,
      sgst,
      igst,
      grandTotal,
      pdfPath,
    });

    let invoice;
    if (existing) {
      existing.orderStatus = order.orderStatus;
      existing.paymentStatus = order.orderStatus === "Refunded" ? "Refunded" : "Paid";
      existing.subtotal = subtotal;
      existing.discount = discount;
      existing.shippingCharges = shippingCharges;
      existing.taxAmount = totalTax;
      existing.cgst = cgst;
      existing.sgst = sgst;
      existing.igst = igst;
      existing.grandTotal = grandTotal;
      invoice = await existing.save();
      console.log(`Invoice ${invoiceNumber} updated successfully!`);
    } else {
      invoice = await invoiceModel.create({
        invoiceNumber,
        orderId,
        customerId: order.userId._id,
        sellerIds,
        invoiceDate,
        paymentMethod: order.paymentMethod,
        transactionId: order.verificationCode || "",
        paymentStatus: order.orderStatus === "Refunded" ? "Refunded" : "Paid",
        orderStatus: order.orderStatus,
        subtotal,
        discount,
        shippingCharges,
        taxAmount: totalTax,
        cgst,
        sgst,
        igst,
        grandTotal,
        pdfUrl,
      });
      console.log(`Invoice ${invoiceNumber} created successfully!`);
    }

    console.log(`Invoice ${invoiceNumber} created successfully! PDF path: ${pdfPath}`);
    return invoice;
  } catch (err) {
    console.error("Failed to generate invoice:", err);
    return null;
  }
};

/**
 * Builds the physical PDF using PDFKit
 */
const buildInvoicePdf = async (data) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    const writeStream = fs.createWriteStream(data.pdfPath);

    doc.pipe(writeStream);

    // Color Palette
    const primaryColor = "#0f172a"; // slate-900
    const secondaryColor = "#4f46e5"; // indigo-600
    const lightGrey = "#f8fafc";
    const textDark = "#1e293b";
    const textMuted = "#64748b";

    // Header Branding Section
    doc
      .fillColor(primaryColor)
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("CartNOW Marketplace", 40, 40);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(textMuted)
      .text("Premium Digital Commerce Platform", 40, 65)
      .text("GSTIN: 24AAACC1234F1Z9", 40, 78)
      .text("support@cartnow.com | +91 98765 43210", 40, 91)
      .text("www.cartnow.com", 40, 104);

    // Top Right Invoice Info block
    const isRefunded = data.order?.orderStatus === "Refunded";
    const documentTitle = isRefunded ? "CREDIT NOTE" : "TAX INVOICE";

    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(documentTitle, 400, 40, { align: "right" });

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(textDark)
      .text(`Invoice No: ${data.invoiceNumber}`, 400, 65, { align: "right" })
      .text(`Date: ${data.invoiceDate.toLocaleDateString()}`, 400, 78, { align: "right" })
      .text(`Order Ref: #${String(data.order._id).slice(-8).toUpperCase()}`, 400, 91, { align: "right" })
      .text(`Payment: ${data.order.paymentMethod}`, 400, 104, { align: "right" });

    // Decorative Horizontal Line
    doc
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .moveTo(40, 125)
      .lineTo(555, 125)
      .stroke();

    // Customer / Shipping Addresses
    const customer = data.order.userId;
    const addr = data.order.address || {};

    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(secondaryColor)
      .text("BILLING & SHIPPING DETAILS", 40, 140);

    doc
      .fontSize(9)
      .font("Helvetica")
      .fillColor(textDark)
      .text(`Client ID: ${customer?._id || "Guest"}`, 40, 158)
      .text(`Name: ${addr.firstName} ${addr.lastName || ""}`, 40, 171)
      .text(`Email: ${addr.email || customer?.email}`, 40, 184)
      .text(`Phone: ${addr.phone || customer?.phone}`, 40, 197);

    // Address lines
    const addrLine = `${addr.street || ""}, ${addr.city || ""}, ${addr.state || ""}, ${addr.country || ""}`;
    doc
      .text(`Address: ${addrLine}`, 40, 210, { width: 220 })
      .text(`Pincode: ${addr.pincode || "390001"}`, 40, 235);

    // Professional Items Table Header
    let startY = 270;
    doc
      .strokeColor("#cbd5e1")
      .lineWidth(1)
      .moveTo(40, startY)
      .lineTo(555, startY)
      .stroke();

    doc
      .fillColor(primaryColor)
      .fontSize(9)
      .font("Helvetica-Bold")
      .text("Product Name / Item Description", 45, startY + 6)
      .text("SKU Code", 250, startY + 6)
      .text("Qty", 350, startY + 6, { width: 30, align: "right" })
      .text("Unit Price", 400, startY + 6, { width: 60, align: "right" })
      .text("Amount (INR)", 480, startY + 6, { width: 70, align: "right" });

    doc
      .strokeColor("#cbd5e1")
      .moveTo(40, startY + 22)
      .lineTo(555, startY + 22)
      .stroke();

    // Table rows
    let currentY = startY + 22;
    doc.font("Helvetica").fontSize(8.5).fillColor(textDark);

    data.itemDetails.forEach((item) => {
      currentY += 6;
      doc
        .text(item.name, 45, currentY, { width: 190, height: 16, ellipsis: true })
        .text(item.sku, 250, currentY)
        .text(String(item.qty), 350, currentY, { width: 30, align: "right" })
        .text(`₹${item.unitPrice.toFixed(2)}`, 400, currentY, { width: 60, align: "right" })
        .text(`₹${item.total.toFixed(2)}`, 480, currentY, { width: 70, align: "right" });

      currentY += 16;
      doc
        .strokeColor("#f1f5f9")
        .moveTo(40, currentY)
        .lineTo(555, currentY)
        .stroke();
    });

    // Summary calculations block (Right aligned)
    currentY += 15;
    const summaryX = 350;

    doc.fontSize(8.5).fillColor(textMuted);
    
    doc.text("Subtotal:", summaryX, currentY);
    doc.text(`₹${data.subtotal.toFixed(2)}`, 480, currentY, { width: 70, align: "right" });

    currentY += 14;
    doc.text("CGST (9.0%):", summaryX, currentY);
    doc.text(`₹${data.cgst.toFixed(2)}`, 480, currentY, { width: 70, align: "right" });

    currentY += 14;
    doc.text("SGST (9.0%):", summaryX, currentY);
    doc.text(`₹${data.sgst.toFixed(2)}`, 480, currentY, { width: 70, align: "right" });

    currentY += 14;
    doc.text("Shipping Charges:", summaryX, currentY);
    doc.text(`₹${data.shippingCharges.toFixed(2)}`, 480, currentY, { width: 70, align: "right" });

    if (data.discount > 0) {
      currentY += 14;
      doc.fillColor("#e11d48"); // rose-600
      doc.text("Discount Applied:", summaryX, currentY);
      doc.text(`-₹${data.discount.toFixed(2)}`, 480, currentY, { width: 70, align: "right" });
    }

    currentY += 18;
    doc.strokeColor("#cbd5e1").moveTo(340, currentY).lineTo(555, currentY).stroke();

    // Grand Total Row
    currentY += 6;
    doc.font("Helvetica-Bold").fontSize(10.5).fillColor(primaryColor);
    doc.text("Grand Total (INR):", summaryX, currentY);
    doc.text(`₹${data.grandTotal.toFixed(2)}`, 480, currentY, { width: 70, align: "right" });

    // Payment confirmation seal/footer
    currentY += 45;
    doc
      .fontSize(8)
      .font("Helvetica-Oblique")
      .fillColor(textMuted)
      .text("This is an electronically generated tax invoice. No signature is required.", 40, currentY, { align: "center" })
      .text("Thank you for shopping with CartNOW!", 40, currentY + 12, { align: "center" });

    doc.end();

    writeStream.on("finish", () => {
      resolve();
    });

    writeStream.on("error", (err) => {
      reject(err);
    });
  });
};
