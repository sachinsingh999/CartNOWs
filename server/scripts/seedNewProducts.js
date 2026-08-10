import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sellerModel from "../models/sellerModel.js";
import productModel from "../models/productModel.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const brands = [
  "Apple", "Samsung", "Sony", "Boat", "Lenovo", "HP", "Dell",
  "Nike", "Adidas", "Puma", "Canon", "Asus", "LG", "OnePlus", "Xiaomi"
];

const collectionsPool = [
  "Trending Now", "Best Sellers", "New Arrivals", "Gaming Setup",
  "Student Essentials", "Work From Home", "Luxury Picks", "Festival Offers", "Sports Essentials"
];

const audiences = ["Men", "Women", "Kids", "Unisex"];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickMultipleRandom = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Raw product template data with precise, realistic Unsplash images (at least 3 per product)
const rawProductsTemplate = {
  "Electronics": [
    {
      name: "iPhone 15 Pro Max",
      subCategory: "Smartphones",
      brand: "Apple",
      desc: "Flagship iPhone featuring Titanium design, A17 Pro chip, custom Action button, and advanced 5x Telephoto camera.",
      images: [
        "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&q=80",
        "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&q=80"
      ]
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      subCategory: "Smartphones",
      brand: "Samsung",
      desc: "Premium Android smartphone with built-in S Pen, dynamic 200MP camera resolution, Galaxy AI translations, and Snapdragon 8 Gen 3.",
      images: [
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&q=80",
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"
      ]
    },
    {
      name: "Sony WH-1000XM5 Wireless Headphones",
      subCategory: "Audio",
      brand: "Sony",
      desc: "Industry-leading active noise cancelling overhead headphones with dual processors, 8 microphones, and speak-to-chat features.",
      images: [
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80"
      ]
    },
    {
      name: "boAt Airdopes 141 Bluetooth Earbuds",
      subCategory: "Audio",
      brand: "Boat",
      desc: "True wireless earbuds with 42 hours total playback, ASAP charge technology, and low latency beast mode for gaming.",
      images: [
        "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80",
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80",
        "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=600&q=80"
      ]
    },
    {
      name: "Lenovo Legion Slim 5 Gaming Laptop",
      subCategory: "Laptops",
      brand: "Lenovo",
      desc: "High performance gaming laptop powered by AMD Ryzen 7, NVIDIA GeForce RTX 4060, and 165Hz dynamic IPS panel.",
      images: [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
        "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80"
      ]
    },
    {
      name: "HP Spectre x360 Convertible Laptop",
      subCategory: "Laptops",
      brand: "HP",
      desc: "Elegantly crafted 2-in-1 touchscreen notebook featuring Intel Core Ultra 7, OLED display panel, and rechargeable stylus pen.",
      images: [
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80"
      ]
    },
    {
      name: "Dell UltraSharp 27 4K USB-C Hub Monitor",
      subCategory: "Monitors",
      brand: "Dell",
      desc: "Calibrated 27-inch 4K screen offering 98% DCI-P3 color accuracy, height-adjustable stand, and 90W power delivery over USB-C.",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
        "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&q=80",
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80"
      ]
    },
    {
      name: "Canon EOS R5 Mirrorless Camera",
      subCategory: "Cameras",
      brand: "Canon",
      desc: "Professional full-frame mirrorless camera supporting 8K RAW video recording, 45MP resolution, and advanced autofocus.",
      images: [
        "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80",
        "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&q=80",
        "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=600&q=80"
      ]
    },
    {
      name: "ASUS ROG Zephyrus G14 Gaming Laptop",
      subCategory: "Laptops",
      brand: "Asus",
      desc: "Ultra-portable 14-inch gaming powerhouse with AMD Ryzen 9, NVIDIA RTX 4070, and Anime Matrix customizable LED lid display.",
      images: [
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80"
      ]
    },
    {
      name: "LG C3 55-inch 4K Smart OLED TV",
      subCategory: "Televisions",
      brand: "LG",
      desc: "Self-lit OLED pixels delivering infinite contrast, Dolby Vision IQ, webOS smart home capabilities, and 120Hz refresh rates.",
      images: [
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80",
        "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80",
        "https://images.unsplash.com/photo-1552533880-12002277d3b8?w=600&q=80"
      ]
    },
    {
      name: "OnePlus 12 5G Smartphone",
      subCategory: "Smartphones",
      brand: "OnePlus",
      desc: "Flagship smartphone engineered with Hasselblad camera integration, Snapdragon 8 Gen 3, and 100W SuperVOOC flash charge.",
      images: [
        "https://images.unsplash.com/photo-1565849906660-70f9c2d53c5e?w=600&q=80",
        "https://images.unsplash.com/photo-1573148195900-7845dcb9b127?w=600&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Redmi Note 13 Pro+",
      subCategory: "Smartphones",
      brand: "Xiaomi",
      desc: "Affordable premium mobile featuring 200MP OIS camera, 120W HyperCharge, curved AMOLED screen, and IP68 dust/water protection.",
      images: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80",
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
        "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&q=80"
      ]
    },
    {
      name: "Sony PlayStation 5 Console",
      subCategory: "Gaming Consoles",
      brand: "Sony",
      desc: "Next-gen home video game console with ultra-fast custom SSD load speeds, immersive 3D audio, and haptic feedback triggers.",
      images: [
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
        "https://images.unsplash.com/photo-1622244099803-753180594343?w=600&q=80"
      ]
    },
    {
      name: "Apple MacBook Air M3 13-inch",
      subCategory: "Laptops",
      brand: "Apple",
      desc: "Strikingly thin design laptop powered by Apple M3 chip, Liquid Retina display, and up to 18 hours of all-day battery life.",
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80",
        "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&q=80",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80"
      ]
    },
    {
      name: "Samsung Galaxy Watch 6 Classic",
      subCategory: "Smart Wearables",
      brand: "Samsung",
      desc: "Premium smartwatch with signature rotating bezel, advanced body composition sensors, sleep tracking, and LTE connectivity.",
      images: [
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80"
      ]
    },
    {
      name: "boAt Stone 1200 Portable Speaker",
      subCategory: "Audio",
      brand: "Boat",
      desc: "14W rugged outdoor speaker featuring RGB lights, IPX7 water resistance, TWS mode, and up to 9 hours battery backup.",
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
        "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&q=80",
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80"
      ]
    },
    {
      name: "Lenovo ThinkPad X1 Carbon Gen 11",
      subCategory: "Laptops",
      brand: "Lenovo",
      desc: "Elite business ultrabook crafted with carbon fiber, featuring Intel Core i7, secure dTPM chip, and legendary tactile keyboard.",
      images: [
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
        "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&q=80",
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80"
      ]
    },
    {
      name: "HP LaserJet Pro Wireless Printer",
      subCategory: "Printers",
      brand: "HP",
      desc: "High-speed wireless laser printer ideal for home office productivity, supporting auto duplex printing and mobile app setups.",
      images: [
        "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80",
        "https://images.unsplash.com/photo-1563223552-30d01fda3eae?w=600&q=80"
      ]
    },
    {
      name: "Dell Inspiron 14 Touch Laptop",
      subCategory: "Laptops",
      brand: "Dell",
      desc: "Versatile everyday laptop with Intel Core i5 processor, responsive touch screen, and sleek aluminum finish design.",
      images: [
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&q=80",
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80",
        "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80"
      ]
    },
    {
      name: "Canon Pixma MegaTank G3010 Printer",
      subCategory: "Printers",
      brand: "Canon",
      desc: "Refillable ink tank wireless printer offering low-cost page yield, ideal for high volume photo and document outputs.",
      images: [
        "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&q=80",
        "https://images.unsplash.com/photo-1563223552-30d01fda3eae?w=600&q=80",
        "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80"
      ]
    },
    {
      name: "OnePlus Nord CE 4 Lite 5G",
      subCategory: "Smartphones",
      brand: "OnePlus",
      desc: "Budget friendly 5G smartphone featuring a 120Hz AMOLED display, large 5500mAh battery capacity, and 80W fast charging.",
      images: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
        "https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=600&q=80",
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Smart TV 5A 43-inch",
      subCategory: "Televisions",
      brand: "Xiaomi",
      desc: "Bezel-less Full HD smart TV powered by Android TV 11, Dolby Audio speakers, and smart PatchWall recommendation engine.",
      images: [
        "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&q=80",
        "https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&q=80",
        "https://images.unsplash.com/photo-1552533880-12002277d3b8?w=600&q=80"
      ]
    },
    {
      name: "ASUS TUF Gaming A15 Laptop",
      subCategory: "Laptops",
      brand: "Asus",
      desc: "Military-grade durability gaming laptop powered by AMD Ryzen 5, RTX 3050, and 144Hz high refresh rate screen.",
      images: [
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&q=80",
        "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80",
        "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80"
      ]
    },
    {
      name: "LG UltraGear 32-inch Gaming Monitor",
      subCategory: "Monitors",
      brand: "LG",
      desc: "Curved QHD gaming display with 165Hz refresh rate, AMD FreeSync Premium support, and 1ms motion blur reduction.",
      images: [
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&q=80",
        "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=600&q=80",
        "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=600&q=80"
      ]
    },
    {
      name: "Apple AirPods Pro 2nd Gen",
      subCategory: "Audio",
      brand: "Apple",
      desc: "Advanced true wireless earbuds with custom active noise cancellation, adaptive transparency, and spatial audio head tracking.",
      images: [
        "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80",
        "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&q=80",
        "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?w=600&q=80"
      ]
    }
  ],
  "Fashion": [
    {
      name: "Women's Floral Georgette Maxi Dress",
      subCategory: "Apparel",
      brand: "Zara",
      desc: "Elegant tiered maxi dress featuring a vintage floral print, deep V-neck, and flared georgette sleeves.",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80"
      ]
    },
    {
      name: "Women's High Waist Wide Leg Jeans",
      subCategory: "Apparel",
      brand: "Levi's",
      desc: "Retro wide-leg denim jeans with high-rise waistline, clean classic wash, and five pocket layout.",
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80",
        "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=600&q=80",
        "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&q=80"
      ]
    },
    {
      name: "Women's Ribbed Mock Neck Top",
      subCategory: "Apparel",
      brand: "H&M",
      desc: "Fitted knit top with mock neck collar, rich ribbed cotton texture, and versatile daily styling options.",
      images: [
        "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
        "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&q=80"
      ]
    },
    {
      name: "Women's Linen Blend Blazer",
      subCategory: "Apparel",
      brand: "Mango",
      desc: "Relaxed tailored blazer featuring linen blend construction, notched lapels, and double front patch pockets.",
      images: [
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",
        "https://images.unsplash.com/photo-1548624149-f9b1859aa7d3?w=600&q=80",
        "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=600&q=80"
      ]
    },
    {
      name: "Women's Accordion Pleated Skirt",
      subCategory: "Apparel",
      brand: "UNIQLO",
      desc: "Flowy accordion pleated midi skirt with comfy elastic waistband and fluid drape movement.",
      images: [
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
        "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=600&q=80",
        "https://images.unsplash.com/photo-1551160497-40c5e7b233a0?w=600&q=80"
      ]
    },
    {
      name: "Women's Hand-Block Print Kurti",
      subCategory: "Apparel",
      brand: "Biba",
      desc: "Breathable cotton kurti hand-printed by local artisans, featuring intricate yoke embroidery details.",
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
        "https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80"
      ]
    },
    {
      name: "Women's Satin Slip Dress",
      subCategory: "Apparel",
      brand: "Zara",
      desc: "Graceful slip dress with a fluid bias-cut satin drape, adjustable spaghetti straps, and cowl neck.",
      images: [
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80",
        "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80"
      ]
    },
    {
      name: "Women's Cable Knit Cardigan",
      subCategory: "Apparel",
      brand: "H&M",
      desc: "Cozy open-front cardigan featuring chunky cable knit detailing, patch pockets, and rib cuffs.",
      images: [
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80",
        "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&q=80",
        "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=600&q=80"
      ]
    },
    {
      name: "Women's High Rise Yoga Pants",
      subCategory: "Apparel",
      brand: "Puma",
      desc: "Buttery soft high-waisted active yoga leggings featuring 4-way stretch fabric and squat-proof design.",
      images: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80",
        "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80"
      ]
    },
    {
      name: "Women's Silk Blend Dupatta Set",
      subCategory: "Apparel",
      brand: "Biba",
      desc: "Classic ethnic salwar suit set including straight-fit kurta, pants, and a matching printed silk dupatta.",
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
        "https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&q=80",
        "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80"
      ]
    }
  ],
  "Beauty": [
    {
      name: "Sony Beauty Laser Epilator Pro",
      subCategory: "Skincare Devices",
      brand: "Sony",
      desc: "High-tech laser epilator using Sony optic sensors for safe, long-lasting hair removal and skin rejuvenation routines.",
      images: [
        "https://images.unsplash.com/photo-1615396899839-c99c121888b0?w=600&q=80",
        "https://images.unsplash.com/photo-1590156546946-ce57a1d7ebd7?w=600&q=80",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Facial Cleansing Sonic Massager",
      subCategory: "Skincare Devices",
      brand: "Xiaomi",
      desc: "Sonic silicone face scrubber with customizable vibration speeds, deep-pore cleaning bristles, and USB charging.",
      images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
      ]
    },
    {
      name: "Apple Smart Skin Analyzer Mirror",
      subCategory: "Beauty Tech",
      brand: "Apple",
      desc: "Advanced smart vanity mirror using machine learning to analyze skin health, hydration levels, and product usage suggestions.",
      images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
      ]
    },
    {
      name: "Puma Active Performance Deodorant Spray",
      subCategory: "Personal Care",
      brand: "Puma",
      desc: "24-hour long lasting sweat protection deodorant designed for active athletes, with fresh citrus woody scent notes.",
      images: [
        "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&q=80",
        "https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&q=80",
        "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Hydrating Ionic Hair Dryer",
      subCategory: "Hair Styling",
      brand: "Xiaomi",
      desc: "High air volume ionic blow dryer that moisturizes hair cuticles, prevents static, and accelerates dry times.",
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
      ]
    },
    {
      name: "OnePlus Smart Toothbrush Pro",
      subCategory: "Personal Care",
      brand: "OnePlus",
      desc: "Sonic electric toothbrush with intelligent pressure warning indicators, smart app statistics, and 30-day battery life.",
      images: [
        "https://images.unsplash.com/photo-1553135686-51d3ad77d2b7?w=600&q=80",
        "https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=600&q=80",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Face Steamer Moisturizer",
      subCategory: "Skincare",
      brand: "Xiaomi",
      desc: "Nano-ionic facial steamer that open pores to deeply hydrate skin, enhance blood flow, and prepare face for serums.",
      images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
      ]
    },
    {
      name: "Nike Sport Defense Sunscreen SPF 50",
      subCategory: "Skincare",
      brand: "Nike",
      desc: "Water-resistant, non-greasy sport sunscreen lotion engineered to protect active runners from UVA/UVB rays.",
      images: [
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
        "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600&q=80",
        "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80"
      ]
    },
    {
      name: "Samsung UV Gel Nail Curing Lamp",
      subCategory: "Nail Care",
      brand: "Samsung",
      desc: "High speed intelligent UV/LED nail polish dryer containing automatic motion sensors and customizable timers.",
      images: [
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Sonic Blackhead Remover Vacuum",
      subCategory: "Skincare",
      brand: "Xiaomi",
      desc: "Pore suction vacuum extractor with adjustable suction levels and dynamic camera integration for skin views.",
      images: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80"
      ]
    }
  ],
  "Furniture": [
    {
      name: "Xiaomi Smart Ergonomic Office Desk",
      subCategory: "Desks",
      brand: "Xiaomi",
      desc: "Electric height adjustable standing desk with built-in memory presets, child lock, and USB charging interface.",
      images: [
        "https://images.unsplash.com/photo-1530018607912-eff2df114f12?w=600&q=80",
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80",
        "https://images.unsplash.com/photo-1486946255132-5512961dbd8?w=600&q=80"
      ]
    },
    {
      name: "Puma Gaming Chair Pro Active",
      subCategory: "Chairs",
      brand: "Puma",
      desc: "High-performance gaming seat with premium bucket support, dynamic back reclining, adjustable 3D armrests.",
      images: [
        "https://images.unsplash.com/photo-1598550476439-6847785fce6e?w=600&q=80",
        "https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=600&q=80",
        "https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&q=80"
      ]
    },
    {
      name: "Asus ROG Gaming Setup Desk",
      subCategory: "Desks",
      brand: "Asus",
      desc: "Heavy-duty carbon-fiber gaming table with full-surface RGB mouse pad, built-in headset hanger, and cable organization tray.",
      images: [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&q=80",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&q=80",
        "https://images.unsplash.com/photo-1612287230202-1bf1d85d1bdf?w=600&q=80"
      ]
    },
    {
      name: "Samsung Smart Home Sofa Chair",
      subCategory: "Sofas",
      brand: "Samsung",
      desc: "Premium upholstered lounge recliner featuring built-in wireless charging pad and side panel audio speakers.",
      images: [
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
        "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
        "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80"
      ]
    },
    {
      name: "Sony Home Theatre Entertainment Console",
      subCategory: "TV Units",
      brand: "Sony",
      desc: "Elegant floating wooden media stand designed with internal storage slots, cord cutouts, and acoustic speaker mesh panels.",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
        "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi LED Smart Study Desk",
      subCategory: "Desks",
      brand: "Xiaomi",
      desc: "Minimalist study desk featuring an integrated smart desk lamp with auto-dimming eyesafe technology.",
      images: [
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80",
        "https://images.unsplash.com/photo-1530018607912-eff2df114f12?w=600&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"
      ]
    },
    {
      name: "Adidas Fit Workout Bench",
      subCategory: "Benches",
      brand: "Adidas",
      desc: "Adjustable utility gym bench designed with multi-position settings, thick foam padding, and steel support frames.",
      images: [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
        "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&q=80"
      ]
    },
    {
      name: "LG OLED Wall TV Mount Cabinet",
      subCategory: "TV Units",
      brand: "LG",
      desc: "Modern minimalist wall cabinet unit featuring dynamic LED backlight integration and hidden wire channels.",
      images: [
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
        "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=600&q=80"
      ]
    },
    {
      name: "Dell Office Workspace Computer Cart",
      subCategory: "Desks",
      brand: "Dell",
      desc: "Mobile laptop trolley stand on lockable wheels, featuring height adjustable desktop boards and document trays.",
      images: [
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80",
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80",
        "https://images.unsplash.com/photo-1530018607912-eff2df114f12?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Smart Air Purifier Wardrobe Console",
      subCategory: "Cabinets",
      brand: "Xiaomi",
      desc: "High-end storage chest integrated with a silent smart air-purification system to keep clothes dry.",
      images: [
        "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=600&q=80",
        "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=600&q=80",
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80"
      ]
    }
  ],
  "Home & Kitchen": [
    {
      name: "Xiaomi Smart Air Fryer 3.5L",
      subCategory: "Appliances",
      brand: "Xiaomi",
      desc: "Intelligent hot-air air fryer supporting App recipe controls, 360-degree heat circulation, and non-stick basket grates.",
      images: [
        "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600&q=80",
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80"
      ]
    },
    {
      name: "Samsung Smart Microwave Oven",
      subCategory: "Appliances",
      brand: "Samsung",
      desc: "High capacity digital microwave with smart sensor cooking options, ceramic interior, and eco-friendly standby modes.",
      images: [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
        "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80"
      ]
    },
    {
      name: "LG NeoChef Convection Microwave",
      subCategory: "Appliances",
      brand: "LG",
      desc: "Multipurpose kitchen convection cooker offering uniform heating, yogurt fermentation modes, and charcoal grilling.",
      images: [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
        "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Smart Induction Cooktop",
      subCategory: "Appliances",
      brand: "Xiaomi",
      desc: "Portable smart induction cooker hob with 99 temperature settings, dual-frequency heating, and non-slip silicone rings.",
      images: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
        "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80",
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80"
      ]
    },
    {
      name: "Sony Smart Coffee Maker Machine",
      subCategory: "Appliances",
      brand: "Sony",
      desc: "Programmable drip coffee maker machine equipped with thermal carafe, brew strength selector, and smart timers.",
      images: [
        "https://images.unsplash.com/photo-1520606407011-23c2f8fa678e?w=600&q=80",
        "https://images.unsplash.com/photo-1517256014503-f9c8f22e53d6?w=600&q=80",
        "https://images.unsplash.com/photo-1570968915860-54d5c301fc9f?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Automatic Robot Vacuum Cleaner",
      subCategory: "Cleaning Tech",
      brand: "Xiaomi",
      desc: "Lidar-guided automatic vacuum mop sweeper mapping home rooms dynamically, returning to self-empty charge base.",
      images: [
        "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80"
      ]
    },
    {
      name: "LG InstaView Door Refrigerator Pitcher",
      subCategory: "Drinkware",
      brand: "LG",
      desc: "Premium glass water carafe pitcher with built-in fruit infuser tube and automatic cooling double wall.",
      images: [
        "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80"
      ]
    },
    {
      name: "Samsung Smart Air Purifier Tower",
      subCategory: "Appliances",
      brand: "Samsung",
      desc: "HEPA filtration air filter tower that captures 99.97% dust, smoke, and pollen particles from large home rooms.",
      images: [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
        "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Smart Rice Cooker",
      subCategory: "Appliances",
      brand: "Xiaomi",
      desc: "IH electromagnetic heating smart rice cooker cooker with non-stick inner pot and customized app texture profiles.",
      images: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&q=80",
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&q=80",
        "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80"
      ]
    },
    {
      name: "LG CordZero Handheld Vacuum Cleaner",
      subCategory: "Cleaning Tech",
      brand: "LG",
      desc: "Cordless lightweight stick vacuum with dual batteries, robust suction motors, and multi-surface wash heads.",
      images: [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80",
        "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80"
      ]
    }
  ],
  "Sports": [
    {
      name: "Nike Premium Resistance Bands Set",
      subCategory: "Fitness",
      brand: "Nike",
      desc: "Durable latex resistance exercise loops with multiple tension ratings, storage bag, and workout guide sheet.",
      images: [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
        "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&q=80"
      ]
    },
    {
      name: "Adidas Speed Skipping Rope Pro",
      subCategory: "Fitness",
      brand: "Adidas",
      desc: "High-speed ball-bearing jumping rope with aluminum handles, adjustable length cable, and comfortable grip wraps.",
      images: [
        "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&q=80",
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80"
      ]
    },
    {
      name: "Puma Active Yoga Mat 6mm",
      subCategory: "Fitness",
      brand: "Puma",
      desc: "Non-slip eco-friendly yoga and exercise cushion mat featuring carry strap and textured dual-sided grip patterns.",
      images: [
        "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80",
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&q=80",
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80"
      ]
    },
    {
      name: "Nike Pitch Soccer Training Ball",
      subCategory: "Equipment",
      brand: "Nike",
      desc: "High contrast graphic football training ball with butyl bladder for shape retention and machine-stitched casing.",
      images: [
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80",
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
        "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=600&q=80"
      ]
    },
    {
      name: "Adidas Court Tennis Racket Pro",
      subCategory: "Equipment",
      brand: "Adidas",
      desc: "Lightweight carbon-graphite tennis racquet offering large sweet spot, pre-strung with high-tension nylon cord.",
      images: [
        "https://images.unsplash.com/photo-1617083934555-ac7d4feeae2e?w=600&q=80",
        "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=600&q=80",
        "https://images.unsplash.com/photo-1622279457486-62dcc4a4b1fa?w=600&q=80"
      ]
    },
    {
      name: "Puma Active Gym Duffel Bag",
      subCategory: "Bags",
      brand: "Puma",
      desc: "Robust athletic workout duffel bag with specialized external shoe compartment, mesh pocket, and padded strap.",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80"
      ]
    },
    {
      name: "Nike Elite Basketball Grip Ball",
      subCategory: "Equipment",
      brand: "Nike",
      desc: "Premium indoor/outdoor basketball featuring composite leather shell for superior finger grip control and bounces.",
      images: [
        "https://images.unsplash.com/photo-1544698310-74ea9d1c8258?w=600&q=80",
        "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?w=600&q=80",
        "https://images.unsplash.com/photo-1518063319789-7217e6706b04?w=600&q=80"
      ]
    },
    {
      name: "Adidas Dynamic Gym Water Bottle",
      subCategory: "Bottles",
      brand: "Adidas",
      desc: "Double walled stainless steel sports hydration flask with leak-proof straw lid, keeping drinks ice cold for 24h.",
      images: [
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600&q=80",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80"
      ]
    },
    {
      name: "Puma Trainer Running Armband",
      subCategory: "Fitness",
      brand: "Puma",
      desc: "Water-resistant phone holder armband for jogging, with touch-responsive screen cover and key slot details.",
      images: [
        "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80",
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
        "https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=600&q=80"
      ]
    },
    {
      name: "Nike Pro Combat Training Gloves",
      subCategory: "Fitness",
      brand: "Nike",
      desc: "Padded gym workout weightlifting gloves featuring breathable mesh backing and adjustable hook-and-loop wrist bands.",
      images: [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80",
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&q=80",
        "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=600&q=80"
      ]
    }
  ],
  "Gaming": [
    {
      name: "Sony PlayStation VR2 Headset",
      subCategory: "VR Kits",
      brand: "Sony",
      desc: "Virtual reality headset system with OLED panels, 120Hz refresh rates, eye tracking, and sensory controller triggers.",
      images: [
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600&q=80",
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=600&q=80",
        "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&q=80"
      ]
    },
    {
      name: "Asus ROG Claymore Mechanical Keyboard",
      subCategory: "Input Devices",
      brand: "Asus",
      desc: "Modular mechanical gaming keyboard with detachable numeric pad, Cherry MX switches, and Aura Sync RGB controls.",
      images: [
        "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80",
        "https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&q=80",
        "https://images.unsplash.com/photo-1601445638532-3c6f6c3aa1d6?w=600&q=80"
      ]
    },
    {
      name: "Sony DualSense Edge Wireless Controller",
      subCategory: "Controllers",
      brand: "Sony",
      desc: "High-performance customizable PS5 controller with swappable stick caps, remappable back paddles, and lock slider.",
      images: [
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80",
        "https://images.unsplash.com/photo-1592155931584-901ac15763e3?w=600&q=80",
        "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&q=80"
      ]
    },
    {
      name: "Asus ROG Harpe Ace Gaming Mouse",
      subCategory: "Input Devices",
      brand: "Asus",
      desc: "Ultra lightweight gaming mouse weighing 54g, co-developed with esports pros, containing 36K DPI optical sensor.",
      images: [
        "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80",
        "https://images.unsplash.com/photo-1625842268584-8f329040ff31?w=600&q=80",
        "https://images.unsplash.com/photo-1629429408209-1f912961dbd8?w=600&q=80"
      ]
    },
    {
      name: "Sony INZONE H9 Gaming Headset",
      subCategory: "Audio Devices",
      brand: "Sony",
      desc: "Wireless noise-cancelling spatial gaming headset with flip-up boom mic, dual-mode 2.4GHz connection, and bluetooth.",
      images: [
        "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
        "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80",
        "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80"
      ]
    }
  ],
  "Accessories": [
    {
      name: "Apple AirTag Finder Case 4-Pack",
      subCategory: "Trackers",
      brand: "Apple",
      desc: "Premium faux-leather keyrings designed for AirTags, keeping them secure during travel and commute finder trackers.",
      images: [
        "https://images.unsplash.com/photo-1629470989153-65934c59b4e9?w=600&q=80",
        "https://images.unsplash.com/photo-1619725860883-8a30ef56b9c9?w=600&q=80",
        "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=80"
      ]
    },
    {
      name: "Samsung Galaxy SmartTag2 Pack",
      subCategory: "Trackers",
      brand: "Samsung",
      desc: "Compact bluetooth tracker tags with up to 500 days battery life, compass view guidance, and IP67 rating.",
      images: [
        "https://images.unsplash.com/photo-1629470989153-65934c59b4e9?w=600&q=80",
        "https://images.unsplash.com/photo-1589003077984-894e133dabab?w=600&q=80",
        "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=600&q=80"
      ]
    },
    {
      name: "OnePlus Voyager Laptop Sleeve Case",
      subCategory: "Sleeves",
      brand: "OnePlus",
      desc: "Water-repellent protective travel sleeve bag featuring padded felt interiors and accessory organizer pockets.",
      images: [
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
        "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80"
      ]
    },
    {
      name: "Xiaomi Classic Polarized Sunglasses",
      subCategory: "Eyewear",
      brand: "Xiaomi",
      desc: "Classic retro styled sunglasses with polarized UV400 lenses, self-repairing coatings, and lightweight frames.",
      images: [
        "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80",
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
        "https://images.unsplash.com/photo-1508296695146-257a814070b4?w=600&q=80"
      ]
    },
    {
      name: "Apple Watch Link Bracelet Band",
      subCategory: "Watch Bands",
      brand: "Apple",
      desc: "Exquisite stainless steel alloy link band with custom butterfly closure, adjustable by simple push-button release links.",
      images: [
        "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&q=80",
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=600&q=80"
      ]
    }
  ],
  "Books": [
    {
      name: "Apple Design History Book",
      subCategory: "Design",
      brand: "Apple",
      desc: "Monograph book chronicling 20 years of Apple product design history, illustrated with high-definition photography prints.",
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
        "https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=600&q=80"
      ]
    },
    {
      name: "Sony PlayStation Chronicle Book",
      subCategory: "History",
      brand: "Sony",
      desc: "Richly illustrated coffee table book documenting the evolution of PlayStation gaming consoles and franchises.",
      images: [
        "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&q=80",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80",
        "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&q=80"
      ]
    },
    {
      name: "Nike Shoe Dog Memoir Special Edition",
      subCategory: "Biography",
      brand: "Nike",
      desc: "Collectible hardcover printing of Phil Knight's memoir detailing the wild, chaotic journey of creating Nike.",
      images: [
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80",
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80"
      ]
    }
  ],
  "Groceries": [
    {
      name: "Xiaomi Organic Earl Grey Tea Pack",
      subCategory: "Beverages",
      brand: "Xiaomi",
      desc: "Premium loose-leaf black tea blend flavored with cold-pressed bergamot orange essential oils.",
      images: [
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80",
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&q=80",
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=600&q=80"
      ]
    },
    {
      name: "Samsung Premium Cacao Beans 500g",
      subCategory: "Baking",
      brand: "Samsung",
      desc: "Raw organic cocoa nibs sourced from sustainable fair-trade farms, ideal for baking and chocolate making.",
      images: [
        "https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=600&q=80",
        "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80",
        "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=600&q=80"
      ]
    }
  ]
};

const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/cartNOW`);
    console.log("DB Connected for Precise Seeding.");
    
    // Fetch sellers
    const sellers = await sellerModel.find({});
    if (sellers.length === 0) {
      console.error("NO SELLERS FOUND in database! Please create a seller first.");
      process.exit(1);
    }
    
    // Clear old seeded products
    const clearResult = await productModel.deleteMany({});
    console.log("Cleared old products:", clearResult);
    
    const seededProducts = [];
    const categoryCounts = {};
    const brandCounts = {};
    const sellerDistribution = {};
    const audienceCounts = { "Men": 0, "Women": 0, "Kids": 0 };
    
    // Initialize statistics
    brands.forEach(b => brandCounts[b] = 0);
    Object.keys(rawProductsTemplate).forEach(cat => categoryCounts[cat] = 0);
    sellers.forEach(s => sellerDistribution[s.email] = 0);
    
    const nonFashionAudiences = ["Men", "Kids", "Women"];
    let nonFashionIdx = 0;

    // Build 200 products matching exact distribution limits
    // Yielding exactly:
    // - 50 Men products (non-fashion)
    // - 50 Kids products (non-fashion)
    // - 100 Women products (50 Fashion/Clothes and 50 other categories)
    for (const [categoryName, templateList] of Object.entries(rawProductsTemplate)) {
      let targetCount = 0;
      if (categoryName === "Electronics") targetCount = 36;
      else if (categoryName === "Fashion") targetCount = 50; // 50 Women Clothes
      else if (categoryName === "Beauty") targetCount = 20;
      else if (categoryName === "Furniture") targetCount = 20;
      else if (categoryName === "Home & Kitchen") targetCount = 20;
      else if (categoryName === "Sports") targetCount = 20;
      else if (categoryName === "Gaming") targetCount = 12;
      else if (categoryName === "Accessories") targetCount = 12;
      else if (categoryName === "Books") targetCount = 6;
      else if (categoryName === "Groceries") targetCount = 4;
      
      for (let i = 0; i < targetCount; i++) {
        // Pick template item sequentially (and wrap around)
        const template = templateList[i % templateList.length];
        const assignedSeller = pickRandom(sellers);
        const price = randomRange(499, 149999);
        const discount = pickRandom([0, 5, 10, 15, 20, 25, 30]);
        const originalPrice = Math.round(price * (1 + discount / 100));
        const stock = randomRange(10, 150);
        const rating = parseFloat((randomRange(40, 49) / 10).toFixed(1));
        
        // Build reviews
        const reviewsList = [];
        for (let r = 0; r < randomRange(1, 5); r++) {
          reviewsList.push({
            userId: new mongoose.Types.ObjectId(),
            name: pickRandom(["Ramesh", "Suresh", "Priya", "Ankit", "Sneha", "Kunal", "Amit", "Kiran"]),
            rating: Math.round(rating),
            comment: pickRandom(["Excellent product, highly recommended!", "Good value for money.", "Decent quality but shipping took time.", "Outstanding performance!", "Satisfied with the purchase."]),
            date: new Date(Date.now() - randomRange(1, 60) * 24 * 60 * 60 * 1000)
          });
        }
        
        let audience;
        if (categoryName === "Fashion") {
          audience = "Women"; // Enforce all fashion items are for women
        } else {
          audience = nonFashionAudiences[nonFashionIdx % 3];
          nonFashionIdx++;
        }

        // Tags
        const tags = [
          categoryName.toLowerCase(),
          template.subCategory.toLowerCase(),
          template.brand.toLowerCase(),
          audience.toLowerCase(),
          ...(audience === "Kids" ? ["kid"] : []),
          ...pickMultipleRandom(["premium", "affordable", "trending", "best-seller", "sale", "modern", "durable"], 2)
        ];
        
        const collections = [
          audience,
          ...(audience === "Kids" ? ["Kid"] : []),
          ...pickMultipleRandom(collectionsPool, randomRange(1, 2))
        ];

        const keywords = [
          template.brand.toLowerCase(),
          template.subCategory.toLowerCase(),
          ...template.name.toLowerCase().split(" "),
          audience.toLowerCase()
        ].filter((k, index, self) => k.length > 2 && self.indexOf(k) === index);
        
        // Add indices to name if it is repeated to keep them unique
        const productSuffix = i >= templateList.length ? ` (Gen ${Math.floor(i / templateList.length) + 1})` : "";
        
        const productObj = {
          name: `${template.name}${productSuffix}`,
          description: template.desc,
          price: price,
          originalPrice: originalPrice,
          images: template.images, // Use precise product images directly!
          category: categoryName,
          subCategory: template.subCategory,
          brand: template.brand,
          sku: `${categoryName.slice(0, 3).toUpperCase()}-${template.brand.slice(0, 3).toUpperCase()}-${randomRange(1000, 9999)}`,
          stock: stock,
          sizes: categoryName === "Fashion" ? ["S", "M", "L", "XL"] : [],
          tags: tags,
          specifications: [
            { key: "Brand", value: template.brand },
            { key: "Model", value: template.name },
            { key: "Warranty", value: pickRandom(["1 Year Warranty", "2 Years Warranty", "6 Months Warranty"]) }
          ],
          reviews: reviewsList,
          sellerId: assignedSeller._id,
          audience: audience,
          collections: collections,
          keywords: keywords,
          status: "approved"
        };
        
        seededProducts.push(productObj);
        
        // Update stats
        categoryCounts[categoryName]++;
        brandCounts[template.brand]++;
        sellerDistribution[assignedSeller.email]++;
        audienceCounts[audience]++;
      }
    }
    
    console.log(`Prepared ${seededProducts.length} products for insertion.`);
    
    // Insert products
    const result = await productModel.insertMany(seededProducts);
    console.log(`Successfully inserted ${result.length} products!`);
    
    // Print Summary Table
    console.log("\n=================================");
    console.log("    SEEDING SUMMARY RESULTS");
    console.log("=================================");
    console.log("\nCATEGORY COUNTS:");
    Object.entries(categoryCounts).forEach(([cat, val]) => {
      console.log(`- ${cat}: ${val}`);
    });
    
    console.log("\nAUDIENCE (GENDER) COUNTS:");
    Object.entries(audienceCounts).forEach(([aud, val]) => {
      console.log(`- ${aud}: ${val}`);
    });

    console.log("\nBRAND COUNTS:");
    Object.entries(brandCounts).forEach(([brnd, val]) => {
      if (val > 0) console.log(`- ${brnd}: ${val}`);
    });
    
    console.log("\nSELLER DISTRIBUTION:");
    Object.entries(sellerDistribution).forEach(([email, val]) => {
      console.log(`- ${email}: ${val} products`);
    });
    
    console.log("\nInsertion errors: None");
    console.log("=================================\n");
    
  } catch (error) {
    console.error("Seeding failed with error:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("DB Disconnected.");
  }
};

connectDb();
