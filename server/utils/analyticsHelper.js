import productModel from "../models/productModel.js";
import brandModel from "../models/brandModel.js";
import categoryModel from "../models/categoryModel.js";
import collectionModel from "../models/collectionModel.js";
import recentlyViewedModel from "../models/recentlyViewedModel.js";
import searchQueryModel from "../models/searchQueryModel.js";

/**
 * Tracks a product view. Increments view counts on the product, and its corresponding
 * category, brand, and collections. Logs user-specific recently viewed history.
 */
export async function trackProductView(productId, userId) {
  try {
    if (!productId) return;
    
    // 1. Increment product viewCount
    const product = await productModel.findByIdAndUpdate(
      productId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!product) return;

    // 2. Increment category totalViews
    if (product.category) {
      await categoryModel.findOneAndUpdate(
        { name: { $regex: new RegExp("^" + product.category.trim() + "$", "i") } },
        { $inc: { totalViews: 1 } }
      );
    }

    // 3. Increment brand totalViews
    if (product.brand) {
      await brandModel.findOneAndUpdate(
        { name: { $regex: new RegExp("^" + product.brand.trim() + "$", "i") } },
        { $inc: { totalViews: 1 } }
      );
    }

    // 4. Increment collections totalViews and totalClicks
    const colls = [];
    if (product.collection) colls.push(product.collection.trim());
    if (product.collections && Array.isArray(product.collections)) {
      product.collections.forEach(c => {
        if (c && !colls.includes(c.trim())) colls.push(c.trim());
      });
    }

    for (const cName of colls) {
      await collectionModel.findOneAndUpdate(
        { name: { $regex: new RegExp("^" + cName + "$", "i") } },
        { $inc: { totalViews: 1, totalClicks: 1 } }
      );
    }

    // 5. Track recently viewed for logged-in users
    if (userId) {
      await recentlyViewedModel.findOneAndUpdate(
        { userId, productId },
        { $set: { lastViewed: new Date() } },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error("Error in trackProductView:", error);
  }
}

/**
 * Tracks a search query and optional search inside a specific category.
 */
export async function trackSearch(queryText, categoryName) {
  try {
    if (queryText && queryText.trim()) {
      const qClean = queryText.trim().toLowerCase();
      // Skip empty or trivial searches
      if (qClean.length > 1) {
        await searchQueryModel.findOneAndUpdate(
          { query: qClean },
          { $inc: { count: 1 }, $set: { lastSearched: new Date() } },
          { upsert: true, new: true }
        );
      }
    }

    if (categoryName && categoryName.trim()) {
      await categoryModel.findOneAndUpdate(
        { name: { $regex: new RegExp("^" + categoryName.trim() + "$", "i") } },
        { $inc: { totalSearches: 1 } }
      );
    }
  } catch (error) {
    console.error("Error in trackSearch:", error);
  }
}

/**
 * Tracks purchases when checkout is completed. Increments product purchaseCount and totalSold.
 * Also increments totalSales on product's category, brand, and collections.
 */
export async function trackPurchase(items) {
  try {
    if (!items || !Array.isArray(items)) return;
    for (const item of items) {
      const prodId = item.productId || item._id || item.itemId;
      const qty = Number(item.qty || item.quantity || 1);
      if (!prodId) continue;

      const product = await productModel.findByIdAndUpdate(
        prodId,
        { $inc: { purchaseCount: qty, totalSold: qty } },
        { new: true }
      );
      if (!product) continue;

      // Update category totalSales
      if (product.category) {
        await categoryModel.findOneAndUpdate(
          { name: { $regex: new RegExp("^" + product.category.trim() + "$", "i") } },
          { $inc: { totalSales: qty } }
        );
      }

      // Update brand totalSales
      if (product.brand) {
        await brandModel.findOneAndUpdate(
          { name: { $regex: new RegExp("^" + product.brand.trim() + "$", "i") } },
          { $inc: { totalSales: qty } }
        );
      }

      // Update collections totalSales
      const colls = [];
      if (product.collection) colls.push(product.collection.trim());
      if (product.collections && Array.isArray(product.collections)) {
        product.collections.forEach(c => {
          if (c && !colls.includes(c.trim())) colls.push(c.trim());
        });
      }

      for (const cName of colls) {
        await collectionModel.findOneAndUpdate(
          { name: { $regex: new RegExp("^" + cName + "$", "i") } },
          { $inc: { totalSales: qty } }
        );
      }
    }
  } catch (error) {
    console.error("Error in trackPurchase:", error);
  }
}

/**
 * Tracks additions/removals from user wishlist.
 */
export async function trackWishlistToggle(productId, isAdded) {
  try {
    if (!productId) return;
    const diff = isAdded ? 1 : -1;
    await productModel.findByIdAndUpdate(productId, {
      $inc: { wishlistCount: diff }
    });
  } catch (error) {
    console.error("Error in trackWishlistToggle:", error);
  }
}

/**
 * Tracks additions to user shopping cart.
 */
export async function trackCartAdd(productId, qty) {
  try {
    if (!productId) return;
    const addedQty = Number(qty || 1);
    await productModel.findByIdAndUpdate(productId, {
      $inc: { cartCount: addedQty }
    });
  } catch (error) {
    console.error("Error in trackCartAdd:", error);
  }
}
