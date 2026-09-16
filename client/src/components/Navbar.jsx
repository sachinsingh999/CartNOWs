import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Search,
  MapPin,
  Navigation,
  Sparkles,
  Sun,
  Moon,
  Heart,
  X,
  ChevronDown,
  ChevronRight,
  Home,
  Tag,
  HelpCircle,
  TrendingUp,
  RotateCcw,
  Globe,
  Bell,
  CheckCheck,
  PackageCheck,
  KeyRound,
  Truck,
  Store,
  ExternalLink,
  Check,
  Copy,
  Mic,
  LayoutGrid,
  Menu,
} from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";
import { cachedGet } from "../utils/apiCache";
import { useLanguage } from "../context/LanguageContext";
import { toast } from "react-toastify";
import Logo from "./Logo";
import { matchesFuzzySearch, rankProductsBySearchRelevance, normalizeAndCorrectQuery } from "../utils/fuzzySearch";

/* ─────────────── Framer Motion Animation Variants ─────────────── */
const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.97,
    transformOrigin: "top",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 28,
      staggerChildren: 0.03,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.97,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
};

const listItemVariants = {
  hidden: { opacity: 0, y: 6, x: -2 },
  visible: {
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 360,
      damping: 26,
    },
  },
};

/* ─────────────── Mobile Bottom Nav items ─────────────── */
const BOTTOM_NAV = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Categories", icon: LayoutGrid, to: "/categories" },
  { label: "Wishlist", icon: Heart, to: "/wishlist" },
  { label: "Orders", icon: Package, to: "/orderdetail" },
  { label: "Account", icon: User, to: null, isProfile: true },
];

/* ─────────────── Default Categories List ─────────────── */
const DEFAULT_CATEGORIES = [
  { label: "Electronics", to: "/product?category=electronics", emoji: "🔌" },
  { label: "Fashion", to: "/product?category=fashion", emoji: "👗" },
  { label: "Home & Living", to: "/product?category=home", emoji: "🏠" },
  { label: "Beauty & Care", to: "/product?category=beauty", emoji: "💄" },
  { label: "Groceries", to: "/product?category=groceries", emoji: "🛒" },
  { label: "Sports & Fitness", to: "/product?category=sports", emoji: "⚽" },
];

/* ─────────────── Multi-Column Mega Menu Taxonomy ─────────────── */
const MEGA_MENU_DATA = {
  men: {
    label: "Men",
    tag: "Men's Fashion & Wardrobe",
    columns: [
      {
        sections: [
          {
            title: "Topwear",
            links: [
              { name: "T-Shirts", query: "t-shirt" },
              { name: "Casual Shirts", query: "casual shirt" },
              { name: "Formal Shirts", query: "formal shirt" },
              { name: "Sweatshirts", query: "sweatshirt" },
              { name: "Sweaters", query: "sweater" },
              { name: "Jackets", query: "jacket" },
              { name: "Blazers & Coats", query: "blazer" },
              { name: "Suits", query: "suit" },
              { name: "Rain Jackets", query: "rain jacket" }
            ]
          },
          {
            title: "Indian & Festive Wear",
            links: [
              { name: "Kurtas & Kurta Sets", query: "kurta" },
              { name: "Sherwanis", query: "sherwani" },
              { name: "Nehru Jackets", query: "nehru jacket" },
              { name: "Dhotis", query: "dhoti" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Bottomwear",
            links: [
              { name: "Jeans", query: "jeans" },
              { name: "Casual Trousers", query: "casual trousers" },
              { name: "Formal Trousers", query: "formal trousers" },
              { name: "Shorts", query: "shorts" },
              { name: "Track Pants & Joggers", query: "joggers" }
            ]
          },
          {
            title: "Innerwear & Sleepwear",
            links: [
              { name: "Briefs & Trunks", query: "briefs" },
              { name: "Boxers", query: "boxers" },
              { name: "Vests", query: "vest" },
              { name: "Sleepwear & Loungewear", query: "sleepwear" },
              { name: "Thermals", query: "thermals" }
            ]
          },
          {
            title: "Plus Size",
            links: [
              { name: "Plus Size Topwear", query: "plus size tops" },
              { name: "Plus Size Bottomwear", query: "plus size pants" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Footwear",
            links: [
              { name: "Casual Shoes", query: "casual shoes" },
              { name: "Sports Shoes", query: "sports shoes" },
              { name: "Formal Shoes", query: "formal shoes" },
              { name: "Sneakers", query: "sneakers" },
              { name: "Sandals & Floaters", query: "sandals" },
              { name: "Flip Flops", query: "flip flops" },
              { name: "Socks", query: "socks" }
            ]
          },
          {
            title: "Personal Care & Grooming",
            links: [
              { name: "Trimmers & Shavers", query: "trimmer" },
              { name: "Beard Care & Oils", query: "beard care" },
              { name: "Hair Styling", query: "hair wax" },
              { name: "Face Wash & Skincare", query: "face wash" }
            ]
          },
          {
            title: "Sunglasses & Frames",
            links: [
              { name: "Aviators", query: "aviators" },
              { name: "Wayfarers", query: "wayfarer sunglasses" },
              { name: "Polarized Frames", query: "polarized sunglasses" }
            ]
          },
          {
            title: "Watches",
            links: [
              { name: "Smartwatches", query: "smartwatch" },
              { name: "Chronograph", query: "chronograph watch" },
              { name: "Analog Luxe", query: "analog watch" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Sports & Active Wear",
            links: [
              { name: "Sports Shoes", query: "running shoes" },
              { name: "Sports Sandals", query: "sports sandals" },
              { name: "Active T-Shirts", query: "active t-shirt" },
              { name: "Track Pants & Shorts", query: "track pants" },
              { name: "Tracksuits", query: "tracksuit" },
              { name: "Jackets & Sweatshirts", query: "sports jacket" },
              { name: "Sports Accessories", query: "gym accessories" },
              { name: "Swimwear", query: "swimwear" }
            ]
          },
          {
            title: "Gadgets",
            links: [
              { name: "Smart Wearables", query: "smart wearables" },
              { name: "Fitness Gadgets", query: "fitness tracker" },
              { name: "Headphones", query: "headphones" },
              { name: "Speakers", query: "bluetooth speaker" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Fashion Accessories",
            links: [
              { name: "Wallets", query: "wallet" },
              { name: "Belts", query: "belt" },
              { name: "Perfumes & Body Mists", query: "perfume" },
              { name: "Trimmers", query: "trimmer" },
              { name: "Deodorants", query: "deodorant" },
              { name: "Ties, Cufflinks & Pocket", query: "ties cufflinks" },
              { name: "Accessory Gift Sets", query: "gift set" },
              { name: "Caps & Hats", query: "caps" },
              { name: "Mufflers, Scarves & Gloves", query: "muffler" },
              { name: "Phone Cases", query: "phone case" },
              { name: "Rings & Wristwear", query: "ring" },
              { name: "Helmets", query: "helmet" }
            ]
          },
          {
            title: "Bags & Backpacks",
            links: [
              { name: "Backpacks", query: "backpack" },
              { name: "Laptop Bags", query: "laptop bag" },
              { name: "Duffel Bags", query: "duffel bag" }
            ]
          },
          {
            title: "Luggages & Trolleys",
            links: [
              { name: "Hard Case Trolleys", query: "trolley bag" },
              { name: "Cabin Suitcases", query: "cabin suitcase" }
            ]
          }
        ]
      }
    ]
  },
  women: {
    label: "Women",
    tag: "Women's Fashion & Beauty",
    columns: [
      {
        sections: [
          {
            title: "Indian & Fusion Wear",
            links: [
              { name: "Kurtas & Suits", query: "women kurta" },
              { name: "Sarees & Blouses", query: "saree" },
              { name: "Ethnic Dresses", query: "ethnic dress" },
              { name: "Lehengas & Cholis", query: "lehenga" },
              { name: "Dupattas & Shawls", query: "dupatta" }
            ]
          },
          {
            title: "Western Wear",
            links: [
              { name: "Dresses & Jumpsuits", query: "women dress" },
              { name: "Tops & Tunics", query: "women top" },
              { name: "T-Shirts & Shirts", query: "women tshirt" },
              { name: "Sweaters & Cardigans", query: "women sweater" },
              { name: "Jackets & Shrugs", query: "women jacket" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Bottomwear",
            links: [
              { name: "Jeans & Jeggings", query: "women jeans" },
              { name: "Trousers & Chinos", query: "women trousers" },
              { name: "Palazzos & Culottes", query: "palazzo" },
              { name: "Skirts & Shorts", query: "women skirt" },
              { name: "Leggings & Tights", query: "leggings" }
            ]
          },
          {
            title: "Lingerie & Sleepwear",
            links: [
              { name: "Bras & Bralettes", query: "bra" },
              { name: "Briefs & Panties", query: "panties" },
              { name: "Nightwear & Robes", query: "nightwear" },
              { name: "Shapewear", query: "shapewear" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Footwear",
            links: [
              { name: "Flats & Bellies", query: "women flats" },
              { name: "Heels & Pumps", query: "heels" },
              { name: "Casual Sneakers", query: "women sneakers" },
              { name: "Sports Shoes", query: "women sports shoes" },
              { name: "Boots", query: "women boots" },
              { name: "Sandals & Wedges", query: "women sandals" }
            ]
          },
          {
            title: "Beauty & Makeup",
            links: [
              { name: "Lipsticks & Tints", query: "lipstick" },
              { name: "Eyeliner & Mascara", query: "mascara" },
              { name: "Foundation & Powders", query: "foundation" },
              { name: "Luxury Perfumes", query: "women perfume" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Skincare & Hair",
            links: [
              { name: "Face Serums & Glow", query: "serum" },
              { name: "Moisturizers & Sunscreen", query: "sunscreen" },
              { name: "Hair Styling & Care", query: "hair care" },
              { name: "Body Lotions & Scrubs", query: "body lotion" }
            ]
          },
          {
            title: "Jewelry & Watches",
            links: [
              { name: "Fashion Earrings", query: "earrings" },
              { name: "Necklaces & Pendants", query: "necklace" },
              { name: "Bracelets & Bangles", query: "bangles" },
              { name: "Designer Watches", query: "women watch" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Handbags & Clutches",
            links: [
              { name: "Tote Bags", query: "tote bag" },
              { name: "Sling & Crossbody", query: "sling bag" },
              { name: "Clutches & Wallets", query: "clutch" },
              { name: "Backpacks", query: "women backpack" }
            ]
          },
          {
            title: "Luggage & Travel",
            links: [
              { name: "Travel Duffels", query: "duffel bag" },
              { name: "Trolleys & Suitcases", query: "suitcase" }
            ]
          }
        ]
      }
    ]
  },
  electronics: {
    label: "Electronics",
    tag: "Gadgets & Smart Technology",
    columns: [
      {
        sections: [
          {
            title: "Mobiles & Tablets",
            links: [
              { name: "Flagship Smartphones", query: "smartphone" },
              { name: "5G Budget Phones", query: "5g mobile" },
              { name: "iPads & Tablets", query: "tablet" },
              { name: "E-Readers", query: "kindle" }
            ]
          },
          {
            title: "Mobile Accessories",
            links: [
              { name: "Cases & Covers", query: "phone case" },
              { name: "Screen Protectors", query: "screen protector" },
              { name: "Fast Chargers & Cables", query: "charger" },
              { name: "Power Banks", query: "power bank" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Laptops & Computing",
            links: [
              { name: "Gaming Laptops", query: "gaming laptop" },
              { name: "Thin Ultrabooks", query: "laptop" },
              { name: "Monitors & Displays", query: "monitor" },
              { name: "Keyboards & Mice", query: "keyboard" },
              { name: "External Storage & SSDs", query: "ssd" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Audio & Wearables",
            links: [
              { name: "True Wireless Earbuds", query: "earbuds" },
              { name: "Noise Cancelling Headphones", query: "headphones" },
              { name: "Bluetooth Speakers", query: "speaker" },
              { name: "Soundbars & Home Audio", query: "soundbar" },
              { name: "Smartwatches", query: "smartwatch" },
              { name: "Fitness Trackers", query: "fitness tracker" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Smart Home & TV",
            links: [
              { name: "4K Smart TVs", query: "smart tv" },
              { name: "Streaming Sticks", query: "streaming stick" },
              { name: "Smart Security Cameras", query: "security camera" },
              { name: "Smart Lighting & Bulbs", query: "smart light" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Cameras & Gaming",
            links: [
              { name: "Gaming Consoles & Gear", query: "gaming console" },
              { name: "Controllers & Joypads", query: "game controller" },
              { name: "DSLR & Action Cameras", query: "camera" },
              { name: "Tripods & Gimbals", query: "gimbal" }
            ]
          }
        ]
      }
    ]
  },
  home: {
    label: "Home & Living",
    tag: "Aesthetic Home & Kitchen",
    columns: [
      {
        sections: [
          {
            title: "Bed Linen & Furnishing",
            links: [
              { name: "Bedsheets & Pillow Covers", query: "bedsheet" },
              { name: "Blankets & Comforters", query: "blanket" },
              { name: "Curtains & Sheers", query: "curtains" },
              { name: "Rugs & Carpets", query: "carpet" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Kitchen & Dining",
            links: [
              { name: "Non-Stick Cookware", query: "cookware" },
              { name: "Dinner Sets & Cutlery", query: "dinner set" },
              { name: "Water Bottles & Flasks", query: "water bottle" },
              { name: "Storage Jars & Containers", query: "storage containers" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Home Appliances",
            links: [
              { name: "Air Fryers & Ovens", query: "air fryer" },
              { name: "Electric Kettles", query: "electric kettle" },
              { name: "Mixer Grinders & Blenders", query: "mixer grinder" },
              { name: "Vacuum Cleaners", query: "vacuum cleaner" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Decor & Lighting",
            links: [
              { name: "Table & Desk Lamps", query: "table lamp" },
              { name: "Wall Art & Paintings", query: "wall art" },
              { name: "Vases & Planters", query: "planter" },
              { name: "Aroma Diffusers", query: "diffuser" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Storage & Utility",
            links: [
              { name: "Shoe Racks", query: "shoe rack" },
              { name: "Wardrobe Organizers", query: "cloth organizer" },
              { name: "Bathroom Accessories", query: "bathroom accessories" },
              { name: "Laundry Baskets", query: "laundry basket" }
            ]
          }
        ]
      }
    ]
  },
  beauty: {
    label: "Beauty",
    tag: "Cosmetics, Skincare & Fragrances",
    columns: [
      {
        sections: [
          {
            title: "Makeup & Cosmetics",
            links: [
              { name: "Lipsticks & Lip Gloss", query: "lipstick" },
              { name: "Eyeliners & Kajal", query: "eyeliner" },
              { name: "Mascaras", query: "mascara" },
              { name: "Foundation & BB Creams", query: "foundation" },
              { name: "Compact Powders & Blushes", query: "blush" },
              { name: "Makeup Palettes", query: "eyeshadow palette" }
            ]
          },
          {
            title: "Nails & Manicure",
            links: [
              { name: "Nail Enamels", query: "nail polish" },
              { name: "Nail Care & Removers", query: "nail remover" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Skincare",
            links: [
              { name: "Face Washes & Cleansers", query: "face wash" },
              { name: "Face Serums & Treatments", query: "serum" },
              { name: "Moisturizers & Creams", query: "moisturizer" },
              { name: "Sun Protection & Sunscreens", query: "sunscreen" },
              { name: "Face Masks & Peels", query: "face mask" },
              { name: "Toners & Mists", query: "toner" },
              { name: "Under Eye Creams", query: "eye cream" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Haircare & Styling",
            links: [
              { name: "Shampoos & Conditioners", query: "shampoo" },
              { name: "Hair Oils & Serums", query: "hair oil" },
              { name: "Hair Masks & Spas", query: "hair mask" },
              { name: "Hair Styling Gels & Sprays", query: "hair wax" },
              { name: "Hair Dryers & Straighteners", query: "hair dryer" },
              { name: "Hair Colors", query: "hair color" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Fragrances & Deos",
            links: [
              { name: "Luxury Perfumes", query: "perfume" },
              { name: "Body Mists & Sprays", query: "body mist" },
              { name: "Deodorants & Roll-ons", query: "deodorant" },
              { name: "Attar & Concentrates", query: "attar" },
              { name: "Perfume Gift Sets", query: "perfume gift set" }
            ]
          },
          {
            title: "Men's Grooming",
            links: [
              { name: "Beard Care & Oils", query: "beard oil" },
              { name: "Shaving Essentials", query: "shaving" },
              { name: "Aftershaves", query: "aftershave" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Bath & Body Care",
            links: [
              { name: "Body Washes & Shower Gels", query: "body wash" },
              { name: "Body Scrubs & Exfoliators", query: "body scrub" },
              { name: "Body Lotions & Butters", query: "body lotion" },
              { name: "Hand & Foot Creams", query: "hand cream" },
              { name: "Oral Care Essentials", query: "toothpaste" },
              { name: "Essential Oils", query: "essential oil" }
            ]
          }
        ]
      }
    ]
  },
  more: {
    label: "More",
    tag: "Groceries, Sports, Kids & Books",
    columns: [
      {
        sections: [
          {
            title: "Groceries & Staples",
            links: [
              { name: "Rice & Grains", query: "rice" },
              { name: "Atta & Flours", query: "atta" },
              { name: "Pulses & Dals", query: "dal" },
              { name: "Cooking Oils & Ghee", query: "cooking oil" },
              { name: "Spices & Seasonings", query: "spices" },
              { name: "Organic & Dry Fruits", query: "dry fruits" }
            ]
          },
          {
            title: "Daily Breakfast",
            links: [
              { name: "Cereals & Oats", query: "oats" },
              { name: "Jams & Honey", query: "honey" },
              { name: "Spreads & Peanut Butter", query: "peanut butter" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Snacks & Beverages",
            links: [
              { name: "Tea & Artisanal Coffee", query: "coffee" },
              { name: "Juices & Drinks", query: "juice" },
              { name: "Biscuits & Cookies", query: "biscuits" },
              { name: "Chips & Crisps", query: "chips" },
              { name: "Chocolates & Sweets", query: "chocolate" },
              { name: "Noodles & Instant Food", query: "instant noodles" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Sports & Fitness",
            links: [
              { name: "Yoga Mats & Blocks", query: "yoga mat" },
              { name: "Dumbbells & Weights", query: "dumbbells" },
              { name: "Resistance Bands", query: "resistance bands" },
              { name: "Gym Shakers & Bottles", query: "gym shaker" },
              { name: "Badminton & Rackets", query: "badminton racket" },
              { name: "Cricket & Football Gear", query: "cricket kit" }
            ]
          },
          {
            title: "Outdoor & Adventure",
            links: [
              { name: "Trekking Backpacks", query: "trekking bag" },
              { name: "Camping Gear", query: "camping tent" },
              { name: "Hydration Packs", query: "water bottle" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Toys & Kids Corner",
            links: [
              { name: "Action Figures & Dolls", query: "action figure" },
              { name: "Board Games & Puzzles", query: "board games" },
              { name: "STEM & Learning Toys", query: "learning toys" },
              { name: "RC Cars & Drones", query: "rc car" },
              { name: "Soft Toys & Teddies", query: "soft toy" },
              { name: "School Bags & Pouches", query: "school bag" }
            ]
          }
        ]
      },
      {
        sections: [
          {
            title: "Books & Stationery",
            links: [
              { name: "Bestselling Fiction", query: "fiction books" },
              { name: "Self-Help & Business", query: "self help books" },
              { name: "Children's Storybooks", query: "kids book" },
              { name: "Notebooks & Planners", query: "notebook" },
              { name: "Art Supplies & Paints", query: "art supplies" },
              { name: "Pens & Desk Organizers", query: "pen" }
            ]
          },
          {
            title: "Special Collections",
            links: [
              { name: "Festival Offers", query: "festival" },
              { name: "Trending Drops", query: "trending" },
              { name: "Clearance Sale", query: "sale" }
            ]
          }
        ]
      }
    ]
  }
};

const NAV_STRIP_CATEGORIES = [
  { label: "Electronics", to: "/product?category=electronics" },
  { label: "Mobiles & Tech", to: "/product?category=mobiles" },
  { label: "Women's Fashion", to: "/product?category=women" },
  { label: "Men's Apparel", to: "/product?category=men" },
  { label: "Footwear", to: "/product?category=shoes" },
  { label: "Jewelry & Watches", to: "/product?category=jewelry" },
  { label: "Beauty & Care", to: "/product?category=beauty" },
  { label: "Home & Living", to: "/product?category=home" },
  { label: "Accessories", to: "/product?category=accessories" },
  { label: "Bags & Luggage", to: "/product?category=bags" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const location = useLocation();
  const { language, changeLanguage, t } = useLanguage();

  /* State */
  const [navCategories, setNavCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [open, setOpen] = useState(false); // Profile dropdown
  const [notiOpen, setNotiOpen] = useState(false); // Notifications dropdown
  const [categoriesOpen, setCategoriesOpen] = useState(false); // Categories dropdown
  const [activeMegaDept, setActiveMegaDept] = useState("men"); // Mega Menu active tab
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState("All");
  const [pincodeOpen, setPincodeOpen] = useState(false); // Location popover
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [username, setUsername] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [locationLabel, setLocationLabel] = useState(() => {
    return localStorage.getItem("delivery_location") || "Use location";
  });
  const [locationLoading, setLocationLoading] = useState(false);
  const [cartBump, setCartBump] = useState(false);

  useEffect(() => {
    cachedGet(`${backendUrl}/api/product/categories`)
      .then((res) => {
        if (res.data.success) {
          const rawCats = res.data.categories || [];
          const topCats = rawCats
            .filter((c) => !c.parentCategoryId && c.status === "active")
            .map((c) => ({
              id: c._id,
              label: c.name,
              to: `/product?category=${encodeURIComponent(c.slug || c.name.toLowerCase())}`,
              emoji: c.icon || "📦",
            }));
          if (topCats.length > 0) {
            setNavCategories(topCats);
          }
        }
      })
      .catch((err) => console.error("Failed to load categories in navbar:", err));
  }, []);

  const displayCategories = useMemo(() => {
    return navCategories.length > 0 ? navCategories : DEFAULT_CATEGORIES;
  }, [navCategories]);

  const [activeTab, setActiveTab] = useState("all");
  const [copiedNotiId, setCopiedNotiId] = useState(null);
  const [expandedNotis, setExpandedNotis] = useState({});
  const [pincodeInput, setPincodeInput] = useState(() => {
    return localStorage.getItem("delivery_pincode") || "";
  });
  const [isListening, setIsListening] = useState(false);
  const [searchCategory, setSearchCategory] = useState("all");

  /* Search autocomplete */
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("recent_searches") || "[]");
    } catch {
      return [];
    }
  });
  const [trendingSearches, setTrendingSearches] = useState([
    "Gaming Laptop",
    "Sneakers",
    "Smart Watch",
    "Running Shoes",
    "Perfume",
    "Headphones",
  ]);

  /* Mobile search & menu overlays */
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);

  /* Refs */
  const profileRef = useRef(null);
  const notiRef = useRef(null);
  const searchRef = useRef(null);
  const categoriesRef = useRef(null);
  const locationRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const moreNavRef = useRef(null);

  /* Dark mode */
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const token = localStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/api/user/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount((res.data.notifications || []).filter((n) => !n.isRead).length);
      }
    } catch (err) {
      console.log("Error fetching notifications:", err);
    }
  }, [token]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/notifications/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.log("Error marking notifications read:", err);
    }
  };

  const handleMarkSingleRead = async (notiId, e) => {
    if (e) e.stopPropagation();
    if (!token) return;
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/notifications/read`,
        { notificationId: notiId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === notiId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.log("Error marking notification read:", err);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, activeTab]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications, location.pathname]);

  const query = useMemo(
    () => new URLSearchParams(location.search).get("q") || "",
    [location.search]
  );

  const initials = useMemo(() => {
    if (!username) return "";
    return username
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [username]);

  /* ── Click outside ── */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setPincodeOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setNotiOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setSearchFocused(false);
      }
      if (moreNavRef.current && !moreNavRef.current.contains(e.target)) {
        setMoreNavOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── Fetch products for autocomplete ── */
  const fetchAllProducts = useCallback(async () => {
    if (allProducts.length > 0) return;
    try {
      const res = await cachedGet(`${backendUrl}/api/product/list`);
      if (res.data.success) setAllProducts(res.data.products || []);
    } catch { }
  }, [allProducts.length]);

  /* ── Fetch trending searches from analytics ── */
  const fetchTrendingSearches = useCallback(async () => {
    try {
      const res = await cachedGet(`${backendUrl}/api/product/search-suggestions`);
      if (res.data.success && res.data.suggestions && res.data.suggestions.length > 0) {
        setTrendingSearches(res.data.suggestions);
      }
    } catch (err) {
      console.log("Error fetching search suggestions:", err);
    }
  }, []);

  useEffect(() => {
    if ((searchFocused || mobileSearchOpen) && searchValue.trim().length >= 2) {
      fetchAllProducts();
      fetchTrendingSearches();
    }
  }, [searchValue, searchFocused, mobileSearchOpen, fetchAllProducts, fetchTrendingSearches]);

  const typoCorrection = useMemo(() => {
    return normalizeAndCorrectQuery(searchValue);
  }, [searchValue]);

  const suggestions = useMemo(() => {
    const q = searchValue.trim();
    if (!q) return [];
    const matched = allProducts.filter((p) => matchesFuzzySearch(p, q));
    return rankProductsBySearchRelevance(matched, q).slice(0, 6);
  }, [searchValue, allProducts]);

  /* ── Profile & cart count ── */
  useEffect(() => {
    if (!token) {
      setUsername("");
      const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
      setCartCount(Object.values(guestCart).reduce((s, q) => s + q, 0));
      return;
    }
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) setUsername(res.data.user.name);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUsername("");
          setCartCount(0);
        }
      }
    };
    const fetchCartCount = async () => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          const cartData = res.data.cartData || {};
          setCartCount(Object.values(cartData).reduce((s, q) => s + q, 0));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setUsername("");
          setCartCount(0);
        }
      }
    };
    fetchProfile();
    fetchCartCount();
  }, [token, location.pathname]);

  /* ── Real-time cart sync ── */
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartBump(true);
      setTimeout(() => setCartBump(false), 600);
      if (!token) {
        const guestCart = JSON.parse(localStorage.getItem("cart") || "{}");
        setCartCount(Object.values(guestCart).reduce((s, q) => s + q, 0));
      } else {
        axios
          .post(
            `${backendUrl}/api/cart/get`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
          .then((res) => {
            if (res.data.success) {
              const cartData = res.data.cartData || {};
              setCartCount(Object.values(cartData).reduce((s, q) => s + q, 0));
            }
          })
          .catch(() => { });
      }
    };
    window.addEventListener("storage", handleCartUpdate);
    window.addEventListener("cartUpdate", handleCartUpdate);

    const handleCartBounce = () => {
      setIsCartBouncing(true);
      setTimeout(() => setIsCartBouncing(false), 800);
    };
    window.addEventListener("cartAddAnimComplete", handleCartBounce);

    return () => {
      window.removeEventListener("storage", handleCartUpdate);
      window.removeEventListener("cartUpdate", handleCartUpdate);
      window.removeEventListener("cartAddAnimComplete", handleCartBounce);
    };
  }, [token]);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    setOpen(false);
    setNotiOpen(false);
    setMobileSearchOpen(false);
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setPincodeOpen(false);
  }, [location.pathname]);

  /* ── Handlers ── */
  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/login");
  };

  const submitSearch = (val) => {
    const trimmed = (val ?? searchValue).trim();
    if (trimmed) {
      setRecentSearches((prev) => {
        const next = [trimmed, ...prev.filter((x) => x !== trimmed)].slice(0, 5);
        localStorage.setItem("recent_searches", JSON.stringify(next));
        return next;
      });
    }
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    const catQuery =
      searchCategory && searchCategory !== "all"
        ? `&category=${encodeURIComponent(searchCategory)}`
        : "";
    navigate(
      `/product${trimmed
        ? `?q=${encodeURIComponent(trimmed)}${catQuery}`
        : catQuery
          ? `?${catQuery.slice(1)}`
          : ""
      }`
    );
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel("Unavailable");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await res.json();
          const a = data.address || {};
          const cityStr =
            a.city ||
            a.town ||
            a.state_district ||
            a.state ||
            a.country ||
            `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
          const pCode = a.postcode || "";
          localStorage.setItem("delivery_location", cityStr);
          if (pCode) {
            localStorage.setItem("delivery_pincode", pCode);
            setPincodeInput(pCode);
          }
          setLocationLabel(cityStr);
          window.dispatchEvent(new Event("pincodeUpdated"));
          toast.success(`Location set to: ${cityStr}`);
        } catch {
          const coordsStr = `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;
          localStorage.setItem("delivery_location", coordsStr);
          setLocationLabel(coordsStr);
          window.dispatchEvent(new Event("pincodeUpdated"));
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        if (err.code === 1) {
          setLocationLabel("Denied");
          toast.error(
            "Location permission denied. Please verify System Settings > Location Services is enabled."
          );
        } else if (err.code === 3) {
          setLocationLabel("Timeout");
          toast.error("Location request timed out. Please try again.");
        } else {
          setLocationLabel("Unavailable");
          toast.error("Location unavailable.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Voice search is not supported in this browser. Please use Chrome or Safari.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang =
      language === "hi" ? "hi-IN" : language === "es" ? "es-ES" : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Listening... Speak now 🎙️");
    };

    recognition.onerror = (e) => {
      console.error("Speech error", e);
      setIsListening(false);
      toast.error("Could not understand voice. Try again.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      setSearchValue(speechToText);
      submitSearch(speechToText);
      toast.success(`Searching for: "${speechToText}"`);
    };

    recognition.start();
  };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <>
      {/* Backdrop Dimming Overlay */}
      {showSuggestions && (
        <div
          onClick={() => {
            setShowSuggestions(false);
            setSearchFocused(false);
          }}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm transition-opacity duration-300"
        />
      )}

      {/* ═══════════ TOP MINIMALIST GLASS NAVBAR ═══════════ */}
      <header id="main-navbar-header" className="sticky top-0 z-50 w-full">
        <nav className="bg-white dark:bg-slate-950 shadow-xs transition-all duration-300">
          <div className="w-full pl-1.5 sm:pl-3 lg:pl-4 pr-3 sm:pr-6 lg:pr-8">
            <div className="flex h-16 items-center gap-3 lg:gap-5 w-full">
              {/* ── Logo ── */}
              <Link to="/" className="-ml-2 sm:-ml-3 group flex shrink-0 items-center select-none">
                <Logo className="h-10 sm:h-12 w-36 sm:w-48 text-slate-900 dark:text-white group-hover:scale-105 transition-transform duration-300" />
              </Link>

              {/* ── Integrated Search Capsule ── */}
              <div
                ref={searchRef}
                className={`relative hidden md:flex flex-1 min-w-0 mx-2 lg:mx-4 transition-all duration-300 ease-in-out z-50 ${searchFocused ? "max-w-3xl" : "max-w-xl lg:max-w-2xl"
                  }`}
              >
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitSearch();
                  }}
                  className={`relative flex w-full items-center rounded-full transition-all duration-300 border bg-white dark:bg-slate-900 pl-3.5 pr-1.5 py-1 ${searchFocused
                      ? "border-[#FF6A00] ring-2 ring-[#FF6A00]/20 shadow-md"
                      : "border-slate-300 dark:border-slate-700 hover:border-slate-400"
                    }`}
                >
                  {/* Left Search Lens Icon */}
                  <Search size={16} className="text-slate-400 dark:text-slate-500 mr-2.5 shrink-0" />

                  {/* Search Input Field */}
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => {
                      setSearchFocused(true);
                      setShowSuggestions(true);
                    }}
                    placeholder="Search CartNow..."
                    className="h-9 w-full flex-1 bg-transparent text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none font-medium min-w-0"
                  />

                  {/* Clear Query Button */}
                  {searchValue && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchValue("");
                        setShowSuggestions(false);
                      }}
                      className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer border-none"
                    >
                      <X size={10} />
                    </button>
                  )}

                  {/* Voice Search Button */}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    aria-label="Search by voice"
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer border-none mr-0.5 ${isListening ? "bg-red-500/10 text-red-500 animate-pulse" : ""
                      }`}
                    title="Search by Voice"
                  >
                    <Mic size={15} />
                  </button>

                  {/* Category Picker (Orange LayoutGrid + Category Label + ChevronDown) */}
                  <div ref={categoriesRef} className="relative shrink-0 flex items-center mr-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategoriesOpen((p) => !p);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#FF6A00] transition cursor-pointer select-none rounded-full"
                    >
                      <LayoutGrid size={13} className="text-[#FF6A00] shrink-0" />
                      <span className="max-w-[70px] truncate">{selectedCategoryLabel}</span>
                      <ChevronDown
                        size={11}
                        className={`text-slate-400 transition-transform duration-300 ${categoriesOpen ? "rotate-180 text-[#FF6A00]" : ""
                          }`}
                      />
                    </button>
                  </div>

                  {/* Circular Orange Search Submit Button */}
                  <button
                    type="submit"
                    aria-label="Submit product search"
                    className="h-8 w-8 sm:h-8.5 sm:w-8.5 rounded-full bg-[#FF6A00] hover:bg-[#E55F00] active:scale-95 text-white transition flex items-center justify-center shrink-0 cursor-pointer border-none shadow-xs"
                  >
                    <Search size={14} className="text-white stroke-[2.5]" />
                  </button>
                </form>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={dropdownVariants}
                      className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 overflow-hidden rounded-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-4 space-y-4 text-left border border-slate-200/80 dark:border-slate-800/80"
                    >
                      {!searchValue.trim() ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Category Shortcuts */}
                          <div className="md:col-span-2 pb-3">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                              <Tag size={11} className="text-amber-500" /> Category Shortcuts
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {displayCategories.slice(0, 6).map((item) => (
                                <motion.button
                                  key={item.label}
                                  variants={listItemVariants}
                                  type="button"
                                  onMouseDown={() => {
                                    setShowSuggestions(false);
                                    navigate(item.to);
                                  }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer shadow-2xs"
                                >
                                  <span>{item.emoji}</span>
                                  <span>{item.label}</span>
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Recent Searches */}
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                              <RotateCcw size={11} /> Recent Searches
                            </p>
                            {recentSearches.length === 0 ? (
                              <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic pl-1">
                                No recent searches
                              </p>
                            ) : (
                              <div className="space-y-1">
                                {recentSearches.map((item, index) => (
                                  <motion.div
                                    key={index}
                                    variants={listItemVariants}
                                    className="flex items-center justify-between group"
                                  >
                                    <button
                                      type="button"
                                      onMouseDown={() => {
                                        setSearchValue(item);
                                        submitSearch(item);
                                      }}
                                      className="flex-1 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 py-1 transition-colors cursor-pointer"
                                    >
                                      {item}
                                    </button>
                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.stopPropagation();
                                        const next = recentSearches.filter(
                                          (_, i) => i !== index
                                        );
                                        setRecentSearches(next);
                                        localStorage.setItem(
                                          "recent_searches",
                                          JSON.stringify(next)
                                        );
                                      }}
                                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition px-1 opacity-0 group-hover:opacity-100"
                                    >
                                      Clear
                                    </button>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Trending Searches */}
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                              <TrendingUp size={11} className="text-amber-500" /> Trending Now
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {trendingSearches.map((item) => (
                                <motion.button
                                  key={item}
                                  variants={listItemVariants}
                                  type="button"
                                  onMouseDown={() => {
                                    setSearchValue(item);
                                    submitSearch(item);
                                  }}
                                  className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-amber-50/20 dark:hover:bg-amber-950/20 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer shadow-2xs"
                                >
                                  {item}
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Suggestions list */
                        <div className="space-y-3">
                          <div className="flex items-center justify-between pb-2">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Matching Products
                            </p>
                            <span className="text-[10px] font-bold text-slate-400">
                              {suggestions.length} suggestions
                            </span>
                          </div>

                          {suggestions.length === 0 ? (
                            <p className="text-xs text-slate-400 dark:text-slate-500 py-2">
                              No matching products found. Press Enter to search anyway.
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {suggestions.map((p) => (
                                <motion.button
                                  key={p._id}
                                  variants={listItemVariants}
                                  onMouseDown={() => submitSearch(p.name)}
                                  className="flex w-full items-center gap-3 py-2 text-left hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition rounded-xl px-1.5 group cursor-pointer"
                                >
                                  <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-800 shadow-2xs">
                                    <img
                                      src={
                                        p.images?.[0]?.startsWith("http")
                                          ? p.images[0]
                                          : `${backendUrl}/${p.images?.[0]}`
                                      }
                                      alt={p.name}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                                      {p.name}
                                    </p>
                                    <p className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                      {p.category}
                                      {p.brand ? ` · ${p.brand}` : ""}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-xs font-black text-slate-800 dark:text-slate-200">
                                    ₹{p.price.toLocaleString("en-IN")}
                                  </span>
                                </motion.button>
                              ))}
                            </div>
                          )}

                          <div className="pt-2.5">
                            <button
                              onMouseDown={() => submitSearch()}
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 py-2.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-slate-700 transition cursor-pointer"
                            >
                              <Search size={12} />
                              Search all results for "{searchValue}"
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Minimal Right Actions Section ── */}
              <div className="flex items-center gap-1.5 sm:gap-2 ml-auto lg:ml-0">
                {/* Delivery Location Pill */}
                <div ref={locationRef} className="relative hidden lg:block shrink-0">
                  <button
                    type="button"
                    onClick={() => setPincodeOpen((p) => !p)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition cursor-pointer text-left select-none bg-transparent"
                  >
                    <MapPin size={16} className="text-amber-500 shrink-0 stroke-[2.5]" />
                    <div className="flex flex-col leading-none">
                      <span className="text-[9.5px] font-bold text-slate-400">
                        Deliver to
                      </span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-0.5 mt-0.5">
                        {locationLabel && locationLabel !== "Use location"
                          ? locationLabel
                          : "Vaghodia 391760"}
                        <ChevronDown
                          size={10}
                          className={`text-slate-400 transition-transform duration-300 ${pincodeOpen ? "rotate-180" : ""
                            }`}
                        />
                      </span>
                    </div>
                  </button>

                  {/* Location Animated Popover */}
                  <AnimatePresence>
                    {pincodeOpen && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        className="absolute right-0 top-[calc(100%+8px)] w-72 overflow-hidden rounded-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl z-50 p-4 text-left border border-slate-200/80 dark:border-slate-800/80"
                      >
                        <div className="flex items-center justify-between pb-2 mb-3">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                            <MapPin size={14} className="text-amber-500" />
                            Choose Delivery Location
                          </span>
                          <button
                            onClick={() => setPincodeOpen(false)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        </div>

                        {/* Detect location button */}
                        <motion.button
                          variants={listItemVariants}
                          type="button"
                          onClick={handleGetLocation}
                          disabled={locationLoading}
                          className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black hover:bg-amber-600 transition cursor-pointer disabled:opacity-50 mb-3 shadow-xs"
                        >
                          <Navigation
                            size={13}
                            className={locationLoading ? "animate-spin" : ""}
                          />
                          <span>
                            {locationLoading
                              ? "Detecting location..."
                              : "Use My Current Location"}
                          </span>
                        </motion.button>

                        {/* Pincode Input Form */}
                        <motion.form
                          variants={listItemVariants}
                          onSubmit={(e) => {
                            e.preventDefault();
                            const val = pincodeInput.trim();
                            if (val) {
                              localStorage.setItem("delivery_pincode", val);
                              localStorage.setItem("delivery_location", `Pincode ${val}`);
                              setLocationLabel(`Pincode ${val}`);
                              window.dispatchEvent(new Event("pincodeUpdated"));
                              toast.success(`Delivery pincode set to: ${val}`);
                              setPincodeOpen(false);
                            }
                          }}
                          className="flex items-center gap-2 mb-3"
                        >
                          <input
                            type="text"
                            maxLength={6}
                            value={pincodeInput}
                            onChange={(e) =>
                              setPincodeInput(e.target.value.replace(/\D/g, ""))
                            }
                            placeholder="Enter 6-digit Pincode"
                            className="flex-1 h-8 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-slate-100 font-medium outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                          />
                          <button
                            type="submit"
                            className="h-8 px-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-xs font-bold hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-500 dark:hover:text-slate-950 transition cursor-pointer"
                          >
                            Apply
                          </button>
                        </motion.form>

                        {/* Quick Locations List */}
                        <motion.div
                          variants={listItemVariants}
                          className="pt-2.5 space-y-1"
                        >
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                            Popular Cities & Pincodes
                          </p>
                          {[
                            { city: "Vaghodia", code: "391760" },
                            { city: "Vadodara", code: "390001" },
                            { city: "Mumbai", code: "400001" },
                            { city: "New Delhi", code: "110001" },
                            { city: "Bengaluru", code: "560001" },
                          ].map((loc) => (
                            <button
                              key={loc.code}
                              type="button"
                              onClick={() => {
                                const label = `${loc.city} ${loc.code}`;
                                localStorage.setItem("delivery_location", label);
                                localStorage.setItem("delivery_pincode", loc.code);
                                setPincodeInput(loc.code);
                                setLocationLabel(label);
                                window.dispatchEvent(new Event("pincodeUpdated"));
                                toast.success(`Location set to: ${label}`);
                                setPincodeOpen(false);
                              }}
                              className="flex w-full items-center justify-between px-2 py-1.5 rounded-xl text-left text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer"
                            >
                              <span>{loc.city}</span>
                              <span className="font-mono text-[10px] font-bold text-slate-400">
                                {loc.code}
                              </span>
                            </button>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Language Pill */}
                <button
                  type="button"
                  onClick={() => changeLanguage(language === "en" ? "hi" : "en")}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100/70 dark:hover:bg-slate-900/60 text-xs font-black text-slate-800 dark:text-slate-200 transition cursor-pointer shrink-0"
                >
                  <span className="text-sm">🇮🇳</span>
                  <span className="uppercase">{language || "EN"}</span>
                </button>

                {/* Returns & Orders Link */}
                <Link
                  to={token ? "/orderdetail" : "/login"}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition cursor-pointer select-none shrink-0"
                >
                  <Package size={16} className="text-slate-600 dark:text-slate-400" />
                  <div className="leading-none text-left">
                    <span className="text-[9.5px] font-bold text-slate-400 block">
                      Returns
                    </span>
                    <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-0.5 block">
                      & Orders
                    </span>
                  </div>
                </Link>

                {/* Mobile Search Button */}
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(true)}
                  title="Search products"
                  className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 transition cursor-pointer select-none shrink-0"
                >
                  <Search size={16} />
                </button>

                {/* Cart Icon Pill */}
                <Link
                  to="/cart"
                  title="Shopping Cart"
                  className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition cursor-pointer select-none shrink-0 group"
                >
                  <ShoppingCart
                    size={17}
                    className="text-slate-800 dark:text-slate-200 group-hover:scale-110 transition-transform duration-200"
                  />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[9.5px] font-black shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Notifications Bell */}
                {token && (
                  <div ref={notiRef} className="relative">
                    <button
                      onClick={() => setNotiOpen((p) => !p)}
                      title="Notifications"
                      className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                    >
                      <Bell size={16} className={unreadCount > 0 ? "animate-wiggle" : ""} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                    </button>

                    {/* Animated Notifications Dropdown */}
                    <AnimatePresence>
                      {notiOpen && (
                        <motion.div
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={dropdownVariants}
                          data-lenis-prevent
                          className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-[calc(100%+12px)] sm:w-96 overflow-hidden rounded-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl z-50 border border-slate-200/80 dark:border-slate-800/80"
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
                                Notifications
                              </span>
                              {unreadCount > 0 && (
                                <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-full">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                            {unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-bold text-amber-500 hover:text-amber-600 flex items-center gap-1 transition cursor-pointer"
                              >
                                <CheckCheck size={12} />
                                <span>Mark all read</span>
                              </button>
                            )}
                          </div>

                          {/* Filter Tabs Header */}
                          <div className="flex gap-1.5 px-4 py-2 bg-slate-50/30 dark:bg-slate-900/10">
                            <button
                              onClick={() => setActiveTab("all")}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "all"
                                  ? "bg-slate-900 text-slate-100 dark:text-white dark:bg-white dark:text-slate-950 shadow-xs scale-105"
                                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/20"
                                }`}
                            >
                              All{" "}
                              {notifications.length > 0 &&
                                `(${notifications.length})`}
                            </button>
                            <button
                              onClick={() => setActiveTab("unread")}
                              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === "unread"
                                  ? "bg-amber-500 text-slate-950 font-black shadow-xs scale-105"
                                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/40 dark:hover:bg-slate-800/20"
                                }`}
                            >
                              Unread {unreadCount > 0 && `(${unreadCount})`}
                            </button>
                          </div>

                          {/* List of items */}
                          <div className="max-h-[60vh] sm:max-h-[350px] overflow-y-auto scrollbar-hide">
                            {filteredNotifications.length === 0 ? (
                              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                                <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-900/40 text-slate-400 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
                                  <Bell
                                    size={24}
                                    className="text-slate-400 dark:text-slate-500"
                                  />
                                </div>
                                <p className="text-xs font-black text-slate-800 dark:text-slate-200">
                                  {activeTab === "unread"
                                    ? "No unread alerts"
                                    : "Inbox Clean & Clear"}
                                </p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] leading-relaxed">
                                  {activeTab === "unread"
                                    ? "You have read all notifications. Switch to 'All' to view history."
                                    : "You're all caught up!"}
                                </p>
                              </div>
                            ) : (
                              filteredNotifications.map((n) => {
                                const getNotificationIcon = (title) => {
                                  const tLower = title.toLowerCase();
                                  if (
                                    tLower.includes("promo") ||
                                    tLower.includes("coupon") ||
                                    tLower.includes("discount")
                                  ) {
                                    return (
                                      <div className="h-8.5 w-8.5 rounded-md bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20 shrink-0 shadow-xs animate-pulse">
                                        <Tag size={15} className="stroke-[2.5]" />
                                      </div>
                                    );
                                  }
                                  if (tLower.includes("delivered")) {
                                    return (
                                      <div className="h-8.5 w-8.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-xs">
                                        <PackageCheck
                                          size={15}
                                          className="stroke-[2.5]"
                                        />
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="h-8.5 w-8.5 rounded-md bg-slate-500/10 dark:bg-slate-500/15 text-slate-600 dark:text-slate-400 flex items-center justify-center border border-slate-500/20 shrink-0 shadow-xs">
                                      <Package size={15} className="stroke-[2.5]" />
                                    </div>
                                  );
                                };

                                return (
                                  <motion.div
                                    key={n._id}
                                    variants={listItemVariants}
                                    onClick={() => {
                                      if (n.orderId) {
                                        navigate(`/order/${n.orderId}`);
                                      } else {
                                        navigate("/product");
                                      }
                                      setNotiOpen(false);
                                    }}
                                    className={`px-5 py-4 flex gap-3.5 text-left transition cursor-pointer hover:bg-amber-500/[0.03] relative group border-l-4 ${!n.isRead
                                        ? "bg-amber-500/[0.02] border-amber-500"
                                        : "border-transparent"
                                      }`}
                                  >
                                    {getNotificationIcon(n.title)}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex justify-between items-start gap-1">
                                        <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">
                                          {n.title}
                                        </p>
                                        {!n.isRead && (
                                          <button
                                            onClick={(e) => handleMarkSingleRead(n._id, e)}
                                            className="p-1 text-amber-500 hover:text-amber-600 transition"
                                            title="Mark read"
                                          >
                                            <Check size={12} />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        {n.message}
                                      </p>
                                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-2 font-normal">
                                        {new Date(n.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </motion.div>
                                );
                              })
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Hello [User] Account & Profile Pill */}
                <div ref={profileRef} className="relative hidden md:block shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setOpen((p) => !p);
                      setPincodeOpen(false);
                    }}
                    className="flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-slate-100/70 dark:hover:bg-slate-900/60 transition cursor-pointer bg-transparent"
                  >
                    <div className="h-7 w-7 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                      {initials || <User size={13} />}
                    </div>
                    <div className="text-left leading-none">
                      <span className="text-[9.5px] font-semibold text-slate-400 dark:text-slate-400 block">
                        Hello, {username ? username.split(" ")[0] : "Sign in"}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-0.5 mt-0.5">
                        Account{" "}
                        <ChevronDown
                          size={11}
                          strokeWidth={2.2}
                          className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180" : ""
                            }`}
                        />
                      </span>
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={dropdownVariants}
                        className="absolute right-0 top-[calc(100%+8px)] w-64 overflow-hidden rounded-md bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl shadow-2xl z-50 text-left border border-slate-200/80 dark:border-slate-800/80 font-normal"
                      >
                        {token ? (
                          <>
                            {/* User Header */}
                            <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-slate-900/60 px-4 py-3">
                              <div className="relative flex h-9 w-9 items-center justify-center rounded-md bg-amber-500 text-xs font-bold text-slate-950 shrink-0 shadow-xs">
                                {initials || <User size={15} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[9px] font-medium tracking-widest uppercase text-slate-400 block leading-none">
                                  WELCOME BACK
                                </span>
                                <p className="text-xs font-medium text-slate-900 dark:text-white truncate capitalize mt-1 leading-none">
                                  {username || "My Account"}
                                </p>
                              </div>
                            </div>

                            {/* Nav Items List */}
                            <div className="p-1 space-y-0.5">
                              {[
                                { icon: User, label: t("profile"), to: "/profile" },
                                { icon: Package, label: t("orders"), to: "/orderdetail" },
                                { icon: Heart, label: "Wishlist", to: "/wishlist" },
                                { icon: Globe, label: "Social Feed", to: "/social" },
                                { icon: HelpCircle, label: "Help & Support", to: "/help" },
                                {
                                  icon: Store,
                                  label: "Become a Seller",
                                  externalUrl: "https://cartnow-seller.vercel.app/",
                                  isExternal: true,
                                },
                                {
                                  icon: Truck,
                                  label: "Join as Deliveryman",
                                  externalUrl:
                                    "https://cart-now-deliveryagent.vercel.app/",
                                  isExternal: true,
                                },
                              ].map((item) => (
                                <motion.div
                                  key={item.label}
                                  variants={listItemVariants}
                                >
                                  {item.isExternal ? (
                                    <a
                                      href={item.externalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => setOpen(false)}
                                      className="flex w-full items-center justify-between px-3 py-1.5 rounded-md text-left text-xs font-normal text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer group"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <item.icon
                                          size={14}
                                          className="text-amber-500 group-hover:scale-110 transition-transform"
                                        />
                                        <span>{item.label}</span>
                                      </div>
                                      <ExternalLink
                                        size={12}
                                        className="text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity"
                                      />
                                    </a>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setOpen(false);
                                        navigate(item.to);
                                      }}
                                      className="flex w-full items-center justify-between px-3 py-1.5 rounded-md text-left text-xs font-normal text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer group border-none bg-transparent"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <item.icon
                                          size={14}
                                          className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                                        />
                                        <span>{item.label}</span>
                                      </div>
                                      <ChevronRight
                                        size={12}
                                        className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
                                      />
                                    </button>
                                  )}
                                </motion.div>
                              ))}
                            </div>

                            {/* Settings Section */}
                            <motion.div
                              variants={listItemVariants}
                              className="mx-1 my-1 p-2.5 rounded-md border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isDarkMode ? (
                                    <Moon size={12} className="text-amber-400" />
                                  ) : (
                                    <Sun size={12} className="text-amber-500" />
                                  )}
                                  <span className="text-[9.5px] font-normal uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    THEME
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsDarkMode(!isDarkMode)}
                                  aria-label="Toggle theme"
                                  className={`relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer border-none ${isDarkMode ? "bg-slate-700" : "bg-slate-300"
                                    }`}
                                >
                                  <span
                                    className={`absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${isDarkMode ? "translate-x-4" : "translate-x-0"
                                      }`}
                                  >
                                    {isDarkMode ? (
                                      <Moon size={9} className="text-slate-800" />
                                    ) : (
                                      <Sun size={9} className="text-amber-500" />
                                    )}
                                  </span>
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                                <span className="text-[9.5px] font-normal uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  LANGUAGE
                                </span>
                                <select
                                  value={language}
                                  onChange={(e) => changeLanguage(e.target.value)}
                                  className="h-6 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-[10px] font-normal text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                  <option value="en">English (EN)</option>
                                  <option value="hi">Hindi (HI)</option>
                                  <option value="es">Español (ES)</option>
                                </select>
                              </div>
                            </motion.div>

                            {/* Logout */}
                            <motion.div
                              variants={listItemVariants}
                              className="p-1 border-t border-slate-100 dark:border-slate-900/80"
                            >
                              <button
                                onClick={handleLogout}
                                className="flex w-full items-center justify-between px-3 py-1.5 rounded-md text-left text-xs font-normal text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer border-none bg-transparent group"
                              >
                                <div className="flex items-center gap-2.5">
                                  <LogOut size={14} className="text-rose-500" />
                                  <span>{t("logout")}</span>
                                </div>
                                <ChevronRight
                                  size={12}
                                  className="text-rose-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                                />
                              </button>
                            </motion.div>
                          </>
                        ) : (
                          <>
                            {/* Guest Header with Login / Signup actions */}
                            <div className="p-3.5 pb-3 border-b border-slate-100 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-900/60">
                              <div className="text-center pb-2">
                                <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 shadow-2xs">
                                  <User size={16} />
                                </div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                  Welcome Guest!
                                </h4>
                                <p className="text-[9.5px] text-slate-400 dark:text-slate-500 mt-0.5">
                                  Sign in to track orders & personalized perks
                                </p>
                              </div>

                              <div className="space-y-1.5 pt-1">
                                <button
                                  onClick={() => {
                                    setOpen(false);
                                    navigate("/login", { state: { from: location } });
                                  }}
                                  className="w-full py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 text-center text-xs font-bold active:scale-95 transition-all cursor-pointer border-none uppercase tracking-wider shadow-2xs"
                                >
                                  {t("login")}
                                </button>
                                <button
                                  onClick={() => {
                                    setOpen(false);
                                    navigate("/signup", { state: { from: location } });
                                  }}
                                  className="w-full py-1.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                                >
                                  Create Account
                                </button>
                              </div>
                            </div>

                            {/* Nav Items List for Guest */}
                            <div className="p-1 space-y-0.5">
                              {[
                                { icon: Package, label: t("orders") || "Orders & Returns", to: "/orderdetail" },
                                { icon: Heart, label: "Wishlist", to: "/wishlist" },
                                { icon: Truck, label: "Track Shipment", to: "/track" },
                                { icon: Globe, label: "Social Feed", to: "/social" },
                                { icon: HelpCircle, label: "Help & Support", to: "/help" },
                                {
                                  icon: Store,
                                  label: "Become a Seller",
                                  externalUrl: "https://cartnow-seller.vercel.app/",
                                  isExternal: true,
                                },
                                {
                                  icon: Truck,
                                  label: "Join as Deliveryman",
                                  externalUrl:
                                    "https://cart-now-deliveryagent.vercel.app/",
                                  isExternal: true,
                                },
                              ].map((item) => (
                                <motion.div
                                  key={item.label}
                                  variants={listItemVariants}
                                >
                                  {item.isExternal ? (
                                    <a
                                      href={item.externalUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={() => setOpen(false)}
                                      className="flex w-full items-center justify-between px-3 py-1.5 rounded-md text-left text-xs font-normal text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer group"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <item.icon
                                          size={14}
                                          className="text-amber-500 group-hover:scale-110 transition-transform"
                                        />
                                        <span>{item.label}</span>
                                      </div>
                                      <ExternalLink
                                        size={12}
                                        className="text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity"
                                      />
                                    </a>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setOpen(false);
                                        navigate(item.to);
                                      }}
                                      className="flex w-full items-center justify-between px-3 py-1.5 rounded-md text-left text-xs font-normal text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer group border-none bg-transparent"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <item.icon
                                          size={14}
                                          className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors"
                                        />
                                        <span>{item.label}</span>
                                      </div>
                                      <ChevronRight
                                        size={12}
                                        className="text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-150"
                                      />
                                    </button>
                                  )}
                                </motion.div>
                              ))}
                            </div>

                            {/* Settings Section for Guest (Theme & Language) */}
                            <motion.div
                              variants={listItemVariants}
                              className="mx-1 my-1 p-2.5 rounded-md border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 space-y-2"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {isDarkMode ? (
                                    <Moon size={12} className="text-amber-400" />
                                  ) : (
                                    <Sun size={12} className="text-amber-500" />
                                  )}
                                  <span className="text-[9.5px] font-normal uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    THEME
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setIsDarkMode(!isDarkMode)}
                                  aria-label="Toggle theme"
                                  className={`relative h-5 w-9 rounded-full transition-colors duration-200 cursor-pointer border-none ${isDarkMode ? "bg-slate-700" : "bg-slate-300"
                                    }`}
                                >
                                  <span
                                    className={`absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform duration-200 ${isDarkMode ? "translate-x-4" : "translate-x-0"
                                      }`}
                                  >
                                    {isDarkMode ? (
                                      <Moon size={9} className="text-slate-800" />
                                    ) : (
                                      <Sun size={9} className="text-amber-500" />
                                    )}
                                  </span>
                                </button>
                              </div>

                              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-800/60">
                                <span className="text-[9.5px] font-normal uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                  LANGUAGE
                                </span>
                                <select
                                  value={language}
                                  onChange={(e) => changeLanguage(e.target.value)}
                                  className="h-6 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-[10px] font-normal text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                  <option value="en">English (EN)</option>
                                  <option value="hi">Hindi (HI)</option>
                                  <option value="es">Español (ES)</option>
                                </select>
                              </div>
                            </motion.div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {/* ── Mobile Menu Toggle Button (Right Side) ── */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((p) => !p)}
                  className="md:hidden flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer shrink-0 border border-slate-200/80 dark:border-slate-800/80 ml-1"
                  aria-label="Toggle navigation menu"
                  title="Navigation Menu"
                >
                  {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════ SECONDARY CATEGORIES BAR (MOCKUP ALIGNMENT) ═══════════ */}
          <div className="relative z-40 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/95 shadow-2xs">
            <div className="w-full px-3 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between gap-1.5 sm:gap-2 text-xs select-none">
              {/* Category Links with Horizontal Scroll */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide py-0.5 min-w-0 flex-1">
                {/* All Categories Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (categoriesOpen && activeMegaDept !== "more") {
                      setCategoriesOpen(false);
                    } else {
                      setActiveMegaDept("men");
                      setCategoriesOpen(true);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition shadow-2xs font-bold shrink-0 cursor-pointer ${
                    categoriesOpen && activeMegaDept !== "more"
                      ? "border-[#FF6A00] bg-orange-50/80 dark:bg-orange-950/30 text-[#FF6A00]"
                      : "border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Menu size={14} className="stroke-[2.5]" />
                  <span>All Categories</span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${
                      categoriesOpen && activeMegaDept !== "more" ? "rotate-180 text-[#FF6A00]" : "text-slate-400"
                    }`}
                  />
                </button>

                {/* Category Quick Links */}
                {NAV_STRIP_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.label}
                    to={cat.to}
                    className="px-2 sm:px-2.5 py-1 text-slate-700 dark:text-slate-300 hover:text-[#FF6A00] dark:hover:text-orange-400 font-bold whitespace-nowrap transition cursor-pointer text-xs shrink-0"
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>

              {/* More ▾ Button in secondary bar (Opens rich multi-column Mega Menu with 'more' tab) */}
              <div className="relative shrink-0 pl-1" ref={moreNavRef}>
                <button
                  type="button"
                  onClick={() => {
                    if (categoriesOpen && activeMegaDept === "more") {
                      setCategoriesOpen(false);
                    } else {
                      setActiveMegaDept("more");
                      setCategoriesOpen(true);
                    }
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 font-bold cursor-pointer rounded-md transition text-xs border ${
                    categoriesOpen && activeMegaDept === "more"
                      ? "text-[#FF6A00] bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800/50"
                      : "text-slate-700 dark:text-slate-300 hover:text-[#FF6A00] dark:hover:text-orange-400 border-transparent bg-transparent"
                  }`}
                >
                  <span>More</span>
                  <ChevronDown
                    size={11}
                    className={`transition-transform duration-200 ${
                      categoriesOpen && activeMegaDept === "more" ? "rotate-180 text-[#FF6A00]" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ═══════════ CATEGORY MULTI-COLUMN MEGA MENU (SHARP CORNERS, DIRECTLY UNDER SEARCH BAR, NO BG BLUR) ═══════════ */}
          <AnimatePresence>
            {categoriesOpen && (
              <>
                {/* Invisible Click-Outside Layer (No Background Blur or Tint) */}
                <div
                  onClick={() => setCategoriesOpen(false)}
                  className="fixed inset-0 z-[140] bg-transparent"
                />
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="fixed left-1/2 -translate-x-1/2 top-[60px] sm:top-[64px] w-[98vw] max-w-[1240px] rounded-none bg-white dark:bg-slate-950 shadow-2xl z-[150] text-left border border-slate-300 dark:border-slate-700 overflow-hidden flex flex-col"
                >
                  {/* ── Top Department Selector Bar (Yellowish Warm Accent, Sharp Corners) ── */}
                  <div className="flex items-center justify-between border-b border-amber-200/70 dark:border-slate-800 bg-[#fffdf2] dark:bg-slate-900/95 px-4 sm:px-6 py-2 select-none overflow-x-auto scrollbar-hide">
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      {Object.entries(MEGA_MENU_DATA).map(([key, dept]) => {
                        const isActive = activeMegaDept === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onMouseEnter={() => setActiveMegaDept(key)}
                            onClick={() => setActiveMegaDept(key)}
                            className={`relative px-4 sm:px-5 py-2 text-xs sm:text-[13px] font-bold tracking-wider uppercase transition-all cursor-pointer rounded-none shrink-0 ${
                              isActive
                                ? "text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-950 border border-amber-300/80 dark:border-amber-700/80 shadow-2xs font-extrabold"
                                : "text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-slate-800/60 border border-transparent"
                            }`}
                          >
                            {dept.label}
                            {isActive && (
                              <motion.div
                                layoutId="megaTabActiveLine"
                                className="absolute top-0 left-0 right-0 h-[2.5px] bg-amber-500"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryLabel("All");
                        setSearchCategory("all");
                        setCategoriesOpen(false);
                        navigate("/product");
                      }}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-amber-500/10 hover:text-amber-600 transition cursor-pointer border border-amber-300/70 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0"
                    >
                      <LayoutGrid size={13} className="text-amber-500" />
                      <span>All Products</span>
                    </button>
                  </div>

                  {/* ── 5-Column Category Grid (Sharp Divider Lines, Yellowish / Amber Headings) ── */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 divide-x divide-slate-200 dark:divide-slate-800/90 max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-950 scrollbar-thin">
                    {(MEGA_MENU_DATA[activeMegaDept]?.columns || []).map((col, colIdx) => (
                      <div
                        key={colIdx}
                        className={`p-4 sm:p-5 flex flex-col space-y-5 ${
                          colIdx % 2 === 1
                            ? "bg-amber-50/20 dark:bg-slate-900/20"
                            : "bg-white dark:bg-slate-950"
                        }`}
                      >
                        {col.sections.map((section, secIdx) => (
                          <div key={secIdx} className="space-y-1.5">
                            {/* Yellowish / Warm Amber Header */}
                            <h4 className="text-[13.5px] font-bold tracking-tight text-amber-600 dark:text-amber-400">
                              {section.title}
                            </h4>
                            {/* Item Links */}
                            <div className="flex flex-col space-y-1 pt-0.5">
                              {section.links.map((link) => (
                                <button
                                  key={link.name}
                                  type="button"
                                  onClick={() => {
                                    setSelectedCategoryLabel(link.name);
                                    setSearchCategory(link.query || link.name.toLowerCase());
                                    setCategoriesOpen(false);
                                    navigate(`/product?search=${encodeURIComponent(link.query || link.name)}`);
                                  }}
                                  className="text-left text-[13px] text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:font-bold py-0.5 leading-snug transition-colors cursor-pointer truncate"
                                  title={link.name}
                                >
                                  {link.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  {/* ── Footer Strip (Sharp Corners, Clean Trust Items) ── */}
                  <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <span className="text-amber-500">✨</span> 100% Original Brands
                      </span>
                      <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
                      <span className="hidden sm:flex items-center gap-1.5">
                        <Truck size={13} className="text-emerald-500" /> Free Shipping ₹499+
                      </span>
                      <span className="hidden md:inline text-slate-300 dark:text-slate-700">|</span>
                      <span className="hidden md:flex items-center gap-1.5">
                        <RotateCcw size={13} className="text-blue-500" /> Easy 14-Day Returns
                      </span>
                    </div>
                    <Link
                      to="/categories"
                      onClick={() => setCategoriesOpen(false)}
                      className="font-bold text-[#FF6A00] hover:text-[#e55f00] flex items-center gap-1 hover:underline transition"
                    >
                      <span>Explore All Categories</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </nav>
      </header>

      {/* ═══════════ MOBILE SEARCH OVERLAY ═══════════ */}
      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col lg:hidden"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
              <div className="flex flex-1 items-center gap-2 rounded-xl border border-amber-400 bg-amber-50/40 dark:bg-slate-900 ring-2 ring-amber-500/15 px-3 py-2">
                <Search size={16} className="text-amber-500 shrink-0" />
                <input
                  ref={mobileSearchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitSearch();
                  }}
                  placeholder="Search products, brands…"
                  className="flex-1 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 outline-none font-medium"
                />
                {searchValue && (
                  <button
                    onClick={() => setSearchValue("")}
                    className="text-slate-400 cursor-pointer hover:text-slate-600 transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setMobileSearchOpen(false);
                  setSearchValue("");
                }}
                className="text-sm font-bold text-amber-500 cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {suggestions.length > 0 ? (
                <div className="py-2">
                  <p className="px-4 pt-2 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <TrendingUp size={10} /> Suggestions
                  </p>
                  {suggestions.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => {
                        submitSearch(p.name);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900 transition cursor-pointer"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                        <img
                          src={
                            p.images?.[0]?.startsWith("http")
                              ? p.images[0]
                              : `${backendUrl}/${p.images?.[0]}`
                          }
                          alt={p.name}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide">
                          {p.category}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-slate-700 dark:text-slate-300">
                        ₹{p.price}
                      </span>
                    </button>
                  ))}
                </div>
              ) : searchValue ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-8">
                  <Search size={40} className="text-slate-200 dark:text-slate-800 mb-4" />
                  <p className="text-sm font-semibold text-slate-500">
                    No results for "<span className="text-amber-500">{searchValue}</span>"
                  </p>
                </div>
              ) : (
                <div className="px-4 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
                    <TrendingUp size={10} /> Popular Categories
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {displayCategories.slice(0, 4).map(({ label, to, emoji }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileSearchOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl border border-slate-200 dark:border-slate-800 p-3 hover:border-amber-300 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950/10 transition cursor-pointer"
                      >
                        <span className="text-xl">{emoji}</span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {searchValue && (
                <div className="border-t border-slate-100 dark:border-slate-800 p-4">
                  <button
                    onClick={() => submitSearch()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 hover:bg-amber-600 active:scale-95 transition cursor-pointer"
                  >
                    <Search size={14} />
                    Search all results for "{searchValue}"
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════ MOBILE MENU DRAWER OVERLAY (SLIDE FROM RIGHT) ═══════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[90] bg-slate-950/60 backdrop-blur-xs md:hidden"
            />

            {/* Slide-over Drawer Panel from Right */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed inset-y-0 right-0 z-[100] w-80 max-w-[85vw] bg-white dark:bg-slate-950 shadow-2xl flex flex-col md:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-2">
                  <Logo className="h-7 w-auto text-slate-900 dark:text-white" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                    Menu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Mobile Quick Search Button */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setMobileSearchOpen(true);
                  }}
                  className="flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400"
                >
                  <Search size={14} className="text-amber-500" />
                  <span>Search products, categories...</span>
                </button>

                {/* Navigation Quick Links */}
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 mb-1">
                    Menu Navigation
                  </p>
                  {[
                    { icon: Home, label: "Home", to: "/" },
                    { icon: LayoutGrid, label: "All Categories", to: "/categories" },
                    { icon: Heart, label: "Wishlist", to: "/wishlist" },
                    { icon: Package, label: "Orders", to: "/orderdetail" },
                    { icon: Globe, label: "Social Feed", to: "/social" },
                    { icon: HelpCircle, label: "Help & Support", to: "/help" },
                    {
                      icon: Store,
                      label: "Become a Seller",
                      externalUrl: "https://cartnow-seller.vercel.app/",
                      isExternal: true,
                    },
                    {
                      icon: Truck,
                      label: "Join as Deliveryman",
                      externalUrl: "https://cart-now-deliveryagent.vercel.app/",
                      isExternal: true,
                    },
                  ].map((item) => (
                    <div key={item.label}>
                      {item.isExternal ? (
                        <a
                          href={item.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon size={14} className="text-amber-500" />
                            <span>{item.label}</span>
                          </div>
                          <ExternalLink size={12} className="opacity-60" />
                        </a>
                      ) : (
                        <Link
                          to={item.to}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon size={14} className="text-slate-400" />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight size={12} className="text-slate-400" />
                        </Link>
                      )}
                    </div>
                  ))}
                </div>

                {/* Preferences: Theme & Language */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                    Preferences
                  </p>

                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      {isDarkMode ? <Moon size={14} className="text-amber-400" /> : <Sun size={14} className="text-amber-500" />}
                      <span>Dark Mode</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className={`relative h-5 w-9 rounded-full transition-colors cursor-pointer border-none ${isDarkMode ? "bg-slate-700" : "bg-slate-300"
                        }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow transition-transform ${isDarkMode ? "translate-x-4" : "translate-x-0"
                          }`}
                      >
                        {isDarkMode ? <Moon size={9} className="text-slate-800" /> : <Sun size={9} className="text-amber-500" />}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span>🇮🇳</span>
                      <span>Language</span>
                    </span>
                    <select
                      value={language}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="h-6 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-[10px] font-extrabold text-slate-800 dark:text-slate-200 cursor-pointer"
                    >
                      <option value="en">English (EN)</option>
                      <option value="hi">Hindi (HI)</option>
                      <option value="es">Español (ES)</option>
                    </select>
                  </div>
                </div>

                {/* Account / Login Action */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 pb-6">
                  {token ? (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <LogOut size={14} />
                        <span>{t("logout")}</span>
                      </div>
                      <ChevronRight size={12} />
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 rounded-xl bg-amber-500 text-slate-950 text-center text-xs font-black uppercase tracking-wider"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider"
                      >
                        Sign Up
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════ MOBILE BOTTOM NAV ═══════════ */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.4)]">
        <div className="flex h-16 items-end justify-around pb-2 px-2 safe-area-inset-bottom">
          {BOTTOM_NAV.map(({ label, icon: Icon, to, isProfile }) => {
            if (isProfile) {
              const active =
                location.pathname === "/profile" ||
                location.pathname === "/login" ||
                location.pathname === "/signup";
              return (
                <button
                  key="profile"
                  onClick={() => {
                    if (token) {
                      navigate("/profile");
                    } else {
                      navigate("/login", {
                        state: { from: { pathname: "/profile" } },
                      });
                    }
                  }}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${active ? "text-[#F43F5E]" : "text-slate-500 dark:text-slate-400"
                    }`}
                >
                  <div
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full transition-all ${active
                        ? "bg-[#F43F5E] text-slate-100 dark:text-white shadow-md shadow-[#F43F5E]/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    {token && initials ? (
                      <span className="text-[11px] font-black">{initials}</span>
                    ) : (
                      <Icon size={14} />
                    )}
                  </div>
                  <span
                    className={`text-[9px] font-bold transition-colors ${active ? "text-[#F43F5E]" : "text-slate-400 dark:text-slate-600"
                      }`}
                  >
                    {label}
                  </span>
                </button>
              );
            }
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all relative ${active ? "text-[#F43F5E]" : "text-slate-400 dark:text-slate-400"
                  }`}
              >
                <div
                  className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all ${active
                      ? "bg-rose-100 dark:bg-rose-950/30 text-[#F43F5E]"
                      : ""
                    }`}
                >
                  <Icon size={17} />
                  {label === "Orders" && token && (
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#F43F5E]" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold transition-colors ${active ? "text-[#F43F5E]" : "text-slate-400 dark:text-slate-500"
                    }`}
                >
                  {label}
                </span>
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#F43F5E]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;
