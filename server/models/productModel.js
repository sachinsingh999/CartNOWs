import mongoose from "mongoose";
import { validatePrice, validateDynamicAttributes } from "../utils/validation.js";

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

  collections: {
    type: [String],
    default: []
  },

  audience: {
    type: String,
    default: "Unisex",
    trim: true
  },

  keywords: {
    type: [String],
    default: []
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
          required: false,
          trim: true
        }
      }
    ],
    default: []
  },

  attributes: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    validate: {
      validator: (v) => {
        if (v === undefined || v === null) return true;
        return validateDynamicAttributes(v).isValid;
      },
      message: (props) => {
        const result = validateDynamicAttributes(props.value);
        return result.message || "Invalid dynamic attributes format.";
      }
    }
  },

  variants: {
    type: [
      {
        sku: { type: String, default: "" },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        images: { type: [String], default: [] },
        barcode: { type: String, default: "" },
        availability: { type: Boolean, default: true },
        attributes: { type: mongoose.Schema.Types.Mixed, default: {} }
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

  originalPrice: {
    type: Number,
    default: 0
  },

  location: {
    type: String,
    default: "Delhi"
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

  viewCount: {
    type: Number,
    default: 0
  },

  wishlistCount: {
    type: Number,
    default: 0
  },

  cartCount: {
    type: Number,
    default: 0
  },

  purchaseCount: {
    type: Number,
    default: 0
  },

  averageRating: {
    type: Number,
    default: 0
  },

  totalReviews: {
    type: Number,
    default: 0
  },

  totalSold: {
    type: Number,
    default: 0
  },

  slug: {
    type: String,
    trim: true
  },

  shortDescription: {
    type: String,
    default: ""
  },

  highlights: {
    type: [String],
    default: []
  },

  careInstructions: {
    type: [String],
    default: []
  },

  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },

  createdAt: {
    type: Date,
    default: Date.now
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
