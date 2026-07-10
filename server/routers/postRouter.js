import express from "express";
import authUser, { authUserOptional } from "../middleware/auth.js";
import upload from "../middleware/multer.js";
import {
  createPost,
  getFeed,
  likePost,
  addComment,
  getComments,
  getPurchasedProducts,
  getTrendingHashtags,
  getSuggestedCreators,
  getTopPicks,
  toggleFollowUser,
  createStory,
  getActiveStories,
  deleteStory,
} from "../controllers/postController.js";

const postRouter = express.Router();

// Get social feed (auth optional, to attach liked status)
postRouter.get("/", authUserOptional, getFeed);

// Get user's purchased products for tagging
postRouter.get("/purchased", authUser, getPurchasedProducts);

// Get trending hashtags
postRouter.get("/trending-hashtags", getTrendingHashtags);

// Get suggested creators
postRouter.get("/suggested-creators", authUserOptional, getSuggestedCreators);

// Get top picks for you
postRouter.get("/top-picks", getTopPicks);

// Follow/Unfollow a creator
postRouter.post("/user/:targetUserId/follow", authUser, toggleFollowUser);

// Stories endpoints
postRouter.post("/stories", authUser, upload.single("media"), createStory);
postRouter.get("/stories", getActiveStories);
postRouter.delete("/stories/:id", authUser, deleteStory);

// Create a new post with media upload
postRouter.post("/", authUser, upload.single("media"), createPost);

// Like/Unlike a post
postRouter.post("/:postId/like", authUser, likePost);

// Comments endpoints
postRouter.post("/:postId/comment", authUser, addComment);
postRouter.get("/:postId/comments", getComments);

export default postRouter;
