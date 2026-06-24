import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Headset,
  MessageSquareText,
  ShieldQuestion,
  Ticket,
  Search,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MapPin,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { backendUrl } from "../config";

const categories = [
  "Order issue",
  "Return and refund",
  "Payment help",
  "Delivery support",
  "Account support",
  "Other",
];

const faqsList = [
  {
    id: 1,
    category: "order",
    question: "How do I track my active order status?",
    answer: "You can track your order status in real-time under the 'Orders' tab in your Profile. Once shipped, live tracking details and delivery partner contact info will be displayed.",
  },
  {
    id: 2,
    category: "refund",
    question: "What is the return policy and refund timeline?",
    answer: "We support a hassle-free 7-day return policy for most products. Once picked up, refunds are initiated instantly. Cards/UPI payments credit in 2-3 business days, COD refunds go to your Wallet.",
  },
  {
    id: 3,
    category: "payment",
    question: "Are my online card payments secure?",
    answer: "Absolutely. All transactions are processed using fully encrypted, PCI-compliant Stripe and Razorpay gateways. We do not store any card data on our servers.",
  },
  {
    id: 4,
    category: "delivery",
    question: "Can I change my delivery address after ordering?",
    answer: "Yes, you can edit the delivery address directly on your 'Orders' details page as long as the package is not dispatched. Once shipped, address redirection is not possible.",
  },
  {
    id: 5,
    category: "account",
    question: "How do I update my profile details?",
    answer: "Access the profile dropdown menu in the navbar and click 'Profile Settings'. Here you can update your name, email, delivery addresses, and login credentials securely.",
  },
];

const Help = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: categories[0],
    subject: "",
    message: "",
  });

  /* FAQ state */
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState("all");
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [expandedTicketId, setExpandedTicketId] = useState(null);

  const token = localStorage.getItem("token");

  const fetchTickets = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/api/service/help/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setTickets(response.data.helpRequests);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please login first.");
      return;
    }

    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in the subject and message.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${backendUrl}/api/service/help/create`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Help request submitted successfully.");
        setForm({
          category: categories[0],
          subject: "",
          message: "",
        });
        fetchTickets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* Filter FAQs */
  const filteredFaqs = faqsList.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedFaqCategory === "all" || faq.category === selectedFaqCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 py-10 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* ── HERO BANNER SECTION ── */}
      <div className="mx-auto max-w-7xl mb-12">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-12 shadow-sm">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 mb-4">
              <Sparkles size={11} /> CartNOW Concierge
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              How can we support you today?
            </h1>
            <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
              Search instant answers below or file a formal help request. Our customer support team typically reviews new tickets within 2 hours.
            </p>

            {/* Live Search Input */}
            <div className="mt-8 relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search queries, returns, refund status..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 shadow-sm transition-all font-medium"
              />
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5 pointer-events-none transform translate-y-8 translate-x-8">
            <Headset size={360} className="text-orange-500" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl grid gap-10 lg:grid-cols-12">
        
        {/* ── LEFT COLUMN: HELPDESK & FAQs (8 cols) ── */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Quick Support Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: RotateCcw, color: "text-rose-500 bg-rose-500/10", title: "Instant Return", desc: "Start refund request" },
              { icon: MapPin, color: "text-blue-500 bg-blue-500/10", title: "Track Shipment", desc: "Locate delivery agents" },
              { icon: CreditCard, color: "text-amber-500 bg-amber-500/10", title: "Secure Checkout", desc: "Payment validation" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.color} mb-3 group-hover:scale-105 transition-transform`}>
                  <item.icon size={18} />
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-white">{item.title}</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* FAQ Accordion Section */}
          <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="text-orange-500 h-5 w-5" />
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Frequently Answered FAQs</h2>
              </div>

              {/* FAQ Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "all", label: "All" },
                  { id: "order", label: "Orders" },
                  { id: "refund", label: "Returns" },
                  { id: "payment", label: "Payments" },
                ].map((pill) => (
                  <button
                    key={pill.id}
                    onClick={() => setSelectedFaqCategory(pill.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      selectedFaqCategory === pill.id
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350"
                    }`}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredFaqs.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-4 italic">No matching answers found for "{searchQuery}"</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredFaqs.map((faq) => {
                  const isOpen = expandedFaqId === faq.id;
                  return (
                    <div key={faq.id} className="py-4 first:pt-0 last:pb-0">
                      <button
                        onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                        className="flex w-full items-center justify-between text-left font-bold text-sm text-slate-800 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 transition-colors py-1 cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        {isOpen ? (
                          <ChevronUp size={16} className="text-orange-500 shrink-0 ml-4" />
                        ) : (
                          <ChevronDown size={16} className="text-slate-400 shrink-0 ml-4" />
                        )}
                      </button>
                      
                      {/* FAQ Expand Transition */}
                      <div className={`grid transition-all duration-200 ease-in-out ${
                        isOpen ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 overflow-hidden"
                      }`}>
                        <div className="overflow-hidden">
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed pl-1 font-medium">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Ticket Log / Support History */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Ticket className="text-orange-500 h-5 w-5" />
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">Support Requests Log</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Tracks responses, chat updates, and resolution statuses.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-10 text-center rounded-3xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-400">
                Loading support tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-dashed border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xs">
                <ShieldQuestion className="mx-auto h-12 w-12 text-slate-350 dark:text-slate-500" />
                <p className="mt-4 text-base font-black text-slate-800 dark:text-white">No tickets filed yet</p>
                <p className="mt-2 text-xs text-slate-450 dark:text-slate-500 font-medium max-w-sm mx-auto">
                  If you have a problem with an order or account settings, file a new request in the panel and we'll reply here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => {
                  const isExpanded = expandedTicketId === ticket._id;
                  const dotColor =
                    ticket.status === "Open"
                      ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                      : ticket.status === "In Progress"
                      ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]";

                  return (
                    <article
                      key={ticket._id}
                      className="rounded-3xl border border-slate-200/70 dark:border-slate-805 bg-white dark:bg-slate-900/50 p-6 shadow-sm hover:border-slate-300 dark:hover:border-slate-700/60 transition-all duration-300"
                    >
                      <div
                        onClick={() => setExpandedTicketId(isExpanded ? null : ticket._id)}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            {ticket.category}
                          </span>
                          <h3 className="text-base font-black text-slate-800 dark:text-white mt-1 truncate hover:text-orange-500 transition-colors">
                            {ticket.subject}
                          </h3>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-1">
                            Filed on {new Date(ticket.createdAt).toLocaleString("en-IN")}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                          <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80">
                            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
                            <span className="text-[10px] uppercase text-slate-650 dark:text-slate-400">{ticket.status}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp size={16} className="text-slate-400" />
                          ) : (
                            <ChevronDown size={16} className="text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Ticket Timeline Expand Panel */}
                      <div className={`grid transition-all duration-300 ease-in-out ${
                        isExpanded ? "grid-rows-[1fr] opacity-100 mt-5 border-t border-slate-100 dark:border-slate-800/60 pt-4" : "grid-rows-[0fr] opacity-0 overflow-hidden"
                      }`}>
                        <div className="overflow-hidden space-y-4">
                          
                          {/* User Message */}
                          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/50 p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                            <div className="mb-2 flex items-center gap-2 font-black text-[11px] uppercase tracking-wider text-slate-450 dark:text-slate-400">
                              <MessageSquareText className="h-3.5 w-3.5 text-orange-500" />
                              Your Enquiry
                            </div>
                            <p className="leading-relaxed font-medium">{ticket.message}</p>
                          </div>

                          {/* Admin Reply */}
                          {ticket.adminReply ? (
                            <div className="rounded-2xl bg-green-500/[0.04] dark:bg-green-500/[0.02] p-4 text-xs sm:text-sm text-slate-700 dark:text-slate-350 border border-green-500/10 dark:border-green-500/5">
                              <div className="mb-2 flex items-center gap-2 font-black text-[11px] uppercase tracking-wider text-green-500 dark:text-green-400">
                                <Headset className="h-3.5 w-3.5 text-green-500" />
                                Support Executive Response
                              </div>
                              <p className="leading-relaxed font-medium">{ticket.adminReply}</p>
                            </div>
                          ) : (
                            <div className="rounded-2xl bg-amber-500/[0.04] p-4 text-xs text-amber-600 dark:text-amber-400/80 border border-amber-500/10">
                              <div className="flex items-center gap-2 font-semibold">
                                <Clock size={13} className="animate-spin text-amber-500" />
                                <span>Awaiting Support Team Review. Your request is queued.</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN: FILING NEW SUPPORT TICKET (4 cols) ── */}
        <div className="lg:col-span-4">
          <section className="sticky top-20 rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white dark:bg-slate-900/50 p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 shrink-0">
                <Headset className="h-4.5 w-4.5" />
              </div>
              <div>
                <h2 className="text-md font-black text-slate-900 dark:text-white">Submit Help Request</h2>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Please provide specific details.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4.5">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Category</label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-350 outline-none focus:border-orange-500 transition-colors"
                >
                  {categories.map((item) => (
                    <option key={item} value={item} className="bg-white dark:bg-slate-900">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Subject</label>
                <input
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subject: event.target.value }))
                  }
                  placeholder="e.g. Order status missing, Refund fail"
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 placeholder-slate-400 transition-colors font-semibold"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Message Details</label>
                <textarea
                  rows="5"
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Include transaction IDs, product names, dates, or address details if applicable..."
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-orange-500 placeholder-slate-400 resize-none transition-colors font-medium leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-1.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs py-3.5 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-98 transition disabled:opacity-60 cursor-pointer border-none uppercase tracking-wider select-none"
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <span>Submit Enquiry</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          </section>
        </div>
        
      </div>
    </div>
  );
};

export default Help;
