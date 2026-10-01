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
 * Helper to match a variant in product.variants based on:
 * 1. Variant _id / variantId
 * 2. SKU
 * 3. selectedAttributes object (e.g. { Color: "White", Size: "S" })
 * 4. Serialized size string (e.g. "Color:White,Size:S")
 * 5. Simple size/attribute string (e.g. "S", "White", "White, S")
 */
export const findMatchingVariant = (product, rawItem) => {
  if (!product?.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }

  const variantId = rawItem.variantId || rawItem.variant?._id || rawItem._id;
  const sku = (rawItem.sku || rawItem.variant?.sku || "").trim();
  const selectedAttributes = rawItem.selectedAttributes || rawItem.variant?.attributes || null;
  const requestedSize = (rawItem.size || rawItem.variant?.size || "").trim();

  // 1. Direct _id Match
  if (variantId && mongoose.Types.ObjectId.isValid(variantId)) {
    const match = product.variants.find((v) => String(v._id) === String(variantId));
    if (match) return match;
  }

  // 2. Direct SKU Match
  if (sku) {
    const match = product.variants.find((v) => v.sku && v.sku.toLowerCase() === sku.toLowerCase());
    if (match) return match;
  }

  // Parse attributes from rawItem.size if formatted as "Key:Val,Key:Val"
  let parsedAttrs = {};
  if (selectedAttributes && typeof selectedAttributes === "object" && Object.keys(selectedAttributes).length > 0) {
    parsedAttrs = { ...selectedAttributes };
  } else if (requestedSize && requestedSize.includes(":")) {
    const parts = requestedSize.split(",");
    for (const part of parts) {
      const [k, ...vParts] = part.split(":");
      if (k && vParts.length > 0) {
        parsedAttrs[k.trim()] = vParts.join(":").trim();
      }
    }
  }

  // 3. Match using parsed/selected attributes object
  if (Object.keys(parsedAttrs).length > 0) {
    const match = product.variants.find((v) => {
      const vAttrs = v.attributes || {};
      for (const [attrKey, attrVal] of Object.entries(parsedAttrs)) {
        const expectedVal = String(attrVal).toLowerCase().trim();
        const actualVal = String(vAttrs[attrKey] ?? v[attrKey] ?? "").toLowerCase().trim();
        if (actualVal !== expectedVal) {
          return false;
        }
      }
      return true;
    });
    if (match) return match;
  }

  // 4. Match using simple requestedSize string (e.g. "S", "M", "White, S")
  if (requestedSize && requestedSize !== "Standard") {
    const match = product.variants.find((v) => {
      const sizeVal = (v.Size || "").toLowerCase().trim();
      const colorVal = (v.Color || "").toLowerCase().trim();
      const reqVal = requestedSize.toLowerCase().trim();

      if (sizeVal === reqVal || colorVal === reqVal) return true;

      const subParts = reqVal.split(/[,/+\s]+/).map((s) => s.trim()).filter(Boolean);
      if (subParts.length > 1) {
        const allPresent = subParts.every((sp) => {
          const inSize = sizeVal.includes(sp);
          const inColor = colorVal.includes(sp);
          const inAttrs = Object.values(v.attributes || {}).some((val) =>
            String(val).toLowerCase().includes(sp)
          );
          return inSize || inColor || inAttrs;
        });
        if (allPresent) return true;
      }

      return false;
    });
    if (match) return match;
  }

  return null;
};

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
    const selectedVariant = findMatchingVariant(product, rawItem);
    const isVariantMatch = Boolean(selectedVariant);

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
          "variants._id": selectedVariant._id,
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
      const variantDesc = requestedSize ? ` (Variant: ${requestedSize})` : "";
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
      selectedAttributes: rawItem.selectedAttributes || selectedVariant?.attributes || {},
      isVariant: isVariantMatch,
      variantId: selectedVariant?._id || null
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
  const product = await productModel.findById(item.productId);
  if (!product) return false;

  const selectedVariant = findMatchingVariant(product, {
    variantId: item.variant?._id || item.variantId,
    sku: item.variant?.sku || item.sku,
    size: item.variant?.size || item.size,
    selectedAttributes: item.variant?.attributes || item.selectedAttributes
  });

  if (selectedVariant) {
    // Restore matching variant stock and top-level stock
    await productModel.findOneAndUpdate(
      { _id: item.productId, "variants._id": selectedVariant._id },
      { $inc: { "variants.$.stock": requestedQty, stock: requestedQty } },
      updateOptions
    );
  } else {
    await productModel.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: requestedQty } },
      updateOptions
    );
  }

  item.stockRestored = true;
  if (typeof item.save === "function") {
    await item.save(updateOptions);
  }

  return true;
};
