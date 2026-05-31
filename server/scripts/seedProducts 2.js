import dotenv from "dotenv";
import mongoose from "mongoose";
import productModel from "../models/productModel.js";

dotenv.config();

// Curated Unsplash images for each of the 20 major categories to guarantee stunning UI presentation
const imgs = {
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
    "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80"
  ],
  mobile: [
    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
    "https://images.unsplash.com/photo-1565849904461-09a7df70055d?w=600&q=80"
  ],
  laptops: [
    "https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?w=600&q=80",
    "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
    "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80"
  ],
  fashion_men: [
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80"
  ],
  fashion_women: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&q=80"
  ],
  fashion_kids: [
    "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
    "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80",
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80"
  ],
  footwear: [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80"
  ],
  watches: [
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&q=80",
    "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80"
  ],
  beauty: [
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80"
  ],
  kitchen: [
    "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
    "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
    "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&q=80"
  ],
  furniture: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
    "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=600&q=80"
  ],
  books: [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
    "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80"
  ],
  toys: [
    "https://images.unsplash.com/photo-1539627831859-a911cf04d3cd?w=600&q=80",
    "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&q=80",
    "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&q=80"
  ],
  sports: [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
    "https://images.unsplash.com/photo-1480099225005-2513c8947aec?w=600&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80"
  ],
  grocery: [
    "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80",
    "https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=600&q=80",
    "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=600&q=80"
  ],
  pets: [
    "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&q=80",
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
    "https://images.unsplash.com/photo-1535268647977-a403b69fc756?w=600&q=80"
  ],
  automotive: [
    "https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=600&q=80",
    "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80"
  ],
  office: [
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=80",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&q=80",
    "https://images.unsplash.com/photo-1527891751199-7225231a68dd?w=600&q=80"
  ],
  health: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
    "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600&q=80",
    "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&q=80"
  ],
  baby: [
    "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80",
    "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80"
  ],
  music: [
    "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&q=80",
    "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600&q=80"
  ],
  garden: [
    "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80",
    "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
    "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&q=80"
  ]
};

// We will build exactly 200 products across 20 distinct Amazon-like categories (10 items per category)
const rawCategories = [
  {
    category: "Electronics",
    imgKey: "electronics",
    collection: "General",
    items: [
      { name: "Pro Noise-Cancelling Headphones", price: 8999, desc: "Premium over-ear headphones with active noise cancellation, high-fidelity sound, and 30-hour battery life.", spec: [{ key: "Driver", value: "40mm Dynamic" }, { key: "ANC", value: "Up to 38dB" }] },
      { name: "Mechanical Gaming Keyboard RGB", price: 3499, desc: "Tenkeyless mechanical keyboard featuring hot-swappable switches, double-shot keycaps, and customizable RGB backlighting.", spec: [{ key: "Switch Type", value: "Linear Red" }] },
      { name: "Ultralight Wireless Gaming Mouse", price: 2999, desc: "High-performance gaming mouse weighing only 58g with pixel-perfect tracking and a 26K DPI optical sensor.", spec: [{ key: "Weight", value: "58 grams" }] },
      { name: "4K Action Camera Waterproof", price: 7999, desc: "Action camera with 4K recording at 60FPS, dual touchscreens, advanced electronic stabilization, and waterproof casing.", spec: [{ key: "Resolution", value: "4K Ultra HD" }] },
      { name: "Smart Wi-Fi Home Projector", price: 14999, desc: "Compact 1080p native projector with built-in streaming apps, keystone correction, and dynamic dual stereo speakers.", spec: [{ key: "Lumens", value: "500 ANSI" }] },
      { name: "USB-C Desktop Condenser Mic", price: 2499, desc: "Studio-quality USB microphone with cardiod pick-up pattern, zero-latency monitoring, and tap-to-mute button.", spec: [{ key: "Sample Rate", value: "96kHz / 24-bit" }] },
      { name: "Smart Plug Outlet (4-Pack)", price: 1299, desc: "Voice-controlled smart plugs compatible with Alexa and Google Assistant, featuring scheduling and energy monitoring.", spec: [{ key: "Voltage", value: "110-240V" }] },
      { name: "Portable Power Bank 20000mAh", price: 1899, desc: "High-capacity external battery pack with 22.5W Power Delivery fast charging and dual USB-C/USB-A ports.", spec: [{ key: "Capacity", value: "20,000 mAh" }] },
      { name: "Wireless Bluetooth Soundbar", price: 4999, desc: "Slim television soundbar featuring 3D surround sound, deep bass ports, and multiple connectivity inputs.", spec: [{ key: "Power Output", value: "60 Watts" }] },
      { name: "Ergonomic Dual Monitor Mount", price: 2299, desc: "Heavy-duty gas spring monitor arm supporting dual 17-32 inch screens with full articulation tilt and swivel.", spec: [{ key: "Max Weight", value: "9kg per arm" }] }
    ]
  },
  {
    category: "Mobile Phones",
    imgKey: "mobile",
    collection: "General",
    items: [
      { name: "Apex Flagship Smartphone 5G", price: 64999, desc: "Premium 5G smartphone with a 6.7-inch AMOLED 120Hz display, 200MP triple camera system, and Snapdragon Gen 3.", spec: [{ key: "Processor", value: "Snapdragon 8 Gen 3" }, { key: "RAM", value: "12GB LPDDR5X" }] },
      { name: "Nova Foldable Smartphone", price: 89999, desc: "Cutting-edge folding smartphone featuring a flexible inner OLED display, dual screens, and ultra-thin glass.", spec: [{ key: "Screen Size", value: "7.6-inch main, 6.2-inch cover" }] },
      { name: "Lite Daily Android Phone", price: 12999, desc: "Budget-friendly smartphone with a massive 6000mAh battery, 50MP main camera, and clean Android interface.", spec: [{ key: "Battery", value: "6,000 mAh" }] },
      { name: "Vanguard Rugged Outdoors Phone", price: 24999, desc: "Military-grade tough smartphone with IP69K dust/waterproofing, drop resistance, and thermal imaging camera.", spec: [{ key: "Rating", value: "IP68/IP69K Waterproof" }] },
      { name: "Pro Camera Smartphone Pro Max", price: 79999, desc: "Cinematic focused smartphone with a periscope zoom lens, dedicated action button, and titanium alloy chassis.", spec: [{ key: "Camera", value: "50MP Main + 5x Optical Zoom" }] },
      { name: "Slim Pocket Friendly Smartphone", price: 17999, desc: "Ultra-slim 6.1-inch smartphone focusing on pocket comfort, lightweight build, and vibrant custom colorways.", spec: [{ key: "Thickness", value: "6.9mm" }] },
      { name: "Eco-Friendly Modular Phone", price: 34999, desc: "Highly repairable modular smartphone designed with fair-trade materials and easily replaceable batteries/screens.", spec: [{ key: "Repairability Score", value: "10/10 iFixit" }] },
      { name: "Elite Business Smartphone 5G", price: 54999, desc: "Enterprise phone featuring advanced secure folder encryption, integrated stylus pen, and desktop casting mode.", spec: [{ key: "Stylus Included", value: "Yes, active pen" }] },
      { name: "Creator Ultra Wide Screen Phone", price: 44999, desc: "Content creator focused phone with high screen-to-body ratio, front vlog-ring light flash, and directional mic.", spec: [{ key: "Screen Aspect", value: "21:9 Cinematic" }] },
      { name: "Basic Vintage Keypad Phone", price: 1999, desc: "Classic keypad mobile phone featuring 4G LTE, dual SIM, built-in flashlight, and legendary 2-week standby battery.", spec: [{ key: "Standby Time", value: "Up to 15 Days" }] }
    ]
  },
  {
    category: "Laptops",
    imgKey: "laptops",
    collection: "General",
    items: [
      { name: "Zenith Thin & Light Ultrabook", price: 59999, desc: "Featherlight aluminium laptop featuring a 14-inch QHD screen, Intel Core i7, 16GB RAM, and 14-hour battery life.", spec: [{ key: "Processor", value: "Intel Core i7 13th Gen" }, { key: "Weight", value: "1.18 kg" }] },
      { name: "Quantum RTX Gaming Laptop", price: 84999, desc: "Powerhouse gaming laptop packed with NVIDIA RTX 4060 graphics, 144Hz high refresh display, and liquid cooling vents.", spec: [{ key: "GPU", value: "NVIDIA GeForce RTX 4060" }] },
      { name: "Carbon Enterprise Business Laptop", price: 72999, desc: "Durable business laptop featuring a spill-resistant keyboard, fingerprint reader, and military-standard certification.", spec: [{ key: "Security", value: "dTPM 2.0 & Fingerprint Sensor" }] },
      { name: "Omni 2-in-1 Convertible Laptop", price: 48999, desc: "Versatile touchscreen laptop with a 360-degree hinge, magnetic active stylus support, and rich Dolby Atmos audio.", spec: [{ key: "Hinge", value: "360-degree Convertible" }] },
      { name: "Creator 4K OLED Workstation", price: 119999, desc: "High-end laptop designed for video editors featuring a color-accurate 4K OLED display and discrete RTX graphics.", spec: [{ key: "Display", value: "15.6\" 4K OLED, 100% DCI-P3" }] },
      { name: "Voyager Long Battery Chromebook", price: 19999, desc: "Snappy, lightweight Chromebook ideal for students with easy cloud apps, built-in virus protection, and 12h run time.", spec: [{ key: "OS", value: "ChromeOS" }] },
      { name: "Apex Developer Programming Laptop", price: 94999, desc: "Developer centric laptop configured with 32GB RAM, 1TB high-speed NVMe SSD, and pre-configured Linux options.", spec: [{ key: "RAM", value: "32GB DDR5" }, { key: "Storage", value: "1TB NVMe Gen4 SSD" }] },
      { name: "Prime Everyday Budget Laptop", price: 29999, desc: "Reliable home and study laptop featuring a spacious 15.6-inch FHD screen, AMD Ryzen processor, and full numpad.", spec: [{ key: "Processor", value: "AMD Ryzen 5 5500U" }] },
      { name: "Eclipse Fanless Silent Laptop", price: 42999, desc: "Sleek fanless laptop offering completely silent operation, premium metallic chassis, and instant wake-on-open.", spec: [{ key: "Cooling", value: "Fanless Passive Cooling" }] },
      { name: "Titan Dual Screen Laptop", price: 149999, desc: "Revolutionary dual-screen laptop featuring an additional full-width touch display above the keyboard.", spec: [{ key: "Primary Display", value: "16-inch IPS" }, { key: "Secondary Display", value: "14-inch ScreenPad" }] }
    ]
  },
  {
    category: "Fashion (Men)",
    imgKey: "fashion_men",
    collection: "Men",
    items: [
      { name: "Men's Premium Oxford Cotton Shirt", price: 1299, desc: "Classic formal and smart-casual button-down shirt crafted from combed long-staple cotton.", spec: [{ key: "Material", value: "100% Combed Cotton" }] },
      { name: "Men's Slim Fit Stretch Chinos", price: 1499, desc: "Tailored chinos with 4-way mechanical stretch fabric. Perfect for office-to-evening style.", spec: [{ key: "Stretch", value: "2% Elastane" }] },
      { name: "Men's Lightweight Denim Jacket", price: 2199, desc: "A timeless layering denim jacket with metal button closures and adjustable waist tabs.", spec: [{ key: "Fabric", value: "12oz Rigid Denim" }] },
      { name: "Men's Merino Wool Crew Sweater", price: 2499, desc: "Super soft knitted sweater made from premium merino wool. Breathable and naturally warm.", spec: [{ key: "Material", value: "100% Merino Wool" }] },
      { name: "Men's French Terry Hoodie", price: 1799, desc: "Relaxed fit pullover hoodie crafted from heavy loopback French terry fabric with kangaroo pocket.", spec: [{ key: "Weight", value: "320 GSM French Terry" }] },
      { name: "Men's Linen Cuban Collar Shirt", price: 1199, desc: "Airy summer shirt with a camp collar, short sleeves, and standard chest pocket.", spec: [{ key: "Material", value: "55% Linen, 45% Cotton" }] },
      { name: "Men's Tech Utility Cargo Pants", price: 1899, desc: "Rugged cargo trousers with a water-repellent finish, elasticated waistband, and zip pockets.", spec: [{ key: "Finish", value: "Water-repellent DWR" }] },
      { name: "Men's Athletic French Terry Joggers", price: 1399, desc: "Comfortable athletic joggers with side zipper pockets and custom flat drawcords.", spec: [{ key: "Pockets", value: "Zippered Side Pockets" }] },
      { name: "Men's Structured Double Breasted Blazer", price: 3999, desc: "Premium tailoring blazer featuring structured shoulders, peak lapels, and double-breasted buttoning.", spec: [{ key: "Lapels", value: "Peak Lapels" }] },
      { name: "Men's Heavyweight Streetwear Graphic Tee", price: 799, desc: "Drop-shoulder graphic tee featuring clean typography print and ultra-heavy vintage knit.", spec: [{ key: "Weight", value: "260 GSM Heavy Knit" }] }
    ]
  },
  {
    category: "Fashion (Women)",
    imgKey: "fashion_women",
    collection: "Women",
    items: [
      { name: "Women's Floral Georgette Maxi Dress", price: 1999, desc: "Elegant tiered maxi dress featuring a vintage floral print, deep V-neck, and flared sleeves.", spec: [{ key: "Lining", value: "Fully Lined" }] },
      { name: "Women's High Waist Wide Leg Jeans", price: 1899, desc: "Retro wide-leg denim jeans with high-rise waistline, clean classic wash, and five pocket layout.", spec: [{ key: "Rise", value: "High-Rise" }] },
      { name: "Women's Ribbed Mock Neck Top", price: 799, desc: "Fitted knit top with mock neck collar, rich rib texture, and versatile pairing options.", spec: [{ key: "Neck", value: "Mock Neck" }] },
      { name: "Women's Linen Blend Blazer", price: 2999, desc: "Relaxed tailored blazer featuring linen blend construction, notched lapels, and patch pockets.", spec: [{ key: "Material", value: "Linen-Viscose Blend" }] },
      { name: "Women's Accordion Pleated Skirt", price: 1299, desc: "Flowy accordion pleated midi skirt with comfy elastic waistband and fluid drape movement.", spec: [{ key: "Pleat Style", value: "Accordion Pleated" }] },
      { name: "Women's Hand-Block Print Kurti", price: 1099, desc: "Breathable cotton kurti hand-printed by local artisans, featuring intricate yoke embroidery.", spec: [{ key: "Craft", value: "Hand Block Printed" }] },
      { name: "Women's Satin Slip Dress", price: 1599, desc: "Graceful slip dress with a fluid bias-cut satin drape, adjustable spaghetti straps, and cowl neck.", spec: [{ key: "Straps", value: "Adjustable Spaghetti" }] },
      { name: "Women's Cable Knit Cardigan", price: 1899, desc: "Cozy open-front cardigan featuring chunky cable knit detailing, patch pockets, and rib cuffs.", spec: [{ key: "Knit Type", value: "Cable Knit" }] },
      { name: "Women's High Rise Yoga Pants", price: 1299, desc: "Buttery soft high-waisted active yoga leggings featuring 4-way stretch and squat proof test.", spec: [{ key: "Fabric", value: "80% Nylon, 20% Elastane" }] },
      { name: "Women's Silk Blend Dupatta Set", price: 2499, desc: "Classic ethnic kurta, palazzo pants, and printed silk dupatta matching set for festive occasions.", spec: [{ key: "Set Contents", value: "Kurta, Palazzo, Dupatta" }] }
    ]
  },
  {
    category: "Fashion (Kids)",
    imgKey: "fashion_kids",
    collection: "Kid",
    items: [
      { name: "Kids organic Cotton Romper Pack", price: 899, desc: "Pack of 3 organic cotton rompers featuring snap button closures for easy dressing.", spec: [{ key: "Pack Size", value: "3-Pack" }, { key: "Fabric", value: "100% Organic Cotton" }] },
      { name: "Kids Playtime Graphic Tee", price: 499, desc: "Soft graphic t-shirt featuring bright fade-resistant cartoon print and durable ribbed neck.", spec: [{ key: "Print Type", value: "Water-based Ink" }] },
      { name: "Kids Stretch Denim Dungaree", price: 1199, desc: "Durable denim overalls featuring adjustable shoulder buckles, chest pockets, and waist buttons.", spec: [{ key: "Material", value: "Stretch Cotton Denim" }] },
      { name: "Kids Cozy Fleece Hoodie Set", price: 1499, desc: "Soft brushed fleece hoodie and matching jogger pants matching coordinates set.", spec: [{ key: "Includes", value: "Hoodie & Jogger Set" }] },
      { name: "Kids Floral Tiered Cotton Dress", price: 999, desc: "Pretty flared party dress in lightweight cotton fabric with back zipper opening.", spec: [{ key: "Fit", value: "A-Line Flared" }] },
      { name: "Kids Active Quick Dry Shorts", price: 599, desc: "Lightweight and breathable athletic shorts featuring elasticized waist and side stripes.", spec: [{ key: "Finish", value: "Quick Dry" }] },
      { name: "Kids Smart Knit Polo Shirt", price: 699, desc: "Classic kids collar t-shirt with two-button placket and comfortable pique texture.", spec: [{ key: "Placket", value: "2-Button Placket" }] },
      { name: "Kids Animal Hooded Rain Jacket", price: 1299, desc: "Windproof and water-resistant raincoat featuring a cute animal ear design on the hood.", spec: [{ key: "Hood Details", value: "Attached 3D Ears" }] },
      { name: "Kids Ribbed Knit Leggings (2-Pack)", price: 799, desc: "Pack of 2 stretch leggings in solid autumn shades, cozy and snug for everyday play.", spec: [{ key: "Pack Details", value: "2-Pack Solids" }] },
      { name: "Kids Classic Oxford Party Shirt", price: 899, desc: "Little gentleman button-down cotton shirt with classic collar and matching bowtie accessory.", spec: [{ key: "Accessory", value: "Removable Bowtie" }] }
    ]
  },
  {
    category: "Footwear",
    imgKey: "footwear",
    collection: "General",
    items: [
      { name: "Elite Cushioned Running Shoes", price: 3499, desc: "Ergonomic running shoes featuring high-rebound nitrogen-infused foam midsole and breathable mesh.", spec: [{ key: "Midsole", value: "Nitrogen Foam" }, { key: "Drop", value: "8mm" }] },
      { name: "Handcrafted Leather Loafers", price: 2999, desc: "Timeless formal slip-on shoes crafted from full-grain cowhide leather with a cushioned footbed.", spec: [{ key: "Leather Type", value: "Full-Grain" }] },
      { name: "Minimalist Canvas Sneakers", price: 1499, desc: "Low-profile lace-up canvas sneakers featuring a vulcanized non-slip rubber sole.", spec: [{ key: "Sole", value: "Vulcanized Rubber" }] },
      { name: "Outdoor Trail Hiking Boots", price: 4499, desc: "Rugged waterproof hiking boots featuring deep lug traction outsoles and metal lace hooks.", spec: [{ key: "Traction", value: "4mm Multi-directional Lugs" }] },
      { name: "Women's Block Heel Sandals", price: 1899, desc: "Classic block heel sandals featuring an adjustable ankle buckle strap and memory foam cushioning.", spec: [{ key: "Heel Height", value: "2.5 Inches" }] },
      { name: "Cozy Suede House Slippers", price: 999, desc: "Plush shearling-lined slip-on house shoes with a durable indoor/outdoor rubber sole.", spec: [{ key: "Lining", value: "Faux Shearling Wool" }] },
      { name: "Athletic Cross Training Shoes", price: 2799, desc: "Versatile gym shoes designed for lifting and HIIT workouts, featuring a flat stable heel.", spec: [{ key: "Heel Support", value: "TPU Heel Clip" }] },
      { name: "Orthotic Support Walking Shoes", price: 2199, desc: "Lightweight slip-on walking shoes featuring custom arch support insoles and mesh upper.", spec: [{ key: "Insole", value: "Orthotic Arch Support" }] },
      { name: "Classic Chelsea Leather Boots", price: 3999, desc: "Sleek ankle-length Chelsea boots featuring elastic side panels and rear pull tabs.", spec: [{ key: "Style", value: "Chelsea Pull-On" }] },
      { name: "Waterproof Sport Slides", price: 799, desc: "One-piece molded EVA slides perfect for pool, beach, and post-workout recovery.", spec: [{ key: "Material", value: "Molded EVA Foam" }] }
    ]
  },
  {
    category: "Watches",
    imgKey: "watches",
    collection: "General",
    items: [
      { name: "Aero Fitness Smartwatch Pro", price: 4999, desc: "Smart fitness tracker watch featuring a 1.43-inch AMOLED display, GPS tracking, and blood oxygen monitoring.", spec: [{ key: "Display", value: "1.43\" AMOLED Touchscreen" }, { key: "Battery Life", value: "Up to 10 Days" }] },
      { name: "Classic Chronograph Leather Watch", price: 3499, desc: "Analog watch featuring a stopwatch sub-dial, date window, and premium genuine leather strap.", spec: [{ key: "Strap Material", value: "Genuine Calfskin" }] },
      { name: "Automatic Diver Wrist Watch", price: 8999, desc: "Premium self-winding watch featuring a rotating bezel, luminous hands, and 200m water resistance.", spec: [{ key: "Movement", value: "Automatic Self-Winding" }, { key: "Water Resistance", value: "200 Meters (20 ATM)" }] },
      { name: "Minimalist Slim Quartz Watch", price: 1999, desc: "Ultra-thin analog dress watch with a clean dial, mineral glass face, and sleek mesh strap.", spec: [{ key: "Case Thickness", value: "6.5mm" }] },
      { name: "Rugged Outdoor Digital Watch", price: 1499, desc: "Shockproof sports watch with dual digital-analog display, stopwatch, alarm, and green backlighting.", spec: [{ key: "Shock Resistance", value: "Military Grade" }] },
      { name: "Rose Gold Women's Bracelet Watch", price: 2499, desc: "Elegant watch featuring a rose-gold metallic link bracelet, crystal markers, and mother-of-pearl face.", spec: [{ key: "Plating", value: "Rose Gold Ion-Plated" }] },
      { name: "Solar Powered Field Watch", price: 3999, desc: "Eco-friendly military-style watch that charges under any light source, with a durable canvas strap.", spec: [{ key: "Power Source", value: "Solar Quartz Movement" }] },
      { name: "Skeletal Dial Mechanical Watch", price: 7999, desc: "Intricate watch featuring an open skeletal dial revealing the internal mechanical escapement gears.", spec: [{ key: "Dial Type", value: "Open Heart Skeleton" }] },
      { name: "Titanium Sports Chrono Watch", price: 5999, desc: "Lightweight titanium case watch featuring anti-reflective sapphire crystal glass face.", spec: [{ key: "Case Material", value: "Solid Titanium" }] },
      { name: "Retro Digital Calculator Watch", price: 1299, desc: "Retro-inspired wristwatch featuring an 8-digit calculator keypad and daily alarm functions.", spec: [{ key: "Keyboard", value: "8-digit buttons" }] }
    ]
  },
  {
    category: "Beauty & Personal Care",
    imgKey: "beauty",
    collection: "General",
    items: [
      { name: "Vitamin C Brightening Serum", price: 599, desc: "Potent 15% Vitamin C serum with hyaluronic acid, designed to reduce dark spots and boost skin glow.", spec: [{ key: "Key Active", value: "15% L-Ascorbic Acid" }, { key: "Volume", value: "30ml" }] },
      { name: "Hydrating Hyaluronic Acid Serum", price: 499, desc: "Multi-molecular hyaluronic acid serum providing deep multi-layer skin hydration and plumping.", spec: [{ key: "Ingredients", value: "Hyaluronic Acid, Vitamin B5" }] },
      { name: "Herbal Cold Pressed Coconut Oil", price: 299, desc: "100% pure organic cold pressed extra virgin coconut oil for hair nutrition and skin moisture.", spec: [{ key: "Extraction", value: "Cold Pressed" }] },
      { name: "Matte Liquid Lipstick Set", price: 899, desc: "Set of 4 smudge-proof transfer-resistant matte liquid lipsticks in classic nude and rose shades.", spec: [{ key: "Set Contents", value: "4 Matte Shades" }] },
      { name: "Volumizing Castor Oil Mascara", price: 349, desc: "Lengthening black mascara infused with nourishing castor oil to condition lashes while styling.", spec: [{ key: "Color", value: "Intense Black" }] },
      { name: "Mineral Sunscreen Gel SPF 50+", price: 449, desc: "Broad-spectrum SPF 50 sunscreen gel with a matte non-greasy finish and zero white cast.", spec: [{ key: "SPF Rating", value: "SPF 50+ PA++++" }] },
      { name: "Charcoal Face Wash & Scrub", price: 249, desc: "Deep purifying charcoal face wash that gently exfoliates skin, removing excess sebum and pollution.", spec: [{ key: "Exfoliant", value: "Activated Charcoal Beads" }] },
      { name: "Sonic Facial Cleansing Brush", price: 1299, desc: "Waterproof silicone facial cleansing device with sonic vibrations and adjustable intensity levels.", spec: [{ key: "Vibrations", value: "8000 RPM Sonic" }] },
      { name: "Ceramide Intense Repair Moisturizer", price: 399, desc: "Daily facial moisturizer packed with 3 essential ceramides to repair and strengthen skin barrier.", spec: [{ key: "Barrier Support", value: "Ceramides AP/EOP/NP" }] },
      { name: "Rosewater Refreshing Facial Toner", price: 199, desc: "Pure steam-distilled rosewater toner to hydrate, balance skin pH, and tighten pores naturally.", spec: [{ key: "Process", value: "Steam Distilled" }] }
    ]
  },
  {
    category: "Home & Kitchen",
    imgKey: "kitchen",
    collection: "General",
    items: [
      { name: "Digital Air Fryer 4.5L", price: 4599, desc: "Digital air fryer with 8 cooking presets, touch screen panel, and rapid 360 air circulation.", spec: [{ key: "Capacity", value: "4.5 Liters" }, { key: "Wattage", value: "1400 Watts" }] },
      { name: "Non-Stick Cookware Set (3-Piece)", price: 2499, desc: "Cookware set including frying pan, kadai with glass lid, and tawa, featuring healthy PFOA-free coating.", spec: [{ key: "Coating", value: "3-Layer Non-Stick" }] },
      { name: "Compact One-Touch Coffee Maker", price: 1899, desc: "Easy one-touch drip coffee maker with an insulated glass carafe that brews up to 5 cups.", spec: [{ key: "Carafe Capacity", value: "5 Cups" }] },
      { name: "Professional High-Speed Blender", price: 3299, desc: "Heavy-duty 1000W blender with stainless steel blades for smoothies, purees, and ice crushing.", spec: [{ key: "Motor Power", value: "1000 Watts" }] },
      { name: "Electric Gooseneck Kettle", price: 1499, desc: "Precision pour gooseneck kettle in matte black stainless steel with quick-boil tech.", spec: [{ key: "Material", value: "304 Stainless Steel" }] },
      { name: "Stainless Steel Insulated Lunch Box", price: 899, desc: "Vacuum insulated double-walled thermal lunch box with 3 leak-proof food containers.", spec: [{ key: "Thermal Retention", value: "Up to 6 Hours" }] },
      { name: "Memory Foam Sleeping Pillows (Pair)", price: 1299, desc: "Ergonomic contour memory foam pillows with breathable bamboo fiber covers for neck support.", spec: [{ key: "Inner Material", value: "Memory Foam" }] },
      { name: "Ultra-Absorbent Microfiber Bath Towels", price: 799, desc: "Pack of 2 large quick-drying bath towels made from premium ultra-plush microfiber loop.", spec: [{ key: "Weight Index", value: "400 GSM" }] },
      { name: "Premium Stainless Steel Knife Set", price: 1599, desc: "Set of 5 chef-grade knives with non-slip handles and a matching acrylic storage block stand.", spec: [{ key: "Includes", value: "5 Knives & Acrylic Block" }] },
      { name: "Automatic Touchless Soap Dispenser", price: 699, desc: "Battery-operated automatic motion-sensor liquid soap dispenser with adjustable volume switches.", spec: [{ key: "Sensor Range", value: "0-5cm Detection" }] }
    ]
  },
  {
    category: "Furniture",
    imgKey: "furniture",
    collection: "General",
    items: [
      { name: "Ergonomic High-Back Office Chair", price: 6999, desc: "Desk chair featuring adjustable lumbar support, 3D armrests, breathable mesh back, and tilt lock.", spec: [{ key: "Material", value: "Nylon Mesh & Steel Frame" }, { key: "Max Weight", value: "125kg" }] },
      { name: "Modern Minimalist Coffee Table", price: 3499, desc: "Wooden coffee table with solid pine legs, a bottom storage shelf, and scratch-resistant top veneer.", spec: [{ key: "Wood Type", value: "Solid Pine & Engineered Wood" }] },
      { name: "Solid Sheesham Wood Bookshelf", price: 8999, desc: "Premium Sheesham wood bookshelf with 4 spacious shelving levels and side security slats.", spec: [{ key: "Wood Type", value: "Solid Sheesham Wood" }] },
      { name: "Adjustable Height Laptop Desk", price: 2199, desc: "Mobile rolling desk cart with height adjustment locks and safety edge stoppers for workspace.", spec: [{ key: "Height Range", value: "65cm to 95cm" }] },
      { name: "Premium Bean Bag Cover (XL)", price: 799, desc: "High-grade leatherette bean bag cover double stitched with velcro-zipper lock safety. (No beans)", spec: [{ key: "Material", value: "Premium Faux Leatherette" }] },
      { name: "Upholstered Accent Armchair", price: 11999, desc: "Cozy lounge armchair upholstered in breathable linen fabric with solid oak splay legs.", spec: [{ key: "Upholstery", value: "Premium Linen" }] },
      { name: "Foldable Wall-Mounted Study Desk", price: 1899, desc: "Space-saving wall desk that folds flat against the wall, featuring built-in small utility racks.", spec: [{ key: "Folding Thickness", value: "1.5 Inches" }] },
      { name: "Metal 3-Tier Rolling Utility Cart", price: 1499, desc: "Multipurpose kitchen and office utility cart with lockable caster wheels and mesh baskets.", spec: [{ key: "Baskets", value: "3-Tier Steel Wire" }] },
      { name: "Engineered Wood TV Entertainment Unit", price: 4599, desc: "Contemporary floating wall TV media console shelf with cable management pass-throughs.", spec: [{ key: "TV Sizes", value: "Fits up to 55-inch" }] },
      { name: "Tufted Fabric Shoe Bench Organizer", price: 2999, desc: "Comfortable padded entry bench with two wire shelves below to store up to 6 pairs of shoes.", spec: [{ key: "Cushioning", value: "High Density Foam" }] }
    ]
  },
  {
    category: "Books",
    imgKey: "books",
    collection: "General",
    items: [
      { name: "Atomic Habits (Paperback)", price: 499, desc: "James Clear's famous guide on building good habits and breaking bad ones with simple daily changes.", spec: [{ key: "Author", value: "James Clear" }, { key: "Format", value: "Paperback" }] },
      { name: "The Psychology of Money", price: 399, desc: "Timeless lessons on wealth, greed, and happiness by exploring how people think and make decisions.", spec: [{ key: "Author", value: "Morgan Housel" }] },
      { name: "Deep Work (Rules for Focus)", price: 450, desc: "Cal Newport argues that focus is a superpower in our distracted, modern digital economy.", spec: [{ key: "Author", value: "Cal Newport" }] },
      { name: "Sapiens: A Brief History of Humankind", price: 599, desc: "Yuval Noah Harari sweeps through the history of our species, questioning how we conquered Earth.", spec: [{ key: "Author", value: "Yuval Noah Harari" }] },
      { name: "Zero to One (Startup Notes)", price: 349, desc: "Peter Thiel explores how to build businesses that create entirely new things instead of copying.", spec: [{ key: "Author", value: "Peter Thiel" }] },
      { name: "Think and Grow Rich", price: 249, desc: "Napoleon Hill's legendary book summarizing 20 years of research on successful individuals.", spec: [{ key: "Format", value: "Classic Edition Paperback" }] },
      { name: "Shoe Dog: A Memoir by Nike Founder", price: 499, desc: "Phil Knight shares the candid story of Nike's rocky, early days and evolution into a global brand.", spec: [{ key: "Author", value: "Phil Knight" }] },
      { name: "The Alchemist (Special Edition)", price: 299, desc: "Paulo Coelho's inspiring novel about Santiago, a shepherd boy following his personal legend.", spec: [{ key: "Language", value: "English Translation" }] },
      { name: "Ikigai: The Japanese Secret to Long Life", price: 350, desc: "An investigation into the Okinawan philosophy of life purpose, diet, and daily routine.", spec: [{ key: "Pages", value: "208 Pages" }] },
      { name: "A Brief History of Time", price: 399, desc: "Stephen Hawking's landmark book explaining black holes, space, time, and cosmic physics simply.", spec: [{ key: "Author", value: "Stephen Hawking" }] }
    ]
  },
  {
    category: "Toys & Games",
    imgKey: "toys",
    collection: "General",
    items: [
      { name: "STEM Solar Robot Kit (12-in-1)", price: 1299, desc: "Educational solar-powered building robot kit with 190 pieces, teaching kids solar energy concepts.", spec: [{ key: "Age Group", value: "8-12 Years" }, { key: "Power", value: "Solar / Battery" }] },
      { name: "Monopoly Ultimate Banking Board Game", price: 1499, desc: "Modern edition of the classic board game featuring a touch banking unit and tap card systems.", spec: [{ key: "Players", value: "2 to 4" }] },
      { name: "High-Speed Remote Control Drift Car", price: 1899, desc: "RC drift racing car with a 2.4GHz controller, rechargeable batteries, and robust shock absorbers.", spec: [{ key: "Top Speed", value: "15 km/h" }] },
      { name: "Wooden Jigsaw Puzzle Set (3-Pack)", price: 599, desc: "Premium wooden puzzle set depicting beautiful animal designs. Promotes fine motor skills.", spec: [{ key: "Material", value: "Eco-Friendly Basswood" }] },
      { name: "1000-Piece Classic Building Blocks", price: 999, desc: "Universal building blocks compatible with all major brands, coming in vibrant assorted colors.", spec: [{ key: "Piece Count", value: "1,000 Bricks" }] },
      { name: "Ergonomic 3x3 Speed Cube", price: 299, desc: "Smooth-spinning stickerless speed cube with adjustable core tension and high corner-cutting.", spec: [{ key: "Type", value: "Magnetic Speedcube" }] },
      { name: "Kids Pop-Up Play Tent & Tunnel", price: 1199, desc: "Colorful pop-up play tent with a connecting tunnel crawlers, perfect for indoor and outdoor play.", spec: [{ key: "Tent Size", value: "3.5 x 3.5 Feet" }] },
      { name: "Classic Wooden Block Stacking Game", price: 499, desc: "Tumble tower block stacking game containing 54 polished hardwood blocks and sorting sleeve.", spec: [{ key: "Blocks Count", value: "54 Pieces" }] },
      { name: "Clay Modeling Art Set (24 Colors)", price: 399, desc: "Non-toxic air-dry clay modeling art set with modeling tools and creative project guidebook.", spec: [{ key: "Safety", value: "EN71 Non-Toxic Certified" }] },
      { name: "Double-Sided Magnetic Dart Board", price: 699, desc: "Safe magnetic dart board set containing 6 darts, rolled up inside a sleek storage cylinder case.", spec: [{ key: "Dart Type", value: "Flat Magnet Tip (Safe)" }] }
    ]
  },
  {
    category: "Sports & Fitness",
    imgKey: "sports",
    collection: "General",
    items: [
      { name: "Anti-Slip TPE Yoga Mat (6mm)", price: 999, desc: "Eco-friendly dual-texture non-slip yoga mat with alignment lines and a convenient carry strap.", spec: [{ key: "Thickness", value: "6mm TPE" }, { key: "Length", value: "183cm x 61cm" }] },
      { name: "Adjustable Dumbbell Set 20kg", price: 2499, desc: "Strength training set with solid steel connector bars and PVC coated cement weight plates.", spec: [{ key: "Weight Total", value: "20 Kilograms" }] },
      { name: "Digital Smart Skipping Rope", price: 599, desc: "Jump rope featuring an LED screen counting jumps, calories burned, and alarm timers.", spec: [{ key: "Display Type", value: "LED Backlit Counter" }] },
      { name: "Badminton Racket Twin Pack", price: 1299, desc: "Pair of carbon fiber composite rackets with 2 shuttlecocks and a zipped full-cover carry bag.", spec: [{ key: "Frame Material", value: "Carbon Fiber Composite" }] },
      { name: "Insulated Sports Water Bottle 1L", price: 899, desc: "Double-walled vacuum insulated stainless steel flask with a leakproof straw lid and handle.", spec: [{ key: "Material", value: "18/8 Pro-Grade Stainless Steel" }] },
      { name: "Resistance Exercise Bands Set", price: 499, desc: "Set of 5 natural latex loop resistance bands with varying tension ratings from Light to XX-Heavy.", spec: [{ key: "Latex", value: "100% Natural Latex" }] },
      { name: "Deep Tissue Muscle Massage Roller", price: 699, desc: "High-density EVA foam roller with grid trigger points to relieve back and calf muscle soreness.", spec: [{ key: "Material", value: "High-Density EVA Foam" }] },
      { name: "Official Match Football Size 5", price: 799, desc: "Durable machine-stitched training football featuring a high-retention butyl bladder.", spec: [{ key: "Size", value: "Official Size 5" }] },
      { name: "Adjustable Hand Grip Strengthener", price: 299, desc: "Hand wrist strengthener with a mechanical counter and adjustable resistance dial.", spec: [{ key: "Resistance Range", value: "10kg to 60kg" }] },
      { name: "Home Pull-Up Bar (Doorway)", price: 1199, desc: "Heavy-duty steel pull-up bar that fits standard door frames without screws, using leverage friction.", spec: [{ key: "Frame Size", value: "60-100cm Adjustable" }] }
    ]
  },
  {
    category: "Grocery",
    imgKey: "grocery",
    collection: "General",
    items: [
      { name: "Organic Premium Green Tea 100g", price: 349, desc: "Loose leaf green tea handpicked from high-altitude estates, rich in antioxidants and freshness.", spec: [{ key: "Weight", value: "100g" }, { key: "Certifications", value: "USDA Organic" }] },
      { name: "Raw Unfiltered Wildflower Honey", price: 499, desc: "Pure raw honey sourced from forest beehives, naturally loaded with enzymes and pollen benefits.", spec: [{ key: "Volume", value: "500g" }] },
      { name: "California Roasted Almonds (Salted)", price: 599, desc: "Premium roasted California almonds lightly tossed in sea salt. Great for daily energy boost.", spec: [{ key: "Weight", value: "500g Bag" }] },
      { name: "Extra Virgin Olive Oil 1L", price: 1199, desc: "First cold pressed Spanish extra virgin olive oil ideal for dressings, marinades, and sautéing.", spec: [{ key: "Type", value: "Extra Virgin Cold Pressed" }] },
      { name: "Instant Arabica Coffee Blend", price: 449, desc: "Premium freeze-dried instant coffee powder made from 100% selected Arabica coffee beans.", spec: [{ key: "Bean Origin", value: "100% Arabica" }] },
      { name: "Gluten-Free Whole Rolled Oats", price: 299, desc: "High fiber, gluten-free whole rolled oats, providing a nutritious heart-healthy breakfast base.", spec: [{ key: "Fiber Content", value: "10g per serving" }] },
      { name: "Himalayan Pink Rock Salt Coarse", price: 199, desc: "Pure mineral-rich pink rock salt coarse crystals presented in a reusable grinder bottle.", spec: [{ key: "Grinder", value: "Built-in Ceramic Grinder" }] },
      { name: "Cold-Pressed Mustard Oil 1L", price: 249, desc: "Traditionally extracted wood-pressed mustard oil with a pungent aroma and rich flavor.", spec: [{ key: "Extraction Method", value: "Wood Pressed (Kachi Ghani)" }] },
      { name: "Organic Quinoa Grain 500g", price: 399, desc: "Pre-washed white royal quinoa grain, rich in plant-based proteins and essential amino acids.", spec: [{ key: "Protein", value: "6g per serving" }] },
      { name: "Organic Dark Chocolate Cocoa 85%", price: 299, desc: "Rich single-origin dark chocolate bar containing 85% cocoa solids and sweetened with stevia.", spec: [{ key: "Cocoa Content", value: "85%" }] }
    ]
  },
  {
    category: "Pet Supplies",
    imgKey: "pets",
    collection: "General",
    items: [
      { name: "Premium Dry Dog Food (Meat Feast)", price: 1499, desc: "Nourishing dry kibble for adult dogs with real lamb meat, veggies, and prebiotics for gut health.", spec: [{ key: "Flavor", value: "Lamb & Brown Rice" }, { key: "Weight", value: "3kg" }] },
      { name: "Cat Scratching Post with Toy", price: 899, desc: "Durable natural sisal fiber scratching post with a plush base hanging play pom-pom ball.", spec: [{ key: "Height", value: "20 Inches" }] },
      { name: "Stainless Steel Double Pet Bowls", price: 599, desc: "Non-spill double bowls with a food-grade silicone mat base to prevent floor slips.", spec: [{ key: "Bowl Material", value: "304 Food-Grade Stainless Steel" }] },
      { name: "Dog Grooming Slicker Brush", price: 349, desc: "Self-cleaning slicker brush that removes loose undercoat hair and untangles knots with one click.", spec: [{ key: "Pin Type", value: "Bent Wire with Safety Tips" }] },
      { name: "Interactive Laser Toy for Cats", price: 499, desc: "Automatic 360-degree rotating laser pointer toy with timer and random speed settings.", spec: [{ key: "Modes", value: "Slow, Fast, Random" }] },
      { name: "Orthopedic Memory Foam Pet Bed", price: 2499, desc: "High density foam core pet mattress with ultra-soft removable machine-washable plush cover.", spec: [{ key: "Base", value: "3-inch Memory Foam" }] },
      { name: "No-Pull Reflective Dog Harness", price: 799, desc: "Adjustable chest harness with front and back leash loops, soft mesh padding, and control handle.", spec: [{ key: "Tension", value: "No-Pull Front Clip" }] },
      { name: "Waterproof Pet Seat Cover (Car)", price: 1299, desc: "Heavy-duty quilted backseat hammock protector with mesh viewing window for car travel.", spec: [{ key: "Material", value: "600D Oxford Waterproof Poly" }] },
      { name: "Fish Tank Filter & Air Pump Set", price: 999, desc: "Quiet internal aquarium filter and aerator pump kit with carbon sponges for clean tank.", spec: [{ key: "Capacity", value: "Fits up to 20 Gallons" }] },
      { name: "Premium Tofu Cat Litter (6L)", price: 449, desc: "Eco-friendly, flushable cat litter made from natural soy fiber with quick clumping action.", spec: [{ key: "Flushable", value: "Yes, Biodegradable" }] }
    ]
  },
  {
    category: "Automotive",
    imgKey: "automotive",
    collection: "General",
    items: [
      { name: "Portable Digital Car Tire Inflator", price: 1899, desc: "12V air compressor pump featuring an auto-shutoff digital gauge, emergency LED light, and nozzles.", spec: [{ key: "Max Pressure", value: "150 PSI" }, { key: "Power", value: "12V DC Car Socket" }] },
      { name: "Dual Lens HD Car Dash Cam 4K", price: 4599, desc: "Dash camera with 4K front recording, HDR night vision, built-in Wi-Fi, G-sensor collision lock.", spec: [{ key: "Sensor", value: "Sony STARVIS" }] },
      { name: "Car Vacuum Cleaner High Suction", price: 1299, desc: "Handheld car vacuum with high-speed motor, HEPA filter, and long cords to reach all corners.", spec: [{ key: "Suction Power", value: "6000 Pa" }] },
      { name: "Magnetic Dashboard Car Phone Mount", price: 499, desc: "Heavy-duty dashboard phone mount with 6 strong N52 magnets and full 360 rotation adjustment.", spec: [{ key: "Magnets", value: "6x N52 Neodymium" }] },
      { name: "Premium Microfiber Cleaning Gel", price: 299, desc: "Reusable sticky gel dust cleaner for car air vents, steering wheels, and console dashboard grooves.", spec: [{ key: "Fragrance", value: "Lemon Scented" }] },
      { name: "Jumper Cables with Carry Bag", price: 899, desc: "Heavy-duty 10-gauge jumper booster cables with thick copper clamps and tangle-free protection.", spec: [{ key: "Cable Gauge", value: "10 Gauge Copper" }] },
      { name: "Car Backrest Lumbar Cushion Set", price: 1599, desc: "Orthopedic memory foam backrest support and neck pillow set with breathable mesh covers.", spec: [{ key: "Foam", value: "Slow Recovery Memory Foam" }] },
      { name: "Leather Seat Cleaner & Conditioner", price: 399, desc: "Premium spray formula that cleans, shines, and protects car leather interiors from UV cracking.", spec: [{ key: "Volume", value: "250ml" }] },
      { name: "Bluetooth FM Transmitter Adapter", price: 699, desc: "Wireless car audio adapter featuring dual USB QC3.0 quick charging and hands-free calls.", spec: [{ key: "Bluetooth", value: "V5.0 EDR" }] },
      { name: "Emergency Car Window Glass Breaker", price: 349, desc: "Compact spring-loaded rescue tool containing a window glass breaker punch and seatbelt cutter.", spec: [{ key: "Action", value: "Spring Loaded Punch" }] }
    ]
  },
  {
    category: "Office Products",
    imgKey: "office",
    collection: "General",
    items: [
      { name: "Mesh Metal Desk Organizer", price: 699, desc: "Space-saving desktop organizer with 6 compartments, slide drawer, and powder-coated steel mesh.", spec: [{ key: "Material", value: "Mesh Steel" }, { key: "Finish", value: "Anti-Rust Coat" }] },
      { name: "Premium A5 Dotted Journal", price: 499, desc: "Hardcover notebook featuring 120 GSM thick paper, ink bleed-proof design, and dual ribbon markers.", spec: [{ key: "Paper Weight", value: "120 GSM" }] },
      { name: "Dual-Sided PU Leather Desk Mat", price: 799, desc: "Large dual-sided leather writing pad blotter, waterproof and easy to clean, protecting desks.", spec: [{ key: "Dimensions", value: "80cm x 40cm" }] },
      { name: "Cross-Cut Paper & Card Shredder", price: 3499, desc: "High-security cross-cut paper shredder with 6-sheet capacity and integrated pullout waste bin.", spec: [{ key: "Capacity", value: "6 Sheets Cross-cut" }] },
      { name: "Fine Tip Gel Pens (12-Pack)", price: 299, desc: "Pack of 12 smooth-writing black gel ink pens with soft rubber grip and retractable mechanism.", spec: [{ key: "Tip Size", value: "0.5mm Fine Needle" }] },
      { name: "Magnetic Whiteboard (Dry Erase)", price: 1299, desc: "Aluminum framed whiteboard coming with a pen tray, dry eraser, and 3 magnetic pins.", spec: [{ key: "Board Size", value: "2 x 1.5 Feet" }] },
      { name: "A4 Laminating Machine Pro", price: 2199, desc: "Quick warmup hot/cold laminator with 10 pouch sheets and an integrated paper trimmer.", spec: [{ key: "Warmup Time", value: "3 Minutes" }] },
      { name: "Heavy Duty Metal Stapler Set", price: 349, desc: "Classic metal stapler capable of binding 25 sheets, coming with 1000 standard staples.", spec: [{ key: "Binding Capacity", value: "25 Sheets" }] },
      { name: "Adjustable Footrest Under Desk", price: 999, desc: "Ergonomic under-desk foot massage rest with tilting angle lock and textured massage rollers.", spec: [{ key: "Tilt Angles", value: "0 to 30 degrees" }] },
      { name: "Desktop Label Maker Printer", price: 2499, desc: "Portable Bluetooth thermal label printer with smart app editing templates for filing cabinets.", spec: [{ key: "Print Type", value: "Thermal (Ink-Free)" }] }
    ]
  },
  {
    category: "Health & Wellness",
    imgKey: "health",
    collection: "General",
    items: [
      { name: "Automatic Upper Arm BP Monitor", price: 1899, desc: "Digital blood pressure monitor with an adjustable cuff, memory storage, and irregular heartbeat alert.", spec: [{ key: "Cuff Size", value: "22-42cm Universal" }, { key: "Memory", value: "99 Readings x 2 Users" }] },
      { name: "Electric Handheld Deep Tissue Massager", price: 2499, desc: "Rechargeable muscle massage gun with 6 speed options, 4 interchangeable nodes, and carrying case.", spec: [{ key: "Battery Life", value: "Up to 4 Hours" }] },
      { name: "Digital Smart Body Weight Scale", price: 1199, desc: "Bluetooth smart scale measuring weight, BMI, body fat ratio, and muscle mass via smartphone app.", spec: [{ key: "Max Weight", value: "180kg" }] },
      { name: "Multivitamin Immunity Gummies (60s)", price: 599, desc: "Chewable multivitamin supplements rich in Vitamin C, D, Zinc, and biotin to boost daily immunity.", spec: [{ key: "Count", value: "60 Veg Gummies" }] },
      { name: "Whey Protein Isolate 1kg", price: 2999, desc: "Premium ultra-filtered whey protein isolate powder in rich chocolate flavor for muscle recovery.", spec: [{ key: "Protein per scoop", value: "25g WPI" }] },
      { name: "Essential Oil Diffuser & Humidifier", price: 1299, desc: "Ultrasonic cool mist humidifier with color LED lights and auto-shutoff safety sensor.", spec: [{ key: "Tank Volume", value: "400ml" }] },
      { name: "Acupressure Yoga Mat & Pillow Set", price: 999, desc: "Acupuncture needle-point simulation cotton mat to stimulate blood circulation and relieve back pain.", spec: [{ key: "Spike Points", value: "6000+ Acupressure Points" }] },
      { name: "Knee Compression Sleeve Support", price: 349, desc: "High elasticity knee brace guard with silicone patella pads and side spring stabilizers.", spec: [{ key: "Material", value: "Breathable Nylon-Spandex Knit" }] },
      { name: "Probiotic Gut Health Capsule Pack", price: 699, desc: "Supplements containing 30 Billion CFUs of multi-strain active probiotics to support digestion.", spec: [{ key: "CFU Count", value: "30 Billion CFUs" }] },
      { name: "Pure Ayurvedic Ashwagandha (60 Tabs)", price: 449, desc: "Standardized Ashwagandha extract tablets to relieve stress, improve sleep quality, and boost energy.", spec: [{ key: "Standardization", value: "5% Withanolides" }] }
    ]
  },
  {
    category: "Baby Products",
    imgKey: "baby",
    collection: "Kid",
    items: [
      { name: "Bamboo Swaddle Blankets (3-Pack)", price: 999, desc: "Super soft, breathable swaddles made from organic bamboo cotton, gentle on newborn skin.", spec: [{ key: "Material", value: "70% Bamboo, 30% Organic Cotton" }, { key: "Size", value: "120cm x 120cm" }] },
      { name: "No-Contact Digital Baby Thermometer", price: 1499, desc: "Infrared forehead thermometer with silent mode, color fever warning screen, and 1s read.", spec: [{ key: "Read Time", value: "1 Second" }] },
      { name: "Safe Silicone Baby Bibs (3-Pack)", price: 599, desc: "Food-grade waterproof silicone bibs featuring wide food catcher pockets and adjustable necks.", spec: [{ key: "Bib Material", value: "100% Food Grade Silicone" }] },
      { name: "Foldable Baby Stroller Light", price: 4599, desc: "Compact lightweight travel stroller folding with one hand, featuring a 5-point safety harness.", spec: [{ key: "Safety Harness", value: "5-point Buckle System" }] },
      { name: "Baby Sound Machine & Nightlight", price: 1199, desc: "Portable white noise sound machine with lullabies, warm projection nightlight, and sleep timer.", spec: [{ key: "Sound Tracks", value: "10 White Noise & Lullabies" }] },
      { name: "Baby Wipes Organic Biodegradable", price: 299, desc: "99% pure water formulation, alcohol-free biodegradable baby wet wipes for diaper changes.", spec: [{ key: "Pack Count", value: "80 Wipes per pack" }] },
      { name: "Baby Nail Trimmer Electric Set", price: 699, desc: "Whisper-quiet electric nail filer for babies and adults, with 6 grinding cushions and LED light.", spec: [{ key: "Grinding Pads", value: "6 Pads Included" }] },
      { name: "Multi-Position Baby Carrier Ergonomic", price: 2199, desc: "Breathable mesh baby front carrier with structured M-shape hip seating support.", spec: [{ key: "M-Shape Seating", value: "Yes, Ergonomic certified" }] },
      { name: "Baby Bottle Sterilizer & Dryer", price: 3499, desc: "3-in-1 steam sterilizer and dry hot air machine that cleans up to 6 baby bottles in 40 minutes.", spec: [{ key: "Bottle Capacity", value: "6 Wide-Neck Bottles" }] },
      { name: "Organic Cotton Baby Rompers Set", price: 899, desc: "Pack of 3 organic knit cotton onesies featuring double zippers for easy diaper check.", spec: [{ key: "Closure", value: "Two-way YKK Zipper" }] }
    ]
  },
  {
    category: "Musical Instruments",
    imgKey: "music",
    collection: "General",
    items: [
      { name: "Acoustic Guitar Starter Pack", price: 4999, desc: "Full-size 39-inch cutaway acoustic guitar kit with gig bag, guitar strap, tuner, picks, and extra strings.", spec: [{ key: "Top Wood", value: "Linden Wood" }, { key: "Size", value: "39 Inches Cutaway" }] },
      { name: "Electronic Keyboard 61 Keys", price: 7999, desc: "Key digital piano featuring touch-sensitive keys, 500 tones, built-in teaching modes, and power adapter.", spec: [{ key: "Keys Count", value: "61 Keys (Touch Sensitive)" }] },
      { name: "Concert Soprano Ukulele Set", price: 1899, desc: "Soprano ukulele hand-polished mahogany wood build with Aquila strings and a padded carry gig bag.", spec: [{ key: "Wood", value: "Mahogany Wood" }] },
      { name: "Electronic Drum Pad Roll-up", price: 3499, desc: "Portable roll-up silicon drum set featuring stereo speakers, headphone output, and dual foot pedals.", spec: [{ key: "Drum Pads", value: "9 Silicon Pads" }] },
      { name: "Vocal Dynamic Microphone", price: 1499, desc: "Professional XLR dynamic microphone with cardiod pattern, steel mesh grille, and on/off mute switch.", spec: [{ key: "Connector", value: "XLR Balanced Output" }] },
      { name: "Professional Studio Monitor Headphones", price: 4599, desc: "Flat-response over-ear headphones with 90-degree swiveling earcups for music production and DJs.", spec: [{ key: "Impedance", value: "47 Ohms" }] },
      { name: "Pocket Harmonica 10-Hole Diatonic", price: 599, desc: "Standard C-key diatonic harmonica featuring brass reeds and polished steel covers with case.", spec: [{ key: "Key", value: "Key of C" }] },
      { name: "Guitar Effect Pedal (Overdrive)", price: 2199, desc: "Classic analog overdrive distortion guitar effect pedal in a rugged aluminum metal enclosure.", spec: [{ key: "Enclosure", value: "Aluminum Alloy" }] },
      { name: "Clip-On Digital Guitar Tuner", price: 299, desc: "Highly sensitive vibration-based clip-on tuner for guitar, bass, violin, and chromatic modes.", spec: [{ key: "Display", value: "Color Backlit LCD" }] },
      { name: "Fibre Djembe Drum 8-inch", price: 1299, desc: "Synthetic shell djembe hand drum with pre-stretched rope tuning and synthetic weather-proof head.", spec: [{ key: "Drum Head", value: "8-inch Synthetic" }] }
    ]
  },
  {
    category: "Garden & Outdoor",
    imgKey: "garden",
    collection: "General",
    items: [
      { name: "Solar Garden Torch Lights (4-Pack)", price: 1299, desc: "Solar-powered outdoor lawn path lights mimicking dancing flames, waterproof and auto-ON at dusk.", spec: [{ key: "Quantity", value: "4 Lights Pack" }, { key: "Rating", value: "IP65 Waterproof" }] },
      { name: "Heavy Duty Bypass Pruning Shears", price: 599, desc: "Hand pruner shears featuring high carbon SK5 steel blades and ergonomic non-slip handle grip.", spec: [{ key: "Blade Material", value: "SK5 High Carbon Steel" }] },
      { name: "Expandable Flexible Garden Hose 50ft", price: 1499, desc: "Flexible hose expanding from 17ft to 50ft with double latex core and 9-pattern spray nozzle.", spec: [{ key: "Max Length", value: "50 Feet Expanded" }] },
      { name: "Self-Watering Flower Pots (5-Pack)", price: 799, desc: "Minimalist plastic planters with water level indicator reservoirs for indoor and outdoor herbs.", spec: [{ key: "Pack Size", value: "5 Planters" }] },
      { name: "Foldable Camping Chair with Cooler Bag", price: 1199, desc: "Portable folding camp chair featuring padded armrests, cup holder, and an integrated cooler pouch.", spec: [{ key: "Weight Capacity", value: "110kg" }] },
      { name: "Electric Weed Eater Grass Trimmer", price: 3499, desc: "Cordless string trimmer powered by 20V battery with telescopic shaft adjustments for yard lawn care.", spec: [{ key: "Battery Voltage", value: "20V Lithium-ion" }] },
      { name: "Indoor Smart Herb Garden Kit", price: 4599, desc: "Hydroponics growing system featuring a full spectrum LED grow lamp, water pump, and 12 pod seed cups.", spec: [{ key: "Grow Pods", value: "12 Pods Hydroponic" }] },
      { name: "Heavy Duty Hand Gardening Tools Set", price: 999, desc: "Set of 5 aluminum alloy gardening tools including trowel, transplanter, weeder, fork, and cultivator.", spec: [{ key: "Material", value: "Polished Cast Aluminum" }] },
      { name: "Outdoor Waterproof Shade Sail Canopy", price: 1599, desc: "High density polyethylene sun shade sail canopy with rustproof D-rings for patio protection.", spec: [{ key: "Shade Rate", value: "95% UV Blockage" }] },
      { name: "Ultrasonic Solar Bird & Pest Repeller", price: 1299, desc: "Outdoor solar-powered motion detector animal deterrent flashing lights and ultrasonic frequencies.", spec: [{ key: "Sensors", value: "PIR Motion Detection" }] }
    ]
  }
];

// Helper to expand and format templates to match DB requirements
const productsToSeed = [];
let indexOffset = 0;

rawCategories.forEach((catGroup) => {
  const pool = imgs[catGroup.imgKey] || imgs.electronics;
  
  catGroup.items.forEach((item, index) => {
    const globalIndex = indexOffset + index;
    const img1 = pool[index % pool.length];
    const img2 = pool[(index + 1) % pool.length];
    
    // Size options vary depending on the category type
    let sizeOptions = [];
    if (catGroup.collection === "Men" || catGroup.collection === "Women") {
      sizeOptions = ["S", "M", "L", "XL", "XXL"];
    } else if (catGroup.collection === "Kid") {
      sizeOptions = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y"];
    } else if (catGroup.category === "Mobile Phones" || catGroup.category === "Laptops") {
      sizeOptions = ["128GB", "256GB", "512GB"];
    } else if (catGroup.category === "Footwear") {
      sizeOptions = ["UK 7", "UK 8", "UK 9", "UK 10", "UK 11"];
    } else {
      sizeOptions = ["Standard"];
    }

    const tagList = [
      catGroup.category.toLowerCase(),
      catGroup.collection.toLowerCase(),
      item.name.toLowerCase().split(" ")[0],
      "ecommerce",
      "amazon-alternative",
      "premium-quality"
    ];

    productsToSeed.push({
      name: item.name,
      description: `${item.desc} Engineered for daily reliability, exceptional performance, and modern aesthetic styling. Features premium materials and strict quality control standards. Perfect for personal use or gifting.`,
      price: item.price,
      images: [img1, img2],
      category: catGroup.category,
      subCategory: catGroup.category,
      collection: catGroup.collection,
      brand: "Amazon Essentials Clone",
      sku: `CN-${catGroup.category.toUpperCase().substring(0, 3)}-${(globalIndex + 1).toString().padStart(4, "0")}`,
      stock: Math.floor(Math.random() * 120) + 30,
      sizes: sizeOptions,
      tags: tagList,
      specifications: [
        ...item.spec,
        { key: "Warranty", value: "1 Year Domestic Warranty" },
        { key: "Standard Quality", value: "Verified Premium" }
      ],
      reviews: []
    });
  });

  indexOffset += catGroup.items.length;
});

const connectDb = async () => {
  const dbUri = process.env.MONGODB_URI;
  if (!dbUri) {
    throw new Error("MONGODB_URI environment variable is missing");
  }
  await mongoose.connect(dbUri, { dbName: "cartNOW" });
};

const seedProducts = async () => {
  console.log("Connecting to Database...");
  await connectDb();
  console.log("Connected successfully. Cleaning up existing products...");
  
  // Clear the collection to ensure exactly 200 high-quality products are added
  await productModel.deleteMany({});
  console.log("Cleaned. Seeding 200 new premium products...");

  const result = await productModel.insertMany(productsToSeed);
  console.log(`Successfully seeded ${result.length} products!`);

  const counts = await productModel.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  console.log("\nSummary of Seeded Products by Category:");
  console.table(counts);
};

seedProducts()
  .catch((error) => {
    console.error("Product seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  });
