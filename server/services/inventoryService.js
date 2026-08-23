import mongoose from "mongoose";
import productModel from "../models/productModel.js";

/**
 * Custom error class for inventory/stock conflicts
 */
export class InventoryError extends Error {
  constructor(message, code = "ITEM_SOLD_OUT", details = {}) {
    super(message);
    this.name = "InventoryError";
    this.code = code;
    this.statusCode = 409;
    this.details = details;
  }
}

/**
 * Validates products, re-calculates server-side prices, and reserves stock atomically.
 * Returns authoritative order totals & sanitized item objects.
 */
export const reserveInventoryAndValidateOrder = async ({ items, discount = 0, session = null }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new InventoryError("Checkout request contains no items.", "INVALID_ITEMS");
  }

  const validatedItems = [];
  let calculatedSubtotal = 0;

  for (const rawItem of items) {
    const prodId = rawItem.productId || rawItem._id || rawItem.id || rawItem.itemId;
    const requestedQty = Math.max(1, Number(rawItem.qty) || 1);
    const requestedSize = (rawItem.size || "").trim();

    if (!prodId || !mongoose.Types.ObjectId.isValid(prodId)) {
      throw new InventoryError(`Invalid product ID provided.`, "INVALID_PRODUCT_ID");
    }

    // 1. Fetch Product with Session Lock/Read
    const query = productModel.findById(prodId);
    if (session) query.session(session);
    const product = await query;

    if (!product || product.isDeleted || product.status === "disabled" || product.status === "rejected") {
      throw new InventoryError(
        `Product "${rawItem.name || "item"}" is no longer available.`,
        "PRODUCT_UNAVAILABLE",
        { productId: prodId }
      );
    }

    // 2. Determine Variant matching & Stock reservation strategy
    let isVariantMatch = false;
    let selectedVariant = null;

    if (product.variants && Array.isArray(product.variants) && product.variants.length > 0 && requestedSize) {
      selectedVariant = product.variants.find(
        (v) => (v.Size || "").toLowerCase() === requestedSize.toLowerCase() || (v.sku && v.sku === rawItem.sku)
      );
      if (selectedVariant) {
        isVariantMatch = true;
      }
    }

    // Authoritative Server-Side Price Calculation (Never trust req.body.price!)
    const unitPrice = isVariantMatch && selectedVariant.price > 0 ? selectedVariant.price : product.price;
    const originalPrice = product.originalPrice > unitPrice ? product.originalPrice : Math.round(unitPrice * 1.25);
    const itemSubtotal = unitPrice * requestedQty;
    calculatedSubtotal += itemSubtotal;

    // 3. ATOMIC CONDITIONAL STOCK RESERVATION
    let updatedProduct = null;

    if (isVariantMatch) {
      // Atomic Update on matching sub-document variant stock AND top-level stock
      const updateOptions = { new: true };
      if (session) updateOptions.session = session;

      updatedProduct = await productModel.findOneAndUpdate(
        {
          _id: prodId,
          status: "approved",
          isDeleted: { $ne: true },
          "variants.Size": selectedVariant.Size,
          "variants.stock": { $gte: requestedQty }
        },
        {
          $inc: {
            "variants.$.stock": -requestedQty,
            stock: -requestedQty
          }
        },
        updateOptions
      );
    } else {
      // Atomic Update on top-level product stock
      const updateOptions = { new: true };
      if (session) updateOptions.session = session;

      updatedProduct = await productModel.findOneAndUpdate(
        {
          _id: prodId,
          status: "approved",
          isDeleted: { $ne: true },
          stock: { $gte: requestedQty }
        },
        {
          $inc: { stock: -requestedQty }
        },
        updateOptions
      );
    }

    if (!updatedProduct) {
      const variantDesc = requestedSize ? ` (Size: ${requestedSize})` : "";
      throw new InventoryError(
        `Sorry, "${product.name}"${variantDesc} just sold out or does not have ${requestedQty} available units.`,
        "ITEM_SOLD_OUT",
        { productId: prodId, productName: product.name, requestedQty }
      );
    }

    validatedItems.push({
      productId: product._id,
      name: product.name,
      image: rawItem.image || product.images?.[0] || "",
      qty: requestedQty,
      unitPrice,
      originalPrice,
      size: requestedSize || "Standard",
      sku: selectedVariant?.sku || product.sku || "",
      sellerId: product.sellerId,
      selectedAttributes: rawItem.selectedAttributes || {},
      isVariant: isVariantMatch
    });
  }

  // Authoritative Order Financials Calculation
  const discountVal = Math.min(calculatedSubtotal, Math.max(0, Number(discount) || 0));
  const shippingFee = calculatedSubtotal > 519 ? 0 : 40;
  const tax = Math.round((calculatedSubtotal - discountVal) * 0.05);
  const calculatedTotal = Math.max(0, calculatedSubtotal - discountVal + shippingFee + tax);

  return {
    validatedItems,
    subtotal: calculatedSubtotal,
    discount: discountVal,
    shippingFee,
    tax,
    totalAmount: calculatedTotal
  };
};

/**
 * Restores stock for cancelled/failed order items EXACTLY ONCE.
 */
export const restoreItemStockSafely = async (item, session = null) => {
  if (!item || !item.productId || item.stockRestored) return false;

  const updateOptions = { new: true };
  if (session) updateOptions.session = session;

  const requestedQty = Number(item.quantity || item.qty) || 1;
  const size = item.variant?.size || item.size;

  if (size && size !== "Standard") {
    // Restore matching variant stock and top-level stock
    const res = await productModel.findOneAndUpdate(
      { _id: item.productId, "variants.Size": size },
      { $inc: { "variants.$.stock": requestedQty, stock: requestedQty } },
      updateOptions
    );
    if (!res) {
      await productModel.findByIdAndUpdate(item.productId, { $inc: { stock: requestedQty } }, updateOptions);
    }
  } else {
    await productModel.findByIdAndUpdate(item.productId, { $inc: { stock: requestedQty } }, updateOptions);
  }

  item.stockRestored = true;
  if (typeof item.save === "function") {
    await item.save(updateOptions);
  }

  return true;
};
