import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import { trackWishlistToggle } from "../utils/analyticsHelper.js";

// Toggle a product in wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) {
      return res.json({ success: false, message: "Product ID required" });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    let wishlist = user.wishlistData || [];
    const index = wishlist.indexOf(productId);

    if (index === -1) {
      wishlist.push(productId);
    } else {
      wishlist.splice(index, 1);
    }

    user.wishlistData = wishlist;
    await user.save();

    // Track wishlist count changes dynamically
    await trackWishlistToggle(productId, index === -1);

    res.json({ success: true, message: index === -1 ? "Added to wishlist" : "Removed from wishlist", wishlist });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Get all wishlist items for a user
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const wishlistIds = user.wishlistData || [];
    // Populate product details
    const products = await productModel.find({ _id: { $in: wishlistIds } });

    res.json({ success: true, wishlist: wishlistIds, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
