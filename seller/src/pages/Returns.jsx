import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";
import ReturnsControlPanel from "../components/returns/ReturnsControlPanel";
import ReturnsTableView from "../components/returns/ReturnsTableView";
import ReturnsCardsView from "../components/returns/ReturnsCardsView";
import ReturnDetailModal from "../components/returns/ReturnDetailModal";

const Returns = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [assignedDrivers, setAssignedDrivers] = useState({});
  const [loading, setLoading] = useState(false);
  const [processingRefundId, setProcessingRefundId] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"

  // Date filters
  const [datePreset, setDatePreset] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modal inspection
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState(null);

  const fetchReturns = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/seller/returns`, {
        headers: { token }
      });
      if (response.data.success) {
        setRequests(response.data.returns || []);
      } else {
        toast.error(response.data.message || "Failed to fetch returns");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchDrivers = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/api/seller/deliverymen`, {
        headers: { token }
      });
      if (res.data.success) {
        setDrivers(res.data.drivers || []);
      }
    } catch (e) {
      console.log("Could not fetch deliverymen:", e.message);
    }
  }, [token]);

  useEffect(() => {
    fetchReturns();
    fetchDrivers();
  }, [fetchReturns, fetchDrivers]);

  // ================= 1. FILTERING & SORTING =================
  const processedReturns = useMemo(() => {
    let result = [...requests];
    const q = searchQuery.toLowerCase().trim();

    // 1. Keyword search
    if (q) {
      result = result.filter((r) => {
        const id = (r._id || "").toLowerCase();
        const reqNum = (r.requestNumber || "").toLowerCase();
        const orderId = String(r.orderId?._id || r.orderId || "").toLowerCase();
        const itemName = (r.itemName || "").toLowerCase();
        const reason = (r.reason || r.returnReason || "").toLowerCase();
        const feedback = (r.feedback || r.customerDescription || "").toLowerCase();
        const code = (r.verificationCode || "").toLowerCase();

        return (
          id.includes(q) ||
          reqNum.includes(q) ||
          orderId.includes(q) ||
          itemName.includes(q) ||
          reason.includes(q) ||
          feedback.includes(q) ||
          code.includes(q)
        );
      });
    }

    // 2. Status Filter
    if (statusFilter !== "All") {
      result = result.filter((r) => {
        const s = (r.status || "Requested").toLowerCase();
        if (statusFilter === "Pending") {
          return s.includes("request") || s.includes("pending") || s.includes("review");
        }
        if (statusFilter === "In Pickup") {
          return s.includes("pickup") || s.includes("transit") || s.includes("approved");
        }
        if (statusFilter === "Completed") {
          return s.includes("complete") || s.includes("refunded") || s.includes("done");
        }
        if (statusFilter === "Rejected") {
          return s.includes("reject") || s.includes("cancel");
        }
        return true;
      });
    }

    // 3. Return Type Filter
    if (typeFilter !== "All") {
      result = result.filter((r) => {
        const t = (r.returnType || "Refund").toLowerCase();
        return t === typeFilter.toLowerCase();
      });
    }

    // 4. Date Range Filter
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      result = result.filter((r) => new Date(r.createdAt || 0) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter((r) => new Date(r.createdAt || 0) <= end);
    }

    // 5. Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      const amtA = Number(a.amount) || 0;
      const amtB = Number(b.amount) || 0;

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "amount_high") return amtB - amtA;
      if (sortBy === "amount_low") return amtA - amtB;
      return 0;
    });

    return result;
  }, [requests, searchQuery, statusFilter, typeFilter, startDate, endDate, sortBy]);

  // ================= 2. RMA ACTIONS =================
  const handleStatusUpdate = async (requestId, status) => {
    try {
      const request = requests.find((r) => r._id === requestId);
      const originalDriverId = request?.orderId?.deliverymanId || request?.deliverymanId || "";
      const deliverymanId = assignedDrivers[requestId] || originalDriverId || "";

      const payload = {
        requestId,
        status,
        sellerNotes: request?.adminNote || "",
        deliverymanId
      };

      const response = await axios.post(
        `${backendUrl}/api/rms/request/review`,
        payload,
        { headers: { token, seller_token: token } }
      );

      if (response.data.success) {
        toast.success(`Return request ${status.toLowerCase()} successfully.`);
        fetchReturns();
      } else {
        toast.error(response.data.message || "Failed to update return status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const handleProcessRefund = async (requestId) => {
    try {
      setProcessingRefundId(requestId);
      const res = await axios.post(
        `${backendUrl}/api/rms/refund/process`,
        { rmaId: requestId },
        { headers: { token, seller_token: token } }
      );
      if (res.data.success) {
        toast.success(`Refund processed & marked as complete! ₹${res.data.refund?.amount || ""} credited.`);
        setRequests((prev) =>
          prev.map((req) => (req._id === requestId ? { ...req, status: "Completed" } : req))
        );
        fetchReturns();
      } else {
        toast.error(res.data.message || "Failed to process refund");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error processing refund");
    } finally {
      setProcessingRefundId(null);
    }
  };

  // ================= 3. EXPORT HELPERS =================
  const handleExportCSV = () => {
    if (processedReturns.length === 0) {
      toast.info("No returns to export with current filters");
      return;
    }

    const headers = [
      "RMA ID",
      "Order ID",
      "Date",
      "Item Name",
      "Quantity",
      "Amount (INR)",
      "Return Type",
      "Exchange Size",
      "Return Reason",
      "Pickup Code",
      "Status"
    ];

    const rows = processedReturns.map((r) => [
      `"${r._id || ""}"`,
      `"${r.orderId?._id || r.orderId || ""}"`,
      `"${new Date(r.createdAt || 0).toLocaleDateString()}"`,
      `"${r.itemName || "Item"}"`,
      r.quantity || 1,
      Number(r.amount || 0).toFixed(2),
      `"${r.returnType || "Refund"}"`,
      `"${r.exchangeSize || r.exchangeDetails?.requestedSize || ""}"`,
      `"${r.reason || r.returnReason || ""}"`,
      `"${r.verificationCode || ""}"`,
      `"${r.status || "Requested"}"`
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cartnow_returns_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Returns exported to CSV!");
  };

  const handleExportJSON = () => {
    if (processedReturns.length === 0) {
      toast.info("No returns to export with current filters");
      return;
    }

    const jsonContent = JSON.stringify(processedReturns, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cartnow_returns_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Returns exported to JSON!");
  };

  return (
    <div className="space-y-4 pb-12 text-slate-800 dark:text-slate-100">
      {/* Control Panel: Header, 4 KPIs, Search, Date Presets & Filter Tabs */}
      <ReturnsControlPanel
        returns={requests}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
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
        onRefresh={fetchReturns}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        loading={loading}
        totalFilteredCount={processedReturns.length}
      />

      {/* Main Display: Table View or Cards View */}
      {viewMode === "table" ? (
        <ReturnsTableView
          returns={processedReturns}
          drivers={drivers}
          assignedDrivers={assignedDrivers}
          setAssignedDrivers={setAssignedDrivers}
          onOpenDetails={(req) => setSelectedRequestForDetail(req)}
          onStatusUpdate={handleStatusUpdate}
          onProcessRefund={handleProcessRefund}
          processingRefundId={processingRefundId}
        />
      ) : (
        <ReturnsCardsView
          returns={processedReturns}
          drivers={drivers}
          assignedDrivers={assignedDrivers}
          setAssignedDrivers={setAssignedDrivers}
          onOpenDetails={(req) => setSelectedRequestForDetail(req)}
          onStatusUpdate={handleStatusUpdate}
          onProcessRefund={handleProcessRefund}
          processingRefundId={processingRefundId}
        />
      )}

      {/* Return Details & Settlement Modal */}
      <ReturnDetailModal
        isOpen={!!selectedRequestForDetail}
        onClose={() => setSelectedRequestForDetail(null)}
        request={selectedRequestForDetail}
        drivers={drivers}
        assignedDrivers={assignedDrivers}
        setAssignedDrivers={setAssignedDrivers}
        onStatusUpdate={handleStatusUpdate}
        onProcessRefund={handleProcessRefund}
        isProcessingRefund={processingRefundId === selectedRequestForDetail?._id}
      />
    </div>
  );
};

export default Returns;
