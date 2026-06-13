import mongoose from "mongoose";
import { validatePrice } from "../utils/validation.js";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true,
    validate: {
      validator: (v) => validatePrice(v).isValid,
      message: "Price must be greater than 0 with at most 2 decimal places"
    }
  },

  images: {
    type: [String], // multiple images (Cloudinary URLs)
    required: true
  },

  category: {
    type: String,
    required: true
  },

  subCategory: {
    type: String,
    default: "",
    trim: true
  },

  collection: {
    type: String,
    default: "",
    trim: true
  },

  brand: {
    type: String,
    default: "",
    trim: true
  },

  sku: {
    type: String,
    default: "",
    trim: true
  },

  stock: {
    type: Number,
    default: 0,
    min: 0
  },


  sizes: {
    type: [String], // size or variant options
    default: []
  },

  tags: {
    type: [String],
    default: []
  },

  specifications: {
    type: [
      {
        key: {
          type: String,
          required: true,
          trim: true
        },
        value: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    default: []
  },

  attributes: {
    type: [
      {
        key: {
          type: String,
          required: true,
          trim: true
        },
        value: {
          type: String,
          required: true,
          trim: true
        }
      }
    ],
    default: []
  },

  reviews: {
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true
        },
        name: {
          type: String,
          required: true,
          trim: true
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          required: true,
          trim: true
        },
        reply: {
          type: String,
          default: ""
        },
        date: {
          type: Date,
          default: Date.now
        }
      }
    ],
    default: []
  },

  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "seller",
    default: null
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "disabled"],
    default: "approved"
  },

  isFake: {
    type: Boolean,
    default: false
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  },

  date: {
    type: Date,
    default: Date.now
  }
}, {
  suppressReservedKeysWarning: true
});

const productModel =
  mongoose.models.product ||
  mongoose.model("product", productSchema);

export default productModel;
