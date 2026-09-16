import {
  Crown,
  Truck,
  ShoppingBag,
  Headphones,
  BadgeDollarSign,
  Sparkles,
  Store,
  Shield,
  Sliders,
  XCircle,
  Package,
  RotateCcw,
  Users,
  Layers,
  Lock,
  CheckCircle2,
  Tag,
  ShieldCheck,
  UserCheck,
  Building2,
  Boxes,
  HelpCircle,
} from "lucide-react";

/**
 * 8 Standard E-Commerce Role Presets + Custom Role
 */
export const ROLE_PRESETS = [
  {
    id: "operations_director",
    name: "Operations Director",
    tagline: "Full Operational Co-Admin",
    desc: "Complete operational management across orders, catalog, RMA, fleet, sellers, customers, support, promos & finance.",
    icon: Crown,
    color: "indigo",
    badgeClasses: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70",
    pillClasses: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
    borderActive: "border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30",
    permissions: [
      "orders",
      "products",
      "returns",
      "deliverymen",
      "sellers",
      "customers",
      "support",
      "promos",
      "finance",
    ],
  },
  {
    id: "order_logistics",
    name: "Order & Logistics Lead",
    tagline: "Fulfillment & Fleet Dispatch",
    desc: "Oversee order processing, fulfillment pipelines, delivery driver dispatching, and customer return inspections.",
    icon: Truck,
    color: "blue",
    badgeClasses: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/70",
    pillClasses: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/60",
    borderActive: "border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/30",
    permissions: ["orders", "returns", "deliverymen"],
  },
  {
    id: "catalog_manager",
    name: "Catalog & Merchandising",
    tagline: "Product Curation & Deals",
    desc: "Moderate product listings, curate brand categories, organize inventories, and configure promotional campaigns.",
    icon: ShoppingBag,
    color: "purple",
    badgeClasses: "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/70",
    pillClasses: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/60",
    borderActive: "border-purple-500 dark:border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40 dark:bg-purple-950/30",
    permissions: ["products", "promos"],
  },
  {
    id: "customer_support",
    name: "Customer Support Lead",
    tagline: "Helpdesk & Customer Care",
    desc: "Handle customer inquiries, support tickets, user profile lookups, order tracking, and RMA return triage.",
    icon: Headphones,
    color: "emerald",
    badgeClasses: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/70",
    pillClasses: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
    borderActive: "border-emerald-500 dark:border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/30",
    permissions: ["support", "returns", "orders", "customers"],
  },
  {
    id: "finance_auditor",
    name: "Finance & Revenue Auditor",
    tagline: "Financial Analytics & Payouts",
    desc: "Inspect revenue streams, platform commissions, merchant payout schedules, and regenerate tax invoices.",
    icon: BadgeDollarSign,
    color: "amber",
    badgeClasses: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/70",
    pillClasses: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
    borderActive: "border-amber-500 dark:border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/30",
    permissions: ["finance", "orders", "sellers"],
  },
  {
    id: "marketing_specialist",
    name: "Marketing & Growth",
    tagline: "Promos & Customer Campaigns",
    desc: "Create discount coupon codes, flash sale deals, hero banners, and analyze customer promotional reception.",
    icon: Sparkles,
    color: "rose",
    badgeClasses: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/70",
    pillClasses: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/60",
    borderActive: "border-rose-500 dark:border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40 dark:bg-rose-950/30",
    permissions: ["promos", "products", "customers"],
  },
  {
    id: "vendor_manager",
    name: "Vendor Relations Manager",
    tagline: "Merchant Onboarding & Fees",
    desc: "Onboard merchants, configure vendor commissions, audit seller product submissions, and review payouts.",
    icon: Store,
    color: "teal",
    badgeClasses: "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/70",
    pillClasses: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/60",
    borderActive: "border-teal-500 dark:border-teal-500 ring-2 ring-teal-500/20 bg-teal-50/40 dark:bg-teal-950/30",
    permissions: ["sellers", "products", "finance"],
  },
  {
    id: "governance_officer",
    name: "Platform Governance Officer",
    tagline: "Staff Security & Access Control",
    desc: "Provision sub-administrators, delegate role privileges, audit staff credentials, and moderate user access.",
    icon: Shield,
    color: "cyan",
    badgeClasses: "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/70",
    pillClasses: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/60",
    borderActive: "border-cyan-500 dark:border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-50/40 dark:bg-cyan-950/30",
    permissions: ["subadmins", "customers"],
  },
];

/**
 * 4 Logical Functional Permission Groups
 */
export const PERMISSION_GROUPS = [
  {
    id: "fulfillment",
    title: "Fulfillment & Operations",
    icon: Truck,
    badge: "Operations",
    color: "blue",
    description: "Order dispatch, status workflows, RMA returns & delivery fleet",
    modules: [
      { id: "orders", label: "Orders Management", desc: "Process orders, change shipping stages, and inspect tracking details" },
      { id: "returns", label: "Returns & RMA", desc: "Audit return requests, perform RMA inspections, and authorize refunds" },
      { id: "deliverymen", label: "Delivery Fleet", desc: "Manage drivers, assign operational dispatch zones, and review ratings" },
    ],
  },
  {
    id: "catalog",
    title: "Catalog & Commerce",
    icon: ShoppingBag,
    badge: "Commercial",
    color: "purple",
    description: "Product listings, merchant seller accounts & customer directories",
    modules: [
      { id: "products", label: "Product Catalog", desc: "Manage listings, approve submissions, categories, and brands" },
      { id: "sellers", label: "Sellers & Vendors", desc: "Approve merchant accounts, configure commissions, and review payouts" },
      { id: "customers", label: "Customer Accounts", desc: "Access user profiles, shipping addresses, and account suspensions" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing & Support",
    icon: Headphones,
    badge: "Engagement",
    color: "rose",
    description: "Campaign coupons, hero banner models & customer help tickets",
    modules: [
      { id: "promos", label: "Marketing & Promos", desc: "Configure promo coupons, sales campaigns, and homepage hero models" },
      { id: "support", label: "Support & Inquiries", desc: "Respond to customer help tickets, resolve disputes, and manage inquiries" },
    ],
  },
  {
    id: "governance",
    title: "Finance & Security Governance",
    icon: Shield,
    badge: "High Security",
    color: "amber",
    description: "Financial analytics, invoices & sub-administrator governance",
    modules: [
      { id: "finance", label: "Finance & Invoices", desc: "Review revenue analytics, platform fees, and regenerate VAT invoices" },
      { id: "subadmins", label: "Staff & Sub-Admins", desc: "Create, configure, and govern sub-administrator accounts", sensitive: true },
    ],
  },
];

/**
 * All 10 flat module definitions
 */
export const ALL_AVAILABLE_MODULES = PERMISSION_GROUPS.flatMap((g) => g.modules);

/**
 * Smart detection function to match permissions array to a defined Role Preset
 */
export const detectRolePreset = (permissions = []) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return {
      id: "none",
      name: "No Permissions Assigned",
      tagline: "Restricted Account",
      desc: "Account has no operational module access",
      icon: XCircle,
      color: "slate",
      badgeClasses: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      pillClasses: "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700",
      borderActive: "border-slate-400",
      permissions: [],
    };
  }

  // Root Superadmin wildcard
  if (permissions.includes("*")) {
    return {
      id: "superadmin",
      name: "Root Superadmin",
      tagline: "Unrestricted Master Access",
      desc: "Full unrestricted platform master control",
      icon: Crown,
      color: "indigo",
      badgeClasses: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/70",
      pillClasses: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/60",
      borderActive: "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30",
      permissions,
    };
  }

  const sortedPerms = [...permissions].sort().join(",");

  for (const preset of ROLE_PRESETS) {
    const presetSorted = [...preset.permissions].sort().join(",");
    if (sortedPerms === presetSorted) {
      return preset;
    }
  }

  return {
    id: "custom",
    name: "Custom Role",
    tagline: `${permissions.length} Modules Assigned`,
    desc: `Customized combination of ${permissions.length} operational module privileges`,
    icon: Sliders,
    color: "slate",
    badgeClasses: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    pillClasses: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700",
    borderActive: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/30",
    permissions,
  };
};
