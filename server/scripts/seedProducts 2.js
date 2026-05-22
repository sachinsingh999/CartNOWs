import dotenv from "dotenv";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";

dotenv.config();

const products = [
  {
    name: "Structured Cotton Overshirt",
    description: "A crisp everyday overshirt with a structured fit, clean seams, and soft cotton comfort.",
    price: 1299,
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1484516758160-5a305fef87d7?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Minimal Black Crew Tee",
    description: "A soft crew neck tee designed for daily wear with a clean silhouette and premium hand feel.",
    price: 699,
    category: "Men",
    sizes: ["S", "M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Everyday Denim Jacket",
    description: "A rugged denim layer with a classic cut that pairs easily with chinos, joggers, and tees.",
    price: 2199,
    category: "Men",
    sizes: ["M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Slim Fit Chino Pants",
    description: "Tailored chinos with a polished finish for office days, dinners, and easy weekend plans.",
    price: 1499,
    category: "Men",
    sizes: ["M", "L", "XL", "XXL"],
    images: [
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1506629905607-d9dd6f8f6833?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Weekend Linen Shirt",
    description: "A breathable linen shirt with relaxed drape and a refined collar for warm-weather styling.",
    price: 1199,
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Classic Bomber Jacket",
    description: "A lightweight bomber jacket with a sharp profile and easy layering for cooler evenings.",
    price: 2499,
    category: "Men",
    sizes: ["M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1520975682031-a5a0f6d5bbd9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1520975867597-0af37a22e31e?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Soft Knit Polo",
    description: "A refined knit polo with a smooth texture that works for smart casual days and travel.",
    price: 999,
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Satin Wrap Dress",
    description: "A graceful wrap dress with a fluid satin finish, flattering waist tie, and elegant movement.",
    price: 1899,
    category: "Women",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Tailored Blazer",
    description: "A sharp blazer with a structured shoulder and modern fit for workwear or evening styling.",
    price: 2699,
    category: "Women",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Relaxed High Waist Jeans",
    description: "Comfort-first denim with a high waist, relaxed leg, and easy everyday wash.",
    price: 1699,
    category: "Women",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Ribbed Knit Top",
    description: "A fitted ribbed knit top with a soft stretch feel and clean neckline for easy layering.",
    price: 799,
    category: "Women",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Pleated Midi Skirt",
    description: "A flowy pleated midi skirt with soft movement, easy waist comfort, and versatile styling.",
    price: 1299,
    category: "Women",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1583496661160-fb5886a13d27?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Everyday Cotton Kurti",
    description: "A breathable cotton kurti with refined detailing for errands, college days, and casual plans.",
    price: 1099,
    category: "Women",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Soft Layer Cardigan",
    description: "A lightweight cardigan with a cozy hand feel, rib cuffs, and relaxed everyday fit.",
    price: 1399,
    category: "Women",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Playtime Graphic Tee",
    description: "A soft graphic tee for kids with breathable cotton and a cheerful everyday print.",
    price: 499,
    category: "Kid",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Kids Denim Dungaree",
    description: "A durable denim dungaree with comfy straps and room to move through active days.",
    price: 999,
    category: "Kid",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Cozy Hoodie Set",
    description: "A soft hoodie and jogger set made for school runs, travel, and relaxed weekends.",
    price: 1199,
    category: "Kid",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519238359922-989348752efb?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Printed Cotton Dress",
    description: "A cheerful cotton dress with an easy fit, playful print, and all-day comfort.",
    price: 899,
    category: "Kid",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "Tiny Explorer Shorts",
    description: "Easy cotton shorts with an elastic waist, practical pockets, and playful comfort.",
    price: 599,
    category: "Kid",
    sizes: ["S", "M", "L"],
    images: [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=900&q=80",
    ],
  },
  {
    name: "School Day Polo",
    description: "A neat kids polo with soft cotton comfort, rib collar, and easy everyday durability.",
    price: 649,
    category: "Kid",
    sizes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&w=900&q=80",
    ],
  },
];

const connectDb = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);
};

const seedProducts = async () => {
  await connectDb();

  const operations = products.map((product) => ({
    updateOne: {
      filter: { name: product.name },
      update: {
        $set: {
          ...product,
          date: new Date(),
        },
        $setOnInsert: {
          reviews: [],
        },
      },
      upsert: true,
    },
  }));

  await productModel.bulkWrite(operations);

  const counts = await productModel.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log(`Seeded ${products.length} products.`);
  console.table(counts);
};

seedProducts()
  .catch((error) => {
    console.error("Product seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
