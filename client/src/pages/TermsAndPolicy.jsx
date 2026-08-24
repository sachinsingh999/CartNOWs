import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  FileText,
  Lock,
  Truck,
  RotateCcw,
  Store,
  ChevronRight,
  Search,
  Printer,
  CheckCircle2,
  HelpCircle,
  Mail,
  ArrowUpRight,
} from "lucide-react";

const TermsAndPolicy = () => {
  const [activeTab, setActiveTab] = useState("terms");
  const [searchQuery, setSearchQuery] = useState("");

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    { id: "terms", label: "Terms of Service", icon: FileText },
    { id: "privacy", label: "Privacy Policy", icon: Lock },
    { id: "shipping", label: "Shipping & Delivery", icon: Truck },
    { id: "returns", label: "Returns & Refunds (RMA)", icon: RotateCcw },
    { id: "merchant", label: "Seller & Merchant Policy", icon: Store },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D14] text-slate-800 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* ── HEADER BANNER ── */}
        <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-sm p-6 lg:p-10 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-48 w-48 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/50 rounded-sm text-[10px] font-black uppercase tracking-wider">
                <ShieldCheck size={13} />
                <span>Legal & Trust Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                Terms of Service & Platform Policies
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 leading-relaxed">
                Last updated: <strong className="text-slate-700 dark:text-slate-300">August 25, 2026</strong>. Please read these terms carefully before accessing or using the CartNOW e-commerce ecosystem.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-sm text-xs font-black uppercase tracking-wider transition cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Document</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-xl text-left">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search policies (e.g. Refunds, Shipping, Cookies, Seller payout)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-sm text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 transition"
            />
          </div>
        </div>

        {/* ── MAIN LAYOUT GRID: SIDEBAR TABS + CONTENT AREA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* LEFT SIDEBAR NAVIGATION TABS */}
          <div className="lg:col-span-3 space-y-2 sticky top-20">
            <div className="bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-850 rounded-sm p-3 shadow-xs space-y-1">
              <span className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                Policy Categories
              </span>

              {sections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? "text-white" : "text-slate-400"} />
                      <span>{sec.label}</span>
                    </div>
                    <ChevronRight size={14} className={isActive ? "opacity-100" : "opacity-40"} />
                  </button>
                );
              })}
            </div>

            {/* Need Help Box */}
            <div className="bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-sm p-4 space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <HelpCircle size={18} />
                <h4 className="text-xs font-black uppercase tracking-wider">Have Legal Questions?</h4>
              </div>
              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                Contact our compliance and legal legal team directly for regulatory inquiries or contract clarifications.
              </p>
              <a
                href="mailto:legal@cartnow.com"
                className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Mail size={13} />
                <span>legal@cartnow.com</span>
                <ArrowUpRight size={12} />
              </a>
            </div>
          </div>

          {/* RIGHT CONTENT DISPLAY */}
          <div className="lg:col-span-9 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-sm p-6 sm:p-10 shadow-xs space-y-8 min-h-[600px]">
            
            {/* 1. TERMS OF SERVICE */}
            {activeTab === "terms" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <span>Terms of Service</span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Governing rules for customer account registration, transactions, and site usage.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">1. User Account Eligibility</h3>
                  <p>
                    By registering an account on CartNOW, you confirm that you are at least 18 years of age or possess legal parental consent. You agree to provide accurate, complete information and maintain the confidentiality of your login credentials.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">2. Order Acceptance & Pricing</h3>
                  <p>
                    All orders placed on CartNOW are subject to product availability and price confirmation. CartNOW reserves the right to cancel or refuse any order in cases of mispricing, inventory discrepancy, or suspected fraudulent activity.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">3. Acceptable Platform Use</h3>
                  <p>
                    Users must not exploit, scrape, reverse engineer, or attempt to bypass security measures on CartNOW. Automated bots, fake reviews, and unauthorized payment manipulations will result in immediate permanent account termination.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">4. Intellectual Property</h3>
                  <p>
                    All content on CartNOW including logos, branding assets, software code, UI interfaces, and product imagery are owned by or licensed to CartNOW. Unauthorized reproduction or commercial distribution is strictly prohibited.
                  </p>
                </div>
              </div>
            )}

            {/* 2. PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <Lock className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <span>Privacy Policy</span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    How CartNOW collects, encrypts, and protects your personal and payment data.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">1. Data We Collect</h3>
                  <p>
                    We collect essential information required to process your orders, including your name, email address, shipping delivery address, phone number, and transaction history.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">2. Payment & Credit Card Security</h3>
                  <p>
                    CartNOW does not store raw credit card numbers or UPI PINs on our servers. All financial transactions are processed securely through PCI-DSS Level 1 compliant gateway partners (Stripe, Razorpay) with 256-bit AES encryption.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">3. Cookie & Tracking Preferences</h3>
                  <p>
                    We use cookies to maintain active login sessions, remember cart items, and provide localized shopping preferences. You can manage cookie consents through your browser settings at any time.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">4. Third-Party Data Sharing</h3>
                  <p>
                    Your delivery details (address and contact number) are shared strictly with authorized logistics and delivery partners (e.g. CartNOW Courier Network) solely for order fulfillment. We never sell customer data to third-party advertisers.
                  </p>
                </div>
              </div>
            )}

            {/* 3. SHIPPING & DELIVERY POLICY */}
            {activeTab === "shipping" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <Truck className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <span>Shipping & Delivery Policy</span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Timelines, OTP delivery verification keys, and instant delivery SLAs.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">1. Delivery Timelines</h3>
                  <p>
                    Orders placed on CartNOW are processed within 24 hours. Express items are eligible for same-day or next-day delivery depending on pincode coverage. Standard delivery takes 2 to 4 business days.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">2. Delivery Verification Key (OTP)</h3>
                  <p>
                    For security purposes, high-value orders generate a 4-digit Delivery Verification Key on your order page. You must share this key with the delivery agent upon item arrival to confirm package receipt.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">3. Failed Delivery Attempts</h3>
                  <p>
                    If our delivery partner is unable to reach you after 3 attempts, the package will be returned to the merchant warehouse, and a refund will be initiated minus applicable transit charges.
                  </p>
                </div>
              </div>
            )}

            {/* 4. RETURNS & REFUNDS (RMA) */}
            {activeTab === "returns" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <RotateCcw className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <span>Returns & Refunds Policy (RMA)</span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    7-day return window, pickup verification, and seller refund processing.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">1. 7-Day Return Window</h3>
                  <p>
                    Most items purchased on CartNOW can be returned within 7 days of delivery for a full refund or exchange. Items must be in original condition with original tags and intact packaging.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">2. RMA Pickup & Inspection Workflow</h3>
                  <p>
                    Once a return request is submitted, an RMA record is generated. A delivery agent will inspect the item at pickup. Upon successful OTP verification by the delivery agent, the return status transitions to Picked Up.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">3. Refund Credit SLA</h3>
                  <p>
                    After item pickup and merchant verification, the refund amount will be credited to your original payment method (or bank account for COD) within 3 to 5 business days. Completed returns display a green <span className="text-emerald-600 font-bold">✓ Refund Completed</span> badge on your order page.
                  </p>
                </div>
              </div>
            )}

            {/* 5. SELLER & MERCHANT POLICY */}
            {activeTab === "merchant" && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <Store className="text-indigo-600 dark:text-indigo-400" size={20} />
                    <span>Seller & Merchant Policy</span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                    Merchant standards, catalog compliance, and payout schedules.
                  </p>
                </div>

                <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-300">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">1. Merchant Onboarding & Verification</h3>
                  <p>
                    Sellers on CartNOW must undergo identity verification and provide valid business registration credentials. Prohibited items, counterfeit products, or deceptive listings will result in immediate store suspension.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">2. Fulfillment & Return Processing SLAs</h3>
                  <p>
                    Sellers are required to dispatch confirmed orders within 24 hours and process customer return requests promptly upon delivery agent pickup.
                  </p>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase mt-4">3. Seller Payout Schedule</h3>
                  <p>
                    Net sales earnings (minus platform commissions) are remitted to the seller's registered bank account on a bi-weekly cycle following completion of the return window.
                  </p>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default TermsAndPolicy;
