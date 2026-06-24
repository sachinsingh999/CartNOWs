import mongoose from "mongoose";

const searchQuerySchema = new mongoose.Schema(
  {
    query: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    count: {
      type: Number,
      default: 1
    },
    lastSearched: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true, collection: "search_queries" }
);

const searchQueryModel =
  mongoose.models.searchQuery ||
  mongoose.model("searchQuery", searchQuerySchema);

export default searchQueryModel;
