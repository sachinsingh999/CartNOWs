import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import postModel from "../models/postModel.js";
import postLikeModel from "../models/postLikeModel.js";
import postCommentModel from "../models/postCommentModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import userModel from "../models/userModel.js";
import storyModel from "../models/storyModel.js";

export const createPost = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No media file provided." });
    }

    const { caption = "" } = req.body;
    if (!caption.trim()) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: "Caption is required." });
    }

    const parsedTags = JSON.parse(req.body.taggedProducts || "[]");
    if (parsedTags.length === 0) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ success: false, message: "You must tag at least one product." });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
      folder: "cartnow_social",
    });

    // Delete local temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Extract hashtags
    const hashtags = caption.match(/#\w+/g)?.map((h) => h.slice(1).toLowerCase()) || [];

    // Check verification status (whether user bought the product)
    const taggedProducts = [];
    for (const tag of parsedTags) {
      const order = await orderModel.findOne({
        userId: req.user._id,
        $or: [
          { "items._id": tag.productId },
          { "items.productId": tag.productId },
        ],
      });

      taggedProducts.push({
        productId: tag.productId,
        x: tag.x,
        y: tag.y,
        isVerified: !!order,
      });
    }

    const newPost = new postModel({
      userId: req.user._id,
      type: req.file.mimetype.startsWith("video/") ? "video" : "image",
      mediaUrl: result.secure_url,
      caption,
      hashtags,
      taggedProducts,
    });

    await newPost.save();

    // Populate user and product info to return a complete post object
    const populatedPost = await newPost
      .populate("userId", "name profilePhoto")
      .then(p => p.populate("taggedProducts.productId", "name price images"));

    return res.status(201).json({
      success: true,
      message: "Post created successfully!",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");
    const skip = (page - 1) * limit;

    const posts = await postModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name profilePhoto")
      .populate("taggedProducts.productId", "name price images");

    const loggedInUserId = req.user?._id;
    let likedPostIds = [];
    let followingCreatorIds = [];

    if (loggedInUserId) {
      const postIds = posts.map((p) => p._id);
      const userLikes = await postLikeModel.find({
        userId: loggedInUserId,
        postId: { $in: postIds },
      });
      likedPostIds = userLikes.map((l) => l.postId.toString());

      const currentUserProfile = await userModel.findById(loggedInUserId, "following");
      if (currentUserProfile) {
        followingCreatorIds = currentUserProfile.following.map(id => id.toString());
      }
    }

    const postsWithLikeStatus = posts.map((p) => {
      const pObj = p.toObject();
      pObj.isLiked = likedPostIds.includes(p._id.toString());
      pObj.isFollowingCreator = p.userId ? followingCreatorIds.includes(p.userId._id.toString()) : false;
      return pObj;
    });

    return res.status(200).json({ success: true, posts: postsWithLikeStatus });
  } catch (error) {
    console.error("Error fetching feed:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const existingLike = await postLikeModel.findOne({ postId, userId });

    if (existingLike) {
      await postLikeModel.deleteOne({ _id: existingLike._id });
      await postModel.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
      return res.status(200).json({ success: true, message: "Unliked post.", liked: false });
    } else {
      const newLike = new postLikeModel({ postId, userId });
      await newLike.save();
      await postModel.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });
      return res.status(200).json({ success: true, message: "Liked post.", liked: true });
    }
  } catch (error) {
    console.error("Error liking post:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text cannot be empty." });
    }

    const comment = new postCommentModel({
      postId,
      userId,
      text,
    });

    await comment.save();
    await postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

    const populatedComment = await comment.populate("userId", "name profilePhoto");

    return res.status(201).json({ success: true, message: "Comment added.", comment: populatedComment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await postCommentModel
      .find({ postId })
      .sort({ createdAt: -1 })
      .populate("userId", "name profilePhoto");

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurchasedProducts = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.user._id });
    const productIds = new Set();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const id = item._id || item.productId;
        if (id) {
          productIds.add(id.toString());
        }
      });
    });

    const products = await productModel.find(
      {
        _id: { $in: Array.from(productIds) },
      },
      "name price images"
    );

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching purchased products:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTrendingHashtags = async (req, res) => {
  try {
    const hashtags = await postModel.aggregate([
      { $unwind: "$hashtags" },
      { $group: { _id: "$hashtags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    if (hashtags.length === 0) {
      const defaultTags = [
        { _id: "summersale", count: 12500 },
        { _id: "techsetup", count: 8700 },
        { _id: "fashionfinds", count: 7100 },
        { _id: "unboxing", count: 5300 },
        { _id: "cartnowreviews", count: 4200 }
      ];
      return res.status(200).json({ success: true, hashtags: defaultTags });
    }

    const formattedTags = hashtags.map(h => ({
      _id: h._id,
      count: h.count
    }));

    return res.status(200).json({ success: true, hashtags: formattedTags });
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSuggestedCreators = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const query = currentUserId ? { _id: { $ne: currentUserId } } : {};
    const users = await userModel.find(query, "name email profilePhoto followers").limit(5);

    const formatted = users.map(u => {
      const uObj = u.toObject();
      uObj.isFollowing = currentUserId ? u.followers.some(fid => fid.toString() === currentUserId.toString()) : false;
      return uObj;
    });

    return res.status(200).json({ success: true, creators: formatted });
  } catch (error) {
    console.error("Error fetching suggested creators:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopPicks = async (req, res) => {
  try {
    // Fetch 4 items from products catalog
    const products = await productModel.find({}, "name price images").limit(4);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching top picks:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleFollowUser = async (req, res) => {
  try {
    const { targetUserId } = req.params;
    const currentUserId = req.user._id;

    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: "You cannot follow yourself." });
    }

    const targetUser = await userModel.findById(targetUserId);
    const currentUser = await userModel.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const isFollowing = currentUser.following.some(id => id.toString() === targetUserId);

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUserId.toString());
      await currentUser.save();
      await targetUser.save();
      return res.status(200).json({ success: true, isFollowing: false, message: "Unfollowed successfully." });
    } else {
      currentUser.following.push(targetUserId);
      targetUser.followers.push(currentUserId);
      await currentUser.save();
      await targetUser.save();
      return res.status(200).json({ success: true, isFollowing: true, message: "Followed successfully." });
    }
  } catch (error) {
    console.error("Error toggle follow:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createStory = async (req, res) => {
  try {
    let mediaUrl = "";
    let mediaType = "image";

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "cartnow_stories",
      });
      mediaUrl = result.secure_url;
      mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";

      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } else {
      const { overlayText = "", backgroundGradient = "linear-gradient(135deg, #ff4e20 0%, #ec4899 100%)" } = req.body;
      if (!overlayText.trim()) {
        return res.status(400).json({ success: false, message: "Story must contain either an image/video file or text overlay." });
      }
      mediaUrl = `gradient:${backgroundGradient}`;
      mediaType = "text";
    }

    const { 
      caption = "", 
      location = "", 
      overlayText = "", 
      overlayColor = "#ffffff", 
      privacy = "Public",
      canvasLayers = "[]",
      bgAdjustmentFilters = "{}",
      taggedProduct = null
    } = req.body;

    let parsedLayers = [];
    try {
      parsedLayers = JSON.parse(canvasLayers);
    } catch (e) {
      console.warn("Failed to parse canvasLayers:", e);
    }

    let parsedFilters = {};
    try {
      parsedFilters = JSON.parse(bgAdjustmentFilters);
    } catch (e) {
      console.warn("Failed to parse bgAdjustmentFilters:", e);
    }

    const newStory = new storyModel({
      userId: req.user._id,
      mediaUrl,
      mediaType,
      caption,
      location,
      overlayText,
      overlayColor,
      privacy,
      canvasLayers: parsedLayers,
      bgAdjustmentFilters: parsedFilters,
      taggedProduct: (taggedProduct && taggedProduct.match(/^[0-9a-fA-F]{24}$/)) ? taggedProduct : null,
    });
    await newStory.save();

    return res.status(200).json({ success: true, message: "Story published successfully!", story: newStory });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error creating story:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getActiveStories = async (req, res) => {
  try {
    // Stories automatically expire in 24 hours via TTL index, so finding all documents returns active ones
    const stories = await storyModel
      .find()
      .sort({ createdAt: 1 })
      .populate("userId", "name profilePhoto")
      .populate("taggedProduct", "name price images");

    // Group stories by creator userId
    const grouped = {};
    stories.forEach(story => {
      if (!story.userId) return;
      const uid = story.userId._id.toString();
      if (!grouped[uid]) {
        grouped[uid] = {
          _id: story.userId._id,
          name: story.userId.name,
          profilePhoto: story.userId.profilePhoto,
          stories: []
        };
      }
      grouped[uid].stories.push({
        _id: story._id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        caption: story.caption,
        location: story.location,
        overlayText: story.overlayText,
        overlayColor: story.overlayColor,
        privacy: story.privacy,
        canvasLayers: story.canvasLayers,
        bgAdjustmentFilters: story.bgAdjustmentFilters,
        taggedProduct: story.taggedProduct,
        createdAt: story.createdAt
      });
    });

    return res.status(200).json({ success: true, stories: Object.values(grouped) });
  } catch (error) {
    console.error("Error fetching active stories:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const story = await storyModel.findOne({ _id: id, userId });
    if (!story) {
      return res.status(404).json({ success: false, message: "Story not found or unauthorized." });
    }

    if (story.mediaUrl && !story.mediaUrl.startsWith("gradient:")) {
      try {
        const urlParts = story.mediaUrl.split("/");
        const filename = urlParts[urlParts.length - 1];
        const publicId = "cartnow_stories/" + filename.split(".")[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: story.mediaType === "video" ? "video" : "image" });
      } catch (cloudErr) {
        console.warn("Could not delete story media from Cloudinary:", cloudErr.message);
      }
    }

    await storyModel.deleteOne({ _id: id });
    return res.status(200).json({ success: true, message: "Story deleted successfully." });
  } catch (error) {
    console.error("Error deleting story:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getPostLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const likes = await postLikeModel
      .find({ postId })
      .populate("userId", "name profilePhoto followers");

    const currentUserId = req.user ? req.user._id : null;
    const likedUsers = likes
      .map((l) => {
        if (!l.userId) return null;
        const userObj = l.userId.toObject();
        userObj.isFollowing = currentUserId
          ? l.userId.followers.some((fid) => fid.toString() === currentUserId.toString())
          : false;
        return userObj;
      })
      .filter(Boolean);

    return res.status(200).json({ success: true, likes: likedUsers });
  } catch (error) {
    console.error("Error fetching post likes:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
