import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import ReviewsControlPanel from "../components/reviews/ReviewsControlPanel";
import ReviewsCardsView from "../components/reviews/ReviewsCardsView";
import ReviewsTableView from "../components/reviews/ReviewsTableView";
import ReviewDetailModal from "../components/reviews/ReviewDetailModal";

const Reviews = ({ token, products = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittingReplyId, setSubmittingReplyId] = useState(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [starFilter, setStarFilter] = useState("all");
  const [replyFilter, setReplyFilter] = useState("all"); // "all" | "unanswered" | "replied"
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  // Date Filters
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Inspection Modal
  const [selectedReviewForDetail, setSelectedReviewForDetail] = useState(null);

  // 1. Fetch Reviews
  const fetchReviews = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${backendUrl}/api/seller/reviews`, {
        headers: { token }
      });
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      } else {
        toast.error(res.data.message || "Failed to fetch reviews");
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // 2. Product Map Helper
  const productMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (p._id) map[p._id] = p;
      if (p.name) map[p.name.toLowerCase()] = p;
    });
    return map;
  }, [products]);

  // 3. Post / Update Official Reply
  const handleSendReply = async (reviewId, productId, text) => {
    if (!text?.trim()) {
      toast.error("Reply text cannot be empty");
      return false;
    }
    try {
      setSubmittingReplyId(reviewId);
      const res = await axios.post(
        `${backendUrl}/api/seller/review/reply`,
        { productId, reviewId, reply: text.trim() },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Official reply posted successfully!");
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, reply: text.trim() } : r))
        );
        fetchReviews();
        return true;
      } else {
        toast.error(res.data.message || "Failed to post reply");
        return false;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      return false;
    } finally {
      setSubmittingReplyId(null);
    }
  };

  // 4. Filtering & Sorting
  const processedReviews = useMemo(() => {
    let result = [...reviews];
    const q = searchQuery.toLowerCase().trim();

    // 1. Keyword search
    if (q) {
      result = result.filter((r) => {
        const matchedProd = productMap[r.productId] || productMap[r.productName?.toLowerCase()];
        const prodName = (matchedProd?.name || r.productName || "").toLowerCase();
        const reviewerName = (r.name || "").toLowerCase();
        const comment = (r.comment || "").toLowerCase();
        const reply = (r.reply || "").toLowerCase();
        const category = (matchedProd?.category || "").toLowerCase();

        return (
          prodName.includes(q) ||
          reviewerName.includes(q) ||
          comment.includes(q) ||
          reply.includes(q) ||
          category.includes(q)
        );
      });
    }

    // 2. Star Filter
    if (starFilter !== "all") {
      result = result.filter((r) => String(r.rating) === String(starFilter));
    }

    // 3. Response Filter
    if (replyFilter === "unanswered") {
      result = result.filter((r) => !r.reply || !r.reply.trim());
    } else if (replyFilter === "replied") {
      result = result.filter((r) => r.reply && r.reply.trim());
    }

    // 4. Date Filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.date || r.createdAt || 0) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.date || r.createdAt || 0) <= end);
    }

    // 5. Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt || 0).getTime();
      const dateB = new Date(b.date || b.createdAt || 0).getTime();
      const rateA = Number(a.rating) || 0;
      const rateB = Number(b.rating) || 0;

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "rating_high") return rateB - rateA;
      if (sortBy === "rating_low") return rateA - rateB;
      return 0;
    });

    return result;
  }, [reviews, searchQuery, starFilter, replyFilter, startDate, endDate, sortBy, productMap]);

  // 5. Export Handlers
  const handleExportCSV = () => {
    if (processedReviews.length === 0) {
      toast.info("No reviews to export with current filters");
      return;
    }

    const headers = [
      "Review ID",
      "Product Name",
      "Product Category",
      "Customer Name",
      "Rating",
      "Comment",
      "Official Reply",
      "Date"
    ];

    const rows = processedReviews.map((r) => {
      const matchedProd = productMap[r.productId] || productMap[r.productName?.toLowerCase()];
      return [
        `"${r._id || ""}"`,
        `"${(matchedProd?.name || r.productName || "Item").replace(/"/g, '""')}"`,
        `"${matchedProd?.category || "Catalog"}"`,
        `"${(r.name || "Customer").replace(/"/g, '""')}"`,
        r.rating || 5,
        `"${(r.comment || "").replace(/"/g, '""')}"`,
        `"${(r.reply || "").replace(/"/g, '""')}"`,
        `"${new Date(r.date || r.createdAt || 0).toLocaleDateString()}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cartnow_reviews_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reviews exported to CSV!");
  };

  const handleExportJSON = () => {
    if (processedReviews.length === 0) {
      toast.info("No reviews to export with current filters");
      return;
    }

    const jsonContent = JSON.stringify(processedReviews, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cartnow_reviews_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Reviews exported to JSON!");
  };

  return (
    <div className="space-y-4 pb-12 text-slate-800 dark:text-slate-100">
      {/* ── Control Panel: Header, 4 KPIs, Rating Analytics, Search & Filter Tabs ── */}
      <ReviewsControlPanel
        reviews={reviews}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        starFilter={starFilter}
        setStarFilter={setStarFilter}
        replyFilter={replyFilter}
        setReplyFilter={setReplyFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        datePreset={datePreset}
        setDatePreset={setDatePreset}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onRefresh={fetchReviews}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        loading={loading}
        totalFilteredCount={processedReviews.length}
      />

      {/* ── Main Display: Cards View or Dense Table View ── */}
      {viewMode === "cards" ? (
        <ReviewsCardsView
          reviews={processedReviews}
          productMap={productMap}
          onOpenDetails={(r) => setSelectedReviewForDetail(r)}
          onSendReply={handleSendReply}
          submittingReplyId={submittingReplyId}
        />
      ) : (
        <ReviewsTableView
          reviews={processedReviews}
          productMap={productMap}
          onOpenDetails={(r) => setSelectedReviewForDetail(r)}
          onSendReply={handleSendReply}
          submittingReplyId={submittingReplyId}
        />
      )}

      {/* ── Detailed Review Inspection & Reply Modal ── */}
      <ReviewDetailModal
        isOpen={Boolean(selectedReviewForDetail)}
        onClose={() => setSelectedReviewForDetail(null)}
        review={selectedReviewForDetail}
        onSendReply={handleSendReply}
        isSubmitting={submittingReplyId === selectedReviewForDetail?._id}
      />
    </div>
  );
};

export default Reviews;
