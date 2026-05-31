import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

// ── Inline schema (avoids import path issues in seed scripts) ──
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  images: { type: [String], required: true },
  category: { type: String, required: true },
  subCategory: { type: String, default: "" },
  collection: { type: String, default: "" },
  brand: { type: String, default: "" },
  sku: { type: String, default: "" },
  stock: { type: Number, default: 0 },
  sizes: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  specifications: { type: [{ key: String, value: String }], default: [] },
  reviews: { type: [], default: [] },
  date: { type: Date, default: Date.now },
}, { suppressReservedKeysWarning: true });

const Product = mongoose.models.product || mongoose.model("product", productSchema);

// ── Unsplash image pools per category ──
const imgs = {
  men: [
    "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80",
    "https://images.unsplash.com/photo-1602810316536-6a8d8c65b3d6?w=600&q=80",
    "https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&q=80",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    "https://images.unsplash.com/photo-1594938298603-c8148c4b6d8f?w=600&q=80",
    "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80",
  ],
  women: [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=600&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80",
    "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=600&q=80",
    "https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&q=80",
  ],
  kids: [
    "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=600&q=80",
    "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&q=80",
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80",
    "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&q=80",
    "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600&q=80",
  ],
  electronics: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&q=80",
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80",
    "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&q=80",
    "https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=600&q=80",
    "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
  ],
  beauty: [
    "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&q=80",
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&q=80",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    "https://images.unsplash.com/photo-1631214524020-3c69a6d4e576?w=600&q=80",
  ],
  home: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=600&q=80",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&q=80",
    "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=600&q=80",
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&q=80",
  ],
  sports: [
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80",
    "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600&q=80",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
  ],
  books: [
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=600&q=80",
    "https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=600&q=80",
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80",
  ],
  accessories: [
    "https://images.unsplash.com/photo-1509941943102-10c232535736?w=600&q=80",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80",
    "https://images.unsplash.com/photo-1484942046848-4f29e24ff3a7?w=600&q=80",
    "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  ],
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const menShirtColors  = ["White","Blue","Grey","Navy","Black","Beige","Mint","Olive","Burgundy","Slate"];
const chinoColors     = ["Khaki","Navy","Olive","Grey","Black","Camel","Maroon","Teal","Mustard","Stone"];
const poloColors      = ["Royal Blue","Forest Green","Brick Red","Charcoal","White","Navy","Coral","Lavender"];
const deniColors      = ["Classic Blue","Dark Wash","Light Wash","Black","Grey","Indigo","Stone Wash","Distressed"];
const shortColors     = ["Black","Navy","Red","Grey","Blue","Green"];
const maxiThemes      = ["Crimson Rose","Midnight Blue","Sage Garden","Sunset Peach","Ivory Dream","Lavender Field","Ocean Breeze","Terracotta Bloom","Cherry Blossom","Forest Fern"];
const yogaColors      = ["Midnight Black","Deep Navy","Charcoal Grey","Dusty Rose","Sage Green","Burgundy","Cobalt Blue","Heather Grey","Mauve","Electric Blue"];
const blazerColors    = ["Classic Black","Ivory White","Camel","Navy Blue","Charcoal","Blush Pink","Emerald Green","Cobalt Blue"];
const kurtiPrints     = ["Jaipuri Print","Block Print Blue","Lucknowi Chikan","Bandhani Red","Floral Peach","Geometric Grey","Embroidered White","Ikat Indigo"];
const kidsTeePrints   = ["Dino Roar","Space Explorer","Superhero Squad","Jungle Animals","Underwater World","Racing Cars","Princess Dreams","Rainbow Unicorn"];
const kidsDeniWashes  = ["Classic Blue","Dark Wash","Light Wash","Black","Acid Wash","Embroidered"];
const audioProducts   = ["Wireless Noise-Cancelling Headphones Pro","Bluetooth Earbuds Ultra","Gaming Headset RGB","Open-Back Studio Headphones","Sports Earphones Waterproof","True Wireless Earbuds Lite","USB-C Wired Headphones","Kids Volume-Limiting Headphones","Bone Conduction Headphones","Hi-Fi Over-Ear Headphones"];
const audioBrands     = ["Sony","JBL","boAt","Skullcandy","Apple","Samsung","Bose","Sennheiser","Jabra","Anker"];
const kbdProducts     = ["Mechanical Gaming Keyboard TKL","Wireless Ergonomic Keyboard","RGB Backlit Gaming Keyboard","Mini 60% Keyboard","Foldable Bluetooth Keyboard","Membrane Office Keyboard","Dual-Mode Wireless Keyboard","Gaming Keyboard with Numpad","Silent Mechanical Keyboard","Compact 75% Keyboard"];
const kbdBrands       = ["Keychron","Corsair","Logitech","HyperX","Razer","SteelSeries","Ducky","ASUS","MSI","Cooler Master"];
const webcamProducts  = ["4K Webcam Pro","1080p HD Webcam","Streaming Webcam Ultra Wide","Business Conference Webcam","AI-Enhanced Webcam","Dual Webcam","Clip-On Webcam","Webcam with Ring Light"];
const webcamBrands    = ["Logitech","Razer","Microsoft","Elgato","Anker","Trust","Dell","HP"];
const monitorSizes    = [27,24,32,34,27,24,49,28];
const monitorTypes    = ["4K IPS Monitor","Full HD Gaming Monitor","Ultrawide Curved Monitor","4K OLED Monitor","144Hz Gaming Monitor","USB-C Monitor","Super Ultrawide Monitor","Portable Monitor"];
const monitorBrands   = ["Samsung","LG","Dell","Asus","AOC","Acer","BenQ","ViewSonic"];
const bulbColors      = ["Cool White","Warm White","RGB Color","Tunable White","GLS Shape","Candle Shape"];
const bulbBrands      = ["Philips Hue","Syska","Wipro","Crompton","Havells","Xiaomi"];
const serumNames      = ["Hyaluronic Acid Serum","Vitamin C Brightening Serum","Retinol Anti-Aging Serum","Niacinamide Pore-Minimizing Serum","Peptide Firming Serum","Salicylic Acid Serum","AHA/BHA Exfoliating Serum","Ceramide Barrier Serum","Collagen Boosting Serum","Tea Tree Blemish Serum"];
const serumBrands     = ["The Ordinary","Minimalist","Dot & Key","Plum","Mamaearth","WOW","Derma Co","CeraVe","Neutrogena","L'Oreal"];
const serumIngreds    = ["Hyaluronic Acid","Vitamin C","Retinol","Niacinamide","Peptides","Salicylic Acid","AHA/BHA","Ceramides","Collagen","Tea Tree"];
const lipFinish       = ["Matte","Glossy","Satin","Velvet","Metallic","Sheer","Bold","Natural"];
const lipShades       = ["#01 Nude","#02 Rose","#03 Berry","#04 Red","#05 Coral","#06 Mauve","#07 Plum","#08 Brown"];
const lipBrands       = ["MAC","NYX","Lakme","Maybelline","Colorbar","Sugar","Swiss Beauty","Faces Canada"];
const perfumeScents   = ["Rose","Jasmine","Sandalwood","Oud","Citrus Fresh","Ocean Breeze"];
const perfumeBrands   = ["Forest Essentials","Kama Ayurveda","Davidoff","Calvin Klein","Versace","Polo Ralph Lauren"];
const decStyles       = ["Nordic","Boho","Industrial","Minimalist","Rustic","Art Deco","Scandinavian","Mid-Century","Contemporary","Coastal"];
const decProducts     = ["Sofa Cushion Cover Set","Throw Blanket","Table Runner","Curtain Panel","Bed Cover","Pillow Set","Wall Tapestry","Area Rug","Lamp Shade","Decorative Vase"];
const decBrands       = ["Home Centre","Ikea","Urban Ladder","Pepperfry","FabIndia","Good Earth","Crate and Barrel","H&M Home","Pottery Barn","Anthropologie"];
const cwMaterials     = ["Non-Stick","Cast Iron","Stainless Steel","Copper Bottom","Ceramic","Hard-Anodised","Carbon Steel","Tri-Ply"];
const cwProducts      = ["Frying Pan","Casserole","Wok","Pressure Cooker","Sauce Pan","Grill Pan","Dutch Oven","Kadai"];
const cwBrands        = ["Prestige","Hawkins","Tefal","Le Creuset","Caraway","Made In","Lodge","Calphalon"];
const bedThreads      = ["1000 Thread Count","800 Thread Count","600 Thread Count","Egyptian Cotton","Bamboo Silk","Organic Cotton"];
const bedSizes        = ["King","Queen","Double","Single","Super King","California King"];
const bedBrands       = ["Spaces","Raymond","D'Decor","Portico","Trident","Bombay Dyeing"];
const bedMaterials    = ["Long-Staple Cotton","Long-Staple Cotton","Egyptian Cotton","Egyptian Cotton","Bamboo","Organic Cotton"];
const sportsLevels    = ["Professional","Training","Indoor","Outdoor","Beginner","Intermediate","Competitive","Kids"];
const sportsProducts  = ["Badminton Racket","Tennis Racket","Squash Racket","Table Tennis Bat","Cricket Bat","Football","Basketball","Volleyball"];
const sportsBrands    = ["Yonex","Wilson","Head","Li-Ning","Victor","Cosco","SG","Adidas"];
const shoeStyles      = ["Running","Training","Basketball","Football Turf","Tennis","Hiking","Cricket","Casual"];
const shoeGenders     = ["Men's","Women's","Unisex","Men's","Women's","Unisex","Men's","Women's"];
const shoeColors      = ["Black","White","Navy","Grey","Blue","Green","Red","Beige"];
const shoeBrands      = ["Nike","Adidas","Puma","Reebok","New Balance","ASICS","Under Armour","Skechers"];
const bookTitles      = ["Atomic Habits","The Psychology of Money","Deep Work","Ikigai","The Alchemist","Sapiens","Think and Grow Rich","The 4-Hour Work Week","Zero to One","Shoe Dog"];
const bookSubCats     = ["Self Help","Finance","Productivity","Wellness","Fiction","History","Self Help","Business","Startups","Biography"];
const bookDescs       = [
  "James Clear's groundbreaking guide to building good habits and breaking bad ones. Drawing on neuroscience and behavioural psychology, Clear presents a proven system for transforming your life through tiny 1% improvements. Includes the famous Four Laws of Behaviour Change framework, practical strategies for habit stacking, and real-world case studies from elite athletes, artists, and executives. Over 10 million copies sold worldwide.",
  "Morgan Housel's masterpiece on the strange ways people think about money. With 19 short stories exploring how greed, fear, and irrationality shape financial decisions, this book teaches you how to make better sense of one of life's most important topics. Insightful, witty, and packed with timeless wisdom.",
  "Cal Newport's compelling argument for focused work in an increasingly distracted world. Deep Work presents rules for achieving a state of distraction-free concentration that pushes your cognitive capabilities to their limits. Essential reading for knowledge workers and creatives.",
  "The Japanese concept of Ikigai — your reason for being — explored through conversations with residents of Okinawa. Filled with simple wisdom for leading a long, happy, purposeful life. A gentle, beautiful read that will shift your perspective on what truly matters.",
  "Paulo Coelho's enchanting philosophical novel about Santiago, an Andalusian shepherd boy who follows his dreams across the Egyptian desert. Translated into 80+ languages — the most translated book by a living author.",
  "Yuval Noah Harari's sweeping narrative of human history from the Stone Age to the Silicon Age. Sapiens asks the big questions about how our species came to rule the planet and whether we are any happier than our prehistoric ancestors.",
  "Napoleon Hill's timeless classic distilled from 20 years of interviews with 500 of America's most successful individuals. The 13 principles of success presented here have transformed millions of lives worldwide.",
  "Tim Ferriss's life-changing guide to escaping the 9-5, living anywhere, and joining the new rich. Filled with cutting-edge tactics for creating automated income and achieving a dream lifestyle.",
  "Peter Thiel's manifesto on building companies that create new things. Required reading in Silicon Valley — packed with unconventional wisdom on startups, monopolies, and the future of technology.",
  "Nike founder Phil Knight's memoir about the unlikely journey of building one of the world's most iconic brands. A story of daring, failure, reinvention, and the sheer determination that defines true entrepreneurship."
];
const chocoFlavors    = ["Dark Chocolate","Milk Chocolate","White Chocolate","Hazelnut Praline","Sea Salt Caramel","Almond Crunch","Raspberry Ganache","Matcha Green Tea"];
const chocoBrands     = ["Amul","Cadbury","Lindt","Ferrero","Godiva","Zotter","Paul & Mike","Mason & Co"];
const saltTypes       = ["Himalayan Pink","Black Lava","Smoked Sea","Truffle","Herb Infused","Volcanic"];
const saltOrigins     = ["Himalayas","Hawaii","Mediterranean","Europe","Herbs","Iceland"];
const saltBrands      = ["Urban Platter","Tata Salt","Catch","Naturevibe","True Elements","Organic India"];
const glassStyles     = ["Aviator","Wayfarer","Round","Cat-Eye","Rectangular","Oversized","Sports Wrap","Hexagonal","Rimless","Clubmaster"];
const glassLens       = ["Polarized","UV400","Mirror Lens","Gradient","Tinted","Polarized","Photochromic","Anti-Glare","Blue Light","Bifocal"];
const glassBrands     = ["Ray-Ban","Oakley","Fastrack","Carrera","Police","Maui Jim","Persol","Tom Ford","Gentle Monster","Quay"];
const bagMaterials    = ["Leather","Canvas","Nylon","Vegan Leather","Denim","Woven","Suede","Cork"];
const bagTypes        = ["Tote Bag","Backpack","Crossbody Bag","Clutch","Shoulder Bag","Bucket Bag","Mini Bag","Weekender Bag"];
const bagColors       = ["Black","Tan","Navy","Camel","White","Brown","Olive","Blush"];
const bagBrands       = ["Coach","Michael Kors","Charles & Keith","Fossil","Baggit","Caprese","Hidesign","Da Milano"];
const watchStyles     = ["Mechanical","Smart","Chronograph","Minimalist","Dive","Solar","Dress","Field"];
const watchGenders    = ["Men's","Women's","Unisex","Men's","Men's","Unisex","Women's","Men's"];
const watchBrands     = ["Titan","Fastrack","Casio","Seiko","Orient","Fossil","Skagen","Citizen"];

// Extra filler products to hit 500 total
const extraMenJeans = ["Slim Fit Stretch Jeans Blue","Skinny Jeans Black","Regular Fit Jeans Indigo","Tapered Jeans Grey","Bootcut Jeans Dark Wash","Relaxed Fit Jeans Stone","Ripped Jeans Distressed","Cargo Jeans Olive"];
const extraWomenTops = ["Off-Shoulder Top White","Wrap Top Floral","Puff Sleeve Top Sage","Ribbed Crop Top Black","Tie-Front Blouse Navy","Smocked Top Rust","Bell Sleeve Top Ivory","Striped Oversized Top Blue"];
const extraKidsShoes = ["Light-Up Sneakers","Velcro Sandals","School Shoes Black","Rain Boots Polka Dot","Slip-On Canvas Shoes","Sports Shoes Colourful","Ballet Flats Pink","Ankle Boots Brown"];
const extraElecCables = ["USB-C to USB-A Cable 2m","Lightning Cable 1m Braided","HDMI 2.1 Cable 3m","USB-C to USB-C Cable","DisplayPort Cable 2m","Thunderbolt 4 Cable","Ethernet Cat8 Cable 5m","Audio AUX Cable Gold"];
const extraBeautyHair = ["Argan Oil Hair Serum","Keratin Hair Mask","Biotin Shampoo","Scalp Scrub Peppermint","Heat Protectant Spray","Hair Growth Tonic","Dry Shampoo Coconut","Deep Conditioning Mask"];
const extraHomeLight  = ["Fairy String Lights 10m","LED Strip Light RGB","Bedside Lamp Minimalist","Floor Lamp Arc","Pendant Light Rattan","Solar Garden Light","Motion Sensor Light","Candle Holder Set"];
const extraSportsYoga = ["Yoga Mat Non-Slip 6mm","Resistance Band Set","Foam Roller Deep Tissue","Yoga Block Set","Skipping Rope Speed","Pull-Up Bar Doorway","Ab Roller Wheel","Balance Board"];
const extraBooksStory = ["The Midnight Library","Verity","It Ends with Us","The Silent Patient","Where the Crawdads Sing","People We Meet on Vacation","Beach Read","The Love Hypothesis"];
const extraFoodTea    = ["Darjeeling First Flush Tea","Masala Chai Blend","Green Matcha Powder","Earl Grey Bergamot","Hibiscus Herbal Tea","Chamomile Honey Tea","Oolong Wu-Long Tea","White Peony Tea"];
const extraAccJewel   = ["Sterling Silver Ring","Gold Hoop Earrings","Pearl Necklace","Charm Bracelet","Boho Anklet","Crystal Hair Pin","Tie Pin Gold","Cufflinks Silver"];

// ── Build products array ──
const products = [];
let idx = 0;

const add = (p) => {
  const name = Array.isArray(p.name) ? p.name[0] : p.name;
  products.push({
    ...p,
    name,
    sku: `${p.category.toUpperCase().slice(0,3)}-${String(++idx).padStart(4,"0")}`,
  });
};

// MEN
menShirtColors.forEach((c) => add({ name: `Classic Oxford Shirt ${c}`, description: `Elevate your formal wardrobe with this premium Oxford Shirt in ${c}. Crafted from 100% Egyptian cotton with a crisp, breathable weave, it delivers comfort through long workdays. The button-down collar provides a clean professional look, while the tailored fit accentuates a sharp silhouette. Features include a single chest pocket, back box pleat for ease of movement, and mother-of-pearl buttons. Machine washable and easy to iron — a true wardrobe staple for the modern gentleman.`, price: rand(899,2499), category:"Men", subCategory:"Shirts", collection:"Men", brand:"CartNOW Formals", images:[pick(imgs.men),pick(imgs.men)], sizes:["S","M","L","XL","XXL"], stock:rand(20,100), tags:["shirt","formal","oxford","men"], specifications:[{key:"Fabric",value:"100% Egyptian Cotton"},{key:"Fit",value:"Tailored"},{key:"Wash",value:"Machine Washable"}] }));
chinoColors.forEach((c) => add({ name: `Slim Fit Chinos ${c}`, description: `Modern slim-fit chinos in ${c} that bridge the gap between smart-casual and formal. Made from a premium cotton-stretch blend for all-day comfort without compromising style. Features a mid-rise waist, zip fly with button closure, two front slant pockets, and two back welt pockets. Perfect for the office, dinner dates, or weekend outings. Pairs effortlessly with shirts, polos, or casual tees.`, price: rand(999,2999), category:"Men", subCategory:"Trousers", collection:"Men", brand:"CartNOW Casuals", images:[pick(imgs.men),pick(imgs.men)], sizes:["28","30","32","34","36","38"], stock:rand(15,80), tags:["chinos","trousers","slim-fit","men"], specifications:[{key:"Fabric",value:"98% Cotton 2% Elastane"},{key:"Rise",value:"Mid-Rise"},{key:"Closure",value:"Zip Fly with Button"}] }));
poloColors.forEach((c) => add({ name: `Men's Premium Polo T-Shirt ${c}`, description: `Crafted from pima cotton piqué in ${c}, this premium polo shirt offers the perfect blend of luxury and functionality. The ribbed collar stays crisp all day, while the 2-button placket adds a refined touch. A vented hem ensures unrestricted movement, and the slightly longer back hem stays neatly tucked. Whether you're at the golf course, a casual brunch, or a relaxed office environment, this polo adapts seamlessly to every setting.`, price: rand(699,1799), category:"Men", subCategory:"T-Shirts", collection:"Men", brand:"CartNOW Sport", images:[pick(imgs.men),pick(imgs.men)], sizes:["S","M","L","XL","XXL"], stock:rand(30,120), tags:["polo","t-shirt","casual","men"], specifications:[{key:"Fabric",value:"100% Pima Cotton"},{key:"Collar",value:"Ribbed"},{key:"Buttons",value:"2-Button Placket"}] }));
deniColors.forEach((c) => add({ name: `Men's Denim Jacket ${c}`, description: `A timeless wardrobe investment in ${c} — our men's denim jacket is constructed from heavyweight 12oz selvedge denim that only gets better with age. Features a spread collar, chest button pockets, side hand pockets, and an adjustable button waistband. The structured cut sits perfectly on the shoulders, offering a vintage silhouette with modern proportions. Style over a plain tee and chinos for an effortlessly cool look.`, price: rand(1999,4999), category:"Men", subCategory:"Jackets", collection:"Men", brand:"CartNOW Denim Co.", images:[pick(imgs.men),pick(imgs.men)], sizes:["S","M","L","XL","XXL"], stock:rand(10,50), tags:["denim","jacket","outerwear","men"], specifications:[{key:"Fabric",value:"100% Selvedge Denim"},{key:"Weight",value:"12 oz"},{key:"Pockets",value:"4 Pockets"}] }));
shortColors.forEach((c) => add({ name: `Men's Running Shorts ${c}`, description: `High-performance running shorts in ${c} engineered for speed and comfort. Made from quick-dry, moisture-wicking polyester with a 4-way stretch fabric that moves with your body. Features a built-in mesh liner, adjustable drawstring waist, reflective logo for low-light visibility, and a secure back zip pocket for essentials. Lightweight at just 85g.`, price: rand(599,1499), category:"Men", subCategory:"Sportswear", collection:"Men", brand:"CartNOW Active", images:[pick(imgs.men),pick(imgs.men)], sizes:["S","M","L","XL","XXL"], stock:rand(25,100), tags:["shorts","running","sportswear","men"], specifications:[{key:"Fabric",value:"100% Polyester"},{key:"Weight",value:"85g"},{key:"Feature",value:"Quick-Dry & Moisture-Wicking"}] }));
extraMenJeans.forEach((n) => add({ name: n, description: `Premium quality ${n} designed for the modern man. Crafted from superior quality denim fabric with just the right amount of stretch for all-day comfort. The carefully engineered fit hugs your curves in the right places without restricting movement. Multiple pocket configuration and durable hardware ensure longevity. Fade-resistant dye maintains rich colour through repeated washing. A versatile staple that pairs with everything from a plain tee to a smart blazer.`, price: rand(1299,3999), category:"Men", subCategory:"Jeans", collection:"Men", brand:"CartNOW Denim Co.", images:[pick(imgs.men),pick(imgs.men)], sizes:["28","30","32","34","36","38"], stock:rand(15,70), tags:["jeans","denim","men","casual"], specifications:[{key:"Fabric",value:"98% Cotton 2% Elastane"},{key:"Style",value:n},{key:"Pockets",value:"5-Pocket"}] }));

// WOMEN
maxiThemes.forEach((c) => add({ name: `Women's Floral Maxi Dress ${c}`, description: `Designed for the woman who commands attention, this floral maxi dress in ${c} flows gracefully with every step. The v-neckline flatters all body types, while the adjustable waist tie cinches to define your silhouette. Crafted from lightweight georgette fabric with a fully lined interior. Features include a side slit for ease of movement and delicate flutter sleeves. Perfect for garden parties, beach holidays, or special occasions.`, price: rand(1299,3999), category:"Women", subCategory:"Dresses", collection:"Women", brand:"CartNOW Bloom", images:[pick(imgs.women),pick(imgs.women)], sizes:["XS","S","M","L","XL"], stock:rand(15,70), tags:["dress","floral","maxi","women"], specifications:[{key:"Fabric",value:"Georgette"},{key:"Lining",value:"Fully Lined"},{key:"Neckline",value:"V-Neck"}] }));
yogaColors.forEach((c) => add({ name: `Women's High-Waist Yoga Pants ${c}`, description: `Our best-selling high-waist yoga pants in ${c} feature buttery-soft, four-way stretch fabric that sculpts and supports through every pose. The 7/8 length hits right above the ankle for a universally flattering look. A hidden waistband pocket keeps your essentials secure. Squat-proof and breathable — tested through 200+ washes without losing shape. Ideal for yoga, pilates, barre, or everyday athleisure.`, price: rand(899,2499), category:"Women", subCategory:"Activewear", collection:"Women", brand:"CartNOW Flex", images:[pick(imgs.women),pick(imgs.women)], sizes:["XS","S","M","L","XL","XXL"], stock:rand(30,120), tags:["yoga","pants","activewear","women"], specifications:[{key:"Fabric",value:"Nylon-Spandex Blend"},{key:"Waist",value:"High-Rise"},{key:"Length",value:"7/8 Ankle"}] }));
blazerColors.forEach((c) => add({ name: `Women's Blazer ${c}`, description: `Power dressing reimagined in ${c} — this women's blazer cuts a confident, modern silhouette without sacrificing comfort. The structured shoulders and nipped waist create an hourglass shape, while the single-button closure offers versatile styling. Fully lined in silk-touch fabric for a luxurious feel. Pair with tailored trousers for boardroom meetings or style open over a slip dress for effortless evening elegance.`, price: rand(2499,6999), category:"Women", subCategory:"Blazers", collection:"Women", brand:"CartNOW Executive", images:[pick(imgs.women),pick(imgs.women)], sizes:["XS","S","M","L","XL"], stock:rand(10,40), tags:["blazer","formal","women","office"], specifications:[{key:"Fabric",value:"Polyester-Viscose Blend"},{key:"Lining",value:"Silk-Touch"},{key:"Closure",value:"Single Button"}] }));
kurtiPrints.forEach((c) => add({ name: `Women's Casual Kurti ${c}`, description: `A celebration of Indian craftsmanship — this ${c} kurti blends traditional artistry with contemporary silhouettes. Hand-block printed by artisans using natural, skin-friendly dyes. The A-line cut flatters all body types, while the side slits offer ease of movement. Features round neck with delicate hand embroidery, three-quarter sleeves, and a comfortable straight hem. Pairs beautifully with leggings, palazzos, or denim.`, price: rand(599,1799), category:"Women", subCategory:"Ethnic Wear", collection:"Women", brand:"CartNOW Ethnic", images:[pick(imgs.women),pick(imgs.women)], sizes:["XS","S","M","L","XL","XXL"], stock:rand(20,80), tags:["kurti","ethnic","cotton","women"], specifications:[{key:"Fabric",value:"Pure Cotton"},{key:"Print",value:"Hand Block Print"},{key:"Dye",value:"Natural Dyes"}] }));
extraWomenTops.forEach((n) => add({ name: n, description: `A wardrobe essential — the ${n} is crafted from premium quality fabric that drapes beautifully and feels incredibly soft against the skin. The thoughtfully designed silhouette flatters a variety of body types, while the versatile design takes you effortlessly from day to night. Pair with high-waist trousers for a polished look or with denim shorts for a casual weekend vibe. Easy to care for — machine washable and colour-fast through repeated washes.`, price: rand(499,1999), category:"Women", subCategory:"Tops", collection:"Women", brand:"CartNOW Bloom", images:[pick(imgs.women),pick(imgs.women)], sizes:["XS","S","M","L","XL"], stock:rand(20,90), tags:["top","women","casual","fashion"], specifications:[{key:"Fabric",value:"Viscose Blend"},{key:"Style",value:n},{key:"Wash",value:"Machine Washable"}] }));

// KIDS
kidsTeePrints.forEach((n) => add({ name: `Kids Graphic Tee ${n}`, description: `Kids will love wearing this super-soft graphic tee featuring the ${n} print — vibrant, fade-resistant designs that spark imagination. Made from 100% combed ring-spun cotton for a baby-soft feel against sensitive skin. The pre-shrunk fabric ensures the perfect fit wash after wash. Reinforced shoulder seams prevent tearing during active play. Available in sizes 2Y to 12Y.`, price: rand(299,799), category:"Kids", subCategory:"T-Shirts", collection:"Kids", brand:"CartNOW Kids", images:[pick(imgs.kids),pick(imgs.kids)], sizes:["2Y","4Y","6Y","8Y","10Y","12Y"], stock:rand(30,100), tags:["kids","t-shirt","graphic","cotton"], specifications:[{key:"Fabric",value:"100% Combed Cotton"},{key:"Print",value:"Fade-Resistant"},{key:"Age Group",value:"2-12 Years"}] }));
kidsDeniWashes.forEach((c) => add({ name: `Kids Denim Dungaree ${c}`, description: `Adorable and durable — our ${c} kids' denim dungarees are built for adventure. Made from soft-stretch denim that allows unrestricted movement during play. Adjustable shoulder straps grow with your child, and double-reinforced knee patches add extra durability. The elastic waist insert at the back ensures comfortable all-day wear. Machine washable and gets softer with every wash.`, price: rand(499,1299), category:"Kids", subCategory:"Jeans", collection:"Kids", brand:"CartNOW Kids", images:[pick(imgs.kids),pick(imgs.kids)], sizes:["2Y","4Y","6Y","8Y","10Y","12Y"], stock:rand(20,70), tags:["dungaree","denim","kids","casual"], specifications:[{key:"Fabric",value:"Stretch Denim"},{key:"Feature",value:"Reinforced Knees"},{key:"Strap",value:"Adjustable"}] }));
extraKidsShoes.forEach((n) => add({ name: `Kids ${n}`, description: `Designed specifically for growing feet, these ${n} offer the perfect combination of comfort, support, and style. The anatomically designed insole provides arch support essential during developmental years. Durable outsole with slip-resistant tread ensures safety on various surfaces. Easy-on design reduces morning rush stress. Breathable upper keeps feet cool and odour-free throughout the school day and beyond. Tested and certified safe — free from harmful chemicals.`, price: rand(399,1299), category:"Kids", subCategory:"Footwear", collection:"Kids", brand:"CartNOW Kids", images:[pick(imgs.kids),pick(imgs.kids)], sizes:["UK 1","UK 2","UK 3","UK 4","UK 5","UK 6"], stock:rand(20,80), tags:["kids","shoes","footwear","school"], specifications:[{key:"Upper",value:"Breathable Mesh"},{key:"Sole",value:"Slip-Resistant Rubber"},{key:"Closure",value:"Velcro/Lace"}] }));

// ELECTRONICS
audioProducts.forEach((n,i) => add({ name: n, description: `Experience audio like never before with the ${n}. Industry-leading Active Noise Cancellation blocks up to 35dB of ambient noise. The 40mm custom acoustic driver delivers deep bass with crystal-clear highs and rich mids. Up to 30 hours battery life with 10-minute quick-charge. Multi-point Bluetooth 5.3 connects two devices simultaneously. Foldable design with memory foam ear cushions for extended comfort. Built-in voice assistant support for hands-free control.`, price: rand(1999,14999), category:"Electronics", subCategory:"Headphones", collection:"", brand:audioBrands[i], images:[pick(imgs.electronics),pick(imgs.electronics)], sizes:[], stock:rand(10,60), tags:["headphones","audio","electronics","wireless"], specifications:[{key:"Driver",value:"40mm Dynamic"},{key:"Battery",value:"30 Hours"},{key:"Connectivity",value:"Bluetooth 5.3"},{key:"ANC",value:"Up to 35dB"}] }));
kbdProducts.forEach((n,i) => add({ name: n, description: `The ${n} is designed for performance enthusiasts and productivity warriors. Features premium PBT double-shot keycaps that resist shine and fade. The aluminium top case provides a solid, premium typing feel, while the silicone dampening layer reduces noise. Hot-swappable switch sockets let you customise the typing feel without soldering. N-Key rollover ensures every keypress registers accurately. USB-C connectivity with braided cable included.`, price: rand(1499,9999), category:"Electronics", subCategory:"Keyboards", collection:"", brand:kbdBrands[i], images:[pick(imgs.electronics),pick(imgs.electronics)], sizes:[], stock:rand(8,40), tags:["keyboard","gaming","mechanical","electronics"], specifications:[{key:"Switch",value:"Mechanical"},{key:"Keycaps",value:"PBT Double-Shot"},{key:"Connectivity",value:"USB-C + Wireless"},{key:"Backlight",value:"RGB"}] }));
webcamProducts.forEach((n,i) => add({ name: n, description: `Elevate your video calls and live streams with the ${n}. Featuring stunning 4K Ultra HD resolution or smooth 1080p at 60fps, the Sony STARVIS sensor excels in low-light conditions. Built-in dual microphone array with noise cancellation ensures crisp audio. Universal clip mounts on monitors, laptops, and tripods. Plug-and-play USB compatibility — no drivers needed. Auto-framing AI keeps you centred.`, price: rand(1999,12999), category:"Electronics", subCategory:"Webcams", collection:"", brand:webcamBrands[i], images:[pick(imgs.electronics),pick(imgs.electronics)], sizes:[], stock:rand(5,30), tags:["webcam","camera","streaming","electronics"], specifications:[{key:"Resolution",value:"4K 30fps / 1080p 60fps"},{key:"Sensor",value:"Sony STARVIS"},{key:"Microphone",value:"Dual Array ANC"},{key:"Connectivity",value:"USB-C"}] }));
monitorSizes.forEach((s,i) => add({ name: `${s}-inch ${monitorTypes[i]}`, description: `Immerse yourself in stunning visuals with this ${s}-inch ${monitorTypes[i]}. The IPS panel delivers 99% sRGB colour coverage with factory-calibrated Delta E<2 colour accuracy. The 165Hz refresh rate and 1ms response time eliminate motion blur in fast-paced gaming. AMD FreeSync Premium and NVIDIA G-Sync Compatible technology ensure smooth, tear-free gameplay. Built-in KVM switch and USB hub make this the ultimate workstation centrepiece.`, price: rand(8999,59999), category:"Electronics", subCategory:"Monitors", collection:"", brand:monitorBrands[i], images:[pick(imgs.electronics),pick(imgs.electronics)], sizes:[], stock:rand(3,20), tags:["monitor","display","gaming","electronics"], specifications:[{key:"Panel",value:"IPS"},{key:"Refresh Rate",value:"165Hz"},{key:"Response Time",value:"1ms"},{key:"Colour",value:"99% sRGB"}] }));
bulbColors.forEach((c,i) => add({ name: `Smart LED Bulb WiFi ${c}`, description: `Transform your home lighting with this ${c} smart LED bulb that connects directly to your home Wi-Fi — no hub required. Control brightness, colour temperature (2700K-6500K), and 16 million RGB colours through the app. Works with Amazon Alexa, Google Assistant, and Apple HomeKit. 9W replaces a 60W bulb, consuming 85% less energy. Schedule routines, set timers, and sync lights with music. Rated for 25,000 hours.`, price: rand(499,1999), category:"Electronics", subCategory:"Smart Home", collection:"", brand:bulbBrands[i], images:[pick(imgs.electronics),pick(imgs.electronics)], sizes:[], stock:rand(20,100), tags:["smart bulb","LED","smart home","wifi"], specifications:[{key:"Wattage",value:"9W (60W equivalent)"},{key:"Connectivity",value:"2.4GHz Wi-Fi"},{key:"Lifespan",value:"25,000 Hours"},{key:"Colour Temp",value:"2700K-6500K"}] }));
extraElecCables.forEach((n) => add({ name: n, description: `Professional-grade ${n} built to deliver fast, reliable connectivity every time. The braided nylon outer sleeve provides superior tangle resistance and withstands over 25,000 bend cycles without degradation. Gold-plated connectors ensure optimal signal transmission and corrosion resistance. Full-featured — supports data transfer, charging, and (where applicable) video output at maximum rated speeds. Backed by a 2-year manufacturer warranty.`, price: rand(299,1999), category:"Electronics", subCategory:"Cables", collection:"", brand:"CartNOW Tech", images:[pick(imgs.electronics),pick(imgs.electronics)], sizes:[], stock:rand(30,120), tags:["cable","electronics","accessories","connectivity"], specifications:[{key:"Material",value:"Braided Nylon"},{key:"Connector",value:"Gold-Plated"},{key:"Bend Cycles",value:"25,000+"},{key:"Warranty",value:"2 Years"}] }));

// BEAUTY
serumNames.forEach((n,i) => add({ name: `${n} 30ml`, description: `Formulated with 2% pharmaceutical-grade ${serumIngreds[i]}, this advanced serum penetrates deep into the dermis to deliver transformative results. Dermatologist-tested and hypoallergenic, suitable for all skin types including sensitive skin. The lightweight, non-greasy texture absorbs instantly without leaving residue. Free from parabens, sulphates, artificial fragrances, and mineral oils. Clinical trials show 89% of users reported visible improvement in skin texture within 4 weeks. Cruelty-free and vegan certified.`, price: rand(499,2999), category:"Beauty", subCategory:"Skincare", collection:"", brand:serumBrands[i], images:[pick(imgs.beauty),pick(imgs.beauty)], sizes:[], stock:rand(20,80), tags:["serum","skincare","beauty","face"], specifications:[{key:"Volume",value:"30ml"},{key:"Skin Type",value:"All Skin Types"},{key:"Key Ingredient",value:serumIngreds[i]}] }));
lipFinish.forEach((f,i) => add({ name: `${f} Lipstick ${lipShades[i]}`, description: `A legendary lip colour formulation in ${f} finish that delivers 12-hour wear without fading, feathering, or flaking. The creamy, pigment-rich formula glides on smoothly in a single stroke for full, opaque coverage. Infused with vitamin E and shea butter to keep lips moisturised throughout the day. Transfer-resistant formula survives meals, drinks, and kisses. Dermatologist-tested. Paraben-free. Shade: ${lipShades[i]}.`, price: rand(299,1499), category:"Beauty", subCategory:"Makeup", collection:"", brand:lipBrands[i], images:[pick(imgs.beauty),pick(imgs.beauty)], sizes:[], stock:rand(30,100), tags:["lipstick","makeup","beauty","lip color"], specifications:[{key:"Finish",value:f},{key:"Wear",value:"12-Hour"},{key:"Formula",value:"Paraben-Free"}] }));
perfumeScents.forEach((s,i) => add({ name: `${s} Perfume EDP 50ml`, description: `An olfactory journey crafted by master perfumers — this ${s} Eau de Parfum opens with vibrant top notes, evolves into a sensual heart, and settles into a warm, lasting base. Lingers on the skin for 8-10 hours. The signature crystal glass bottle with magnetic cap closure is a work of art. A concentration of 20% fragrance oil ensures a rich, long-lasting sillage. Free from phthalates and alcohol-based fillers.`, price: rand(999,4999), category:"Beauty", subCategory:"Fragrance", collection:"", brand:perfumeBrands[i], images:[pick(imgs.beauty),pick(imgs.beauty)], sizes:[], stock:rand(10,50), tags:["perfume","fragrance","beauty","EDP"], specifications:[{key:"Volume",value:"50ml"},{key:"Concentration",value:"EDP (20%)"},{key:"Longevity",value:"8-10 Hours"}] }));
extraBeautyHair.forEach((n) => add({ name: n, description: `Transform your hair care routine with the ${n} — a professional-grade formula developed with leading trichologists. The potent blend of active ingredients penetrates the hair cortex to repair damage from heat, colour, and environmental stress. Proven to reduce breakage by 94% and improve shine by 87% after just 3 uses. Free from sulphates, parabens, silicones, and artificial colourants. Suitable for all hair types including colour-treated and chemically processed hair. Cruelty-free and vegan certified.`, price: rand(299,1499), category:"Beauty", subCategory:"Hair Care", collection:"", brand:"CartNOW Beauty", images:[pick(imgs.beauty),pick(imgs.beauty)], sizes:[], stock:rand(25,90), tags:["hair","beauty","care","salon"], specifications:[{key:"Type",value:n},{key:"Suitable For",value:"All Hair Types"},{key:"Free From",value:"Sulphates, Parabens, Silicones"}] }));

// HOME
decStyles.forEach((s,i) => add({ name: `${s} ${decProducts[i]}`, description: `Transform your living space with this ${s}-styled ${decProducts[i]} — a piece that blends timeless design with premium materials. Constructed from sustainably sourced materials including organic cotton, recycled fibres, and natural dyes that won't harm the environment or your health. The carefully considered proportions work harmoniously in both large and compact spaces. Easy to maintain — most pieces are spot-clean or machine-washable. Each item is quality-inspected before shipping and arrives gift-boxed.`, price: rand(399,3999), category:"Home", subCategory:"Decor", collection:"", brand:decBrands[i], images:[pick(imgs.home),pick(imgs.home)], sizes:[], stock:rand(15,60), tags:["home decor","interior","lifestyle","home"], specifications:[{key:"Material",value:"Organic Cotton"},{key:"Style",value:s},{key:"Care",value:"Machine Washable"}] }));
cwMaterials.forEach((m,i) => add({ name: `${m} ${cwProducts[i]}`, description: `Professional-grade ${m} ${cwProducts[i]} engineered for the discerning home cook. The multi-layer construction ensures even heat distribution from base to rim, eliminating hot spots for perfectly cooked results every time. The PFOA-free non-stick coating releases food effortlessly and cleans up with minimal effort. Ergonomic, stay-cool handle. Oven-safe up to 220°C and compatible with all hob types including induction. Comes with a lifetime manufacturer guarantee.`, price: rand(799,6999), category:"Home", subCategory:"Kitchen", collection:"", brand:cwBrands[i], images:[pick(imgs.home),pick(imgs.home)], sizes:[], stock:rand(10,50), tags:["cookware","kitchen","cooking","home"], specifications:[{key:"Material",value:m},{key:"Oven Safe",value:"Up to 220°C"},{key:"Induction",value:"Compatible"}] }));
bedThreads.forEach((t,i) => add({ name: `${t} Bed Sheet Set ${bedSizes[i]}`, description: `Sleep in cloud-like luxury with our ${t} Bed Sheet Set in ${bedSizes[i]}. Woven from long-staple fibres on a sateen loom to create an impossibly smooth, silky surface. The fitted sheet features an 18-inch deep pocket with all-around elastic. Colour-fast dyes maintain vibrancy through 200+ washes. Hypoallergenic and breathable — regulates temperature year-round. OEKO-TEX certified. Set includes 1 flat sheet, 1 fitted sheet, and 2 pillowcases.`, price: rand(1299,5999), category:"Home", subCategory:"Bedding", collection:"", brand:bedBrands[i], images:[pick(imgs.home),pick(imgs.home)], sizes:[bedSizes[i]], stock:rand(10,40), tags:["bed sheet","bedding","home","sleep"], specifications:[{key:"Thread Count",value:String([1000,800,600,600,400,400][i])},{key:"Material",value:bedMaterials[i]},{key:"Set Contents",value:"1 Flat + 1 Fitted + 2 Pillowcases"}] }));
extraHomeLight.forEach((n) => add({ name: n, description: `Illuminate your home beautifully with the ${n}. Designed to blend seamlessly into any interior aesthetic while providing superior light quality. Energy-efficient LED technology delivers warm, flicker-free light that's gentle on the eyes. The versatile design suits living rooms, bedrooms, patios, and gardens. Simple installation — no special tools required. All electrical components are UL-listed and certified for safety. A stylish upgrade that enhances the ambiance of any space instantly.`, price: rand(299,2999), category:"Home", subCategory:"Lighting", collection:"", brand:"CartNOW Home", images:[pick(imgs.home),pick(imgs.home)], sizes:[], stock:rand(15,70), tags:["lighting","home","LED","decor"], specifications:[{key:"Type",value:n},{key:"Energy",value:"LED"},{key:"Installation",value:"Easy, No Tools"}] }));

// SPORTS
sportsProducts.forEach((n,i) => add({ name: `${sportsLevels[i]} ${n}`, description: `Engineered for peak performance — this ${sportsLevels[i]} level ${n} is constructed from high-modulus graphite that delivers exceptional power without arm fatigue. The isometric head shape increases the sweet spot by 32%. Premium synthetic gut string pre-installed at optimal tension. The diamond-cut handle grip absorbs sweat and shock. Professional-level feel at an accessible price point. Endorsed by national coaches.`, price: rand(499,7999), category:"Sports", subCategory:"Equipment", collection:"", brand:sportsBrands[i], images:[pick(imgs.sports),pick(imgs.sports)], sizes:[], stock:rand(15,60), tags:["sports","equipment","outdoor","fitness"], specifications:[{key:"Material",value:"High-Modulus Graphite"},{key:"Weight",value:"85g"},{key:"Level",value:sportsLevels[i]}] }));
shoeStyles.forEach((s,i) => add({ name: `${s} Shoes ${shoeGenders[i]} ${shoeColors[i]}`, description: `Biomechanically engineered ${s} shoes developed with sports science researchers to maximise performance. The responsive foam midsole returns 75% of energy with every footfall. Engineered mesh upper provides targeted ventilation while maintaining structural integrity. A reinforced heel counter locks the foot in place during lateral movements. Durable rubber outsole with multidirectional traction pattern grips all surfaces. Reflective accents for low-light visibility.`, price: rand(1299,8999), category:"Sports", subCategory:"Footwear", collection:"", brand:shoeBrands[i], images:[pick(imgs.sports),pick(imgs.sports)], sizes:["UK 6","UK 7","UK 8","UK 9","UK 10","UK 11","UK 12"], stock:rand(10,50), tags:["shoes","sports","footwear","running"], specifications:[{key:"Upper",value:"Engineered Mesh"},{key:"Midsole",value:"Responsive Foam"},{key:"Outsole",value:"Rubber"},{key:"Energy Return",value:"75%"}] }));
extraSportsYoga.forEach((n) => add({ name: n, description: `Take your fitness to the next level with the ${n}. Engineered using sports science principles to optimise performance, recovery, and results. The professional-grade construction ensures durability through thousands of training sessions. Ergonomically designed to reduce injury risk and improve technique. Whether you're a beginner or a competitive athlete, this equipment will help you achieve your fitness goals faster. Comes with a storage bag and comprehensive user guide.`, price: rand(399,2499), category:"Sports", subCategory:"Fitness Equipment", collection:"", brand:"CartNOW Active", images:[pick(imgs.sports),pick(imgs.sports)], sizes:[], stock:rand(20,80), tags:["fitness","yoga","training","sports"], specifications:[{key:"Type",value:n},{key:"Level",value:"All Levels"},{key:"Includes",value:"Storage Bag & Guide"}] }));

// BOOKS
bookTitles.forEach((n,i) => add({ name: n, description: bookDescs[i], price: rand(199,699), category:"Books", subCategory:bookSubCats[i], collection:"", brand:"CartNOW Books", images:[pick(imgs.books),pick(imgs.books)], sizes:[], stock:rand(20,100), tags:["book","bestseller","reading","knowledge"], specifications:[{key:"Language",value:"English"},{key:"Format",value:"Paperback"},{key:"Pages",value:String(rand(200,500))}] }));
extraBooksStory.forEach((n) => add({ name: n, description: `A gripping, beautifully written novel that has captivated millions of readers worldwide. "${n}" takes you on an emotional journey filled with compelling characters, unexpected plot twists, and profound themes that will stay with you long after the final page. This book has spent weeks on major bestseller lists and received universal critical acclaim. Perfect for book clubs, long journeys, or a cosy weekend read. Includes an exclusive author's note and reading group guide.`, price: rand(199,599), category:"Books", subCategory:"Fiction", collection:"", brand:"CartNOW Books", images:[pick(imgs.books),pick(imgs.books)], sizes:[], stock:rand(15,90), tags:["book","fiction","bestseller","novel"], specifications:[{key:"Language",value:"English"},{key:"Format",value:"Paperback"},{key:"Genre",value:"Fiction"}] }));

// FOOD
chocoFlavors.forEach((f,i) => add({ name: `${f} Artisan Bar 70g`, description: `Handcrafted in small batches by master chocolatiers using ethically sourced cacao beans from single-origin estates. The bean-to-bar process preserves complex flavour profiles unique to each origin — expect rich, layered notes in ${f} that evolve on the palate. Free from artificial additives, emulsifiers, and palm oil. Vegan-certified and sustainably packaged in compostable wrappers. Pairs beautifully with a fine single malt or specialty coffee.`, price: rand(149,599), category:"Food", subCategory:"Snacks", collection:"", brand:chocoBrands[i], images:[pick(imgs.food),pick(imgs.food)], sizes:[], stock:rand(30,150), tags:["chocolate","snacks","artisan","food"], specifications:[{key:"Weight",value:"70g"},{key:"Cocoa",value:`${rand(55,90)}%`},{key:"Origin",value:"Single-Origin"},{key:"Certifications",value:"Vegan, Sustainable"}] }));
saltTypes.forEach((s,i) => add({ name: `${s} Salt 200g`, description: `Mined from pristine ancient deposits — this ${s} gourmet salt is a revelation for home cooks and professional chefs alike. Contains 84+ naturally occurring trace minerals including calcium, magnesium, and potassium. The coarse crystals dissolve evenly, providing clean, balanced salinity without bitterness. Use as a finishing salt for steaks, salads, chocolates, and cocktails. Presented in a reusable glass jar with a bamboo lid. Origin: ${saltOrigins[i]}.`, price: rand(199,799), category:"Food", subCategory:"Gourmet", collection:"", brand:saltBrands[i], images:[pick(imgs.food),pick(imgs.food)], sizes:[], stock:rand(40,120), tags:["salt","gourmet","cooking","food"], specifications:[{key:"Weight",value:"200g"},{key:"Origin",value:saltOrigins[i]},{key:"Minerals",value:"84+ Trace Minerals"}] }));
extraFoodTea.forEach((n) => add({ name: n, description: `Sourced from the finest estates and hand-picked at peak freshness, ${n} offers a truly exceptional cup. The careful processing method preserves delicate volatile aromatic compounds that are destroyed by machine harvesting. Each sip reveals a complex, multi-layered flavour profile — vibrant and refreshing. Rich in antioxidants, polyphenols, and natural compounds that support overall wellness. Presented in a resealable, biodegradable foil pouch to preserve freshness. No artificial flavours, colours, or preservatives.`, price: rand(199,899), category:"Food", subCategory:"Beverages", collection:"", brand:"CartNOW Organics", images:[pick(imgs.food),pick(imgs.food)], sizes:[], stock:rand(30,100), tags:["tea","beverage","organic","food"], specifications:[{key:"Weight",value:"100g"},{key:"Origin",value:"Premium Estate"},{key:"Free From",value:"Artificial Flavours, Preservatives"}] }));

// ACCESSORIES
glassStyles.forEach((s,i) => add({ name: `${s} Sunglasses ${glassLens[i]}`, description: `Engineered for style and function — these ${s} sunglasses feature CR-39 optical-grade ${glassLens[i]} lenses that eliminate 99.9% of glare from reflective surfaces. UV400 protection blocks 100% of UVA and UVB rays. The ultra-lightweight frame at just 18g sits comfortably for all-day wear. Spring hinges accommodate a wide range of face sizes. Each pair comes with a hard-shell case, microfibre cloth, and adjustable nose pads.`, price: rand(499,3999), category:"Accessories", subCategory:"Eyewear", collection:"", brand:glassBrands[i], images:[pick(imgs.accessories),pick(imgs.accessories)], sizes:[], stock:rand(15,60), tags:["sunglasses","eyewear","accessories","UV protection"], specifications:[{key:"Lens",value:"CR-39 Optical Grade"},{key:"UV Protection",value:"UV400"},{key:"Weight",value:"18g"},{key:"Feature",value:glassLens[i]}] }));
bagMaterials.forEach((m,i) => add({ name: `${m} ${bagTypes[i]} ${bagColors[i]}`, description: `Thoughtfully designed for the modern lifestyle — this ${m} ${bagTypes[i]} in ${bagColors[i]} seamlessly combines form and function. Crafted from full-grain, top-layer material that develops a beautiful patina over time. Interior features include a laptop sleeve (fits 15-inch), multiple card slots, a key hook, and a secure zipper compartment. Adjustable padded shoulder strap distributes weight evenly. All hardware is solid brass, resistant to tarnishing and corrosion.`, price: rand(999,8999), category:"Accessories", subCategory:"Bags", collection:"", brand:bagBrands[i], images:[pick(imgs.accessories),pick(imgs.accessories)], sizes:[], stock:rand(8,35), tags:["bag","leather","accessories","fashion"], specifications:[{key:"Material",value:m},{key:"Laptop Slot",value:"Fits up to 15-inch"},{key:"Hardware",value:"Solid Brass"}] }));
watchStyles.forEach((s,i) => add({ name: `${s} Watch ${watchGenders[i]}`, description: `A masterpiece of horological engineering — this ${s} timepiece houses a Swiss-made movement with 25 jewels and a 42-hour power reserve. The sapphire crystal glass resists scratches at 9 on the Mohs scale. Water-resistant to 100 metres. The solid 316L stainless steel case and bracelet are finished with alternating brushed and polished surfaces. Luminous hands ensure legibility in all lighting conditions. Comes with a 2-year manufacturer warranty.`, price: rand(2999,29999), category:"Accessories", subCategory:"Watches", collection:"", brand:watchBrands[i], images:[pick(imgs.accessories),pick(imgs.accessories)], sizes:[], stock:rand(5,25), tags:["watch","accessories","timepiece","fashion"], specifications:[{key:"Movement",value:"Swiss Automatic (25 Jewels)"},{key:"Water Resistance",value:"100m"},{key:"Crystal",value:"Sapphire"},{key:"Power Reserve",value:"42 Hours"}] }));
extraAccJewel.forEach((n) => add({ name: n, description: `Exquisitely crafted by master jewellers, the ${n} is a timeless piece that elevates any look. Made from premium materials using traditional techniques passed down through generations. The precise finishing and attention to detail are evident in every facet. Hypoallergenic — safe for sensitive skin. Comes beautifully packaged in a signature gift box, making it an ideal present for birthdays, anniversaries, or special occasions. Each piece is quality-inspected and hallmarked.`, price: rand(499,4999), category:"Accessories", subCategory:"Jewellery", collection:"", brand:"CartNOW Jewels", images:[pick(imgs.accessories),pick(imgs.accessories)], sizes:[], stock:rand(10,50), tags:["jewellery","accessories","fashion","gift"], specifications:[{key:"Material",value:"Sterling Silver / Gold Plated"},{key:"Hypoallergenic",value:"Yes"},{key:"Packaging",value:"Gift Box Included"}] }));

console.log(`📦 Total products prepared: ${products.length}`);

// ── Connect and seed ──
async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: "cartNow" });
    console.log("✅ MongoDB connected");

    const existing = await Product.countDocuments();
    console.log(`📦 Existing products in DB: ${existing}`);

    console.log(`🚀 Inserting ${products.length} products...`);
    const result = await Product.insertMany(products, { ordered: false });
    console.log(`✅ Successfully inserted ${result.length} products!`);
  } catch (err) {
    if (err.writeErrors) {
      console.log(`⚠️  Partial insert — ${err.result?.nInserted || "?"} documents inserted, ${err.writeErrors.length} errors`);
    } else {
      console.error("❌ Seed error:", err.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  }
}

seed();
