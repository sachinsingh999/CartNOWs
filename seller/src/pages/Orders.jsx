import React, { useState, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";
import OrdersControlPanel from "../components/orders/OrdersControlPanel";
import OrdersTableView from "../components/orders/OrdersTableView";
import OrdersCardsView from "../components/orders/OrdersCardsView";
import OrderDetailModal from "../components/orders/OrderDetailModal";
import PackingSlipModal from "../components/orders/PackingSlipModal";

const Orders = ({
  orders = [],
  fetchOrders,
  token,
  seller,
  products = [],
  loading = false
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table" | "cards"

  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState(null);
  const [selectedOrderForPackingSlip, setSelectedOrderForPackingSlip] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // ================= 1. FILTERING & SORTING =================
  const processedOrders = useMemo(() => {
    let result = [...orders];
    const q = searchQuery.toLowerCase().trim();

    // 1. Keyword search
    if (q) {
      result = result.filter((o) => {
        const id = (o._id || "").toLowerCase();
        const orderNum = (o.orderNumber || "").toLowerCase();
        const customerName = `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.toLowerCase();
        const phone = (o.address?.phone || o.address?.mobile || "").toLowerCase();
        const city = (o.address?.city || "").toLowerCase();
        const state = (o.address?.state || "").toLowerCase();
        const itemNames = (o.items || []).map((i) => (i.name || i.productName || "").toLowerCase()).join(" ");

        return (
          id.includes(q) ||
          orderNum.includes(q) ||
          customerName.includes(q) ||
          phone.includes(q) ||
          city.includes(q) ||
          state.includes(q) ||
          itemNames.includes(q)
        );
      });
    }

    // 2. Status Filter
    if (statusFilter !== "All") {
      result = result.filter((o) => {
        const s = (o.orderStatus || o.status || "Processing").toLowerCase();
        if (statusFilter === "To Pack") {
          return (
            s.includes("placed") ||
            s.includes("process") ||
            s.includes("pending") ||
            s === "accepted"
          );
        }
        if (statusFilter === "Ready For Pickup") {
          return s.includes("pickup");
        }
        if (statusFilter === "In Transit") {
          return s.includes("transit") || s.includes("shipped") || s.includes("out");
        }
        if (statusFilter === "Delivered") {
          return s.includes("deliver") || s.includes("complete");
        }
        if (statusFilter === "Cancelled") {
          return s.includes("cancel") || s.includes("reject");
        }
        return true;
      });
    }

    // 3. Payment Filter
    if (paymentFilter !== "All") {
      result = result.filter((o) => {
        const pay = (o.paymentStatus || "").toLowerCase();
        if (paymentFilter === "paid") return pay === "paid";
        if (paymentFilter === "pending") return pay === "pending" || !pay;
        if (paymentFilter === "refunded") return pay.includes("refund");
        return true;
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();
      const amtA = Number(a.amount) || 0;
      const amtB = Number(b.amount) || 0;
      const itemsCountA = (a.items || []).length;
      const itemsCountB = (b.items || []).length;

      if (sortBy === "newest") return dateB - dateA;
      if (sortBy === "oldest") return dateA - dateB;
      if (sortBy === "amount_high") return amtB - amtA;
      if (sortBy === "amount_low") return amtA - amtB;
      if (sortBy === "items_count") return itemsCountB - itemsCountA;
      return 0;
    });

    return result;
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy]);

  // ================= 2. FULFILLMENT ACTIONS =================
  const handleMarkReadyForPickup = async (orderId) => {
    setActionLoadingId(orderId);
    try {
      const res = await axios.post(
        `${backendUrl}/api/seller/order/pickup`,
        { orderId },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.success("Order marked Ready For Pickup! Delivery agent assigned.");
        if (fetchOrders) fetchOrders();
      } else {
        toast.error(res.data.message || "Failed to update pickup status");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to reject/cancel this order?")) {
      return;
    }
    setActionLoadingId(orderId);
    try {
      const res = await axios.post(
        `${backendUrl}/api/seller/order/reject`,
        { orderId },
        { headers: { token } }
      );
      if (res.data.success) {
        toast.info("Order marked as cancelled/rejected.");
        if (fetchOrders) fetchOrders();
      } else {
        toast.error(res.data.message || "Failed to reject order");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Network error");
    } finally {
      setActionLoadingId(null);
    }
  };

  // ================= 3. EXPORT HELPERS =================
  const handleExportCSV = () => {
    if (processedOrders.length === 0) {
      toast.info("No orders to export with current filters");
      return;
    }

    const headers = [
      "Order ID",
      "Order Number",
      "Date",
      "Customer Name",
      "Customer Phone",
      "City",
      "State",
      "Items Summary",
      "Total Amount (INR)",
      "Payment Method",
      "Payment Status",
      "Fulfillment Status",
      "Delivery Agent"
    ];

    const rows = processedOrders.map((o) => {
      const customer = `${o.address?.firstName || ""} ${o.address?.lastName || ""}`.trim();
      const phone = o.address?.phone || o.address?.mobile || "";
      const city = o.address?.city || "";
      const state = o.address?.state || "";
      const itemsText = (o.items || [])
        .map((i) => `${i.name || i.productName || "Item"} (Qty: ${i.qty || i.quantity || 1})`)
        .join(" | ");

      return [
        `"${o._id || ""}"`,
        `"${o.orderNumber || ""}"`,
        `"${new Date(o.createdAt || o.date || 0).toLocaleDateString()}"`,
        `"${customer}"`,
        `"${phone}"`,
        `"${city}"`,
        `"${state}"`,
        `"${itemsText}"`,
        Number(o.amount || 0).toFixed(2),
        `"${o.paymentMethod || "Online"}"`,
        `"${o.paymentStatus || "pending"}"`,
        `"${o.orderStatus || o.status || "Processing"}"`,
        `"${o.deliverymanId?.name || "Unassigned"}"`
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cartnow_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported to CSV!");
  };

  const handleExportJSON = () => {
    if (processedOrders.length === 0) {
      toast.info("No orders to export with current filters");
      return;
    }

    const jsonContent = JSON.stringify(processedOrders, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `cartnow_orders_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Orders exported to JSON!");
  };

  return (
    <div className="space-y-4 pb-12 text-slate-800 dark:text-slate-100">
      {/* Control Panel: Header, KPIs, Search & Filter Tabs */}
      <OrdersControlPanel
        orders={orders}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onRefresh={() => {
          if (fetchOrders) fetchOrders();
          toast.info("Refreshing customer orders...");
        }}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        loading={loading}
      />

      {/* Main Orders Display: Table View or Cards View */}
      {viewMode === "table" ? (
        <OrdersTableView
          orders={processedOrders}
          onOpenDetails={(order) => setSelectedOrderForDetail(order)}
          onOpenPackingSlip={(order) => setSelectedOrderForPackingSlip(order)}
          onRejectOrder={handleRejectOrder}
          onMarkReadyForPickup={handleMarkReadyForPickup}
          actionLoadingId={actionLoadingId}
        />
      ) : (
        <OrdersCardsView
          orders={processedOrders}
          onOpenDetails={(order) => setSelectedOrderForDetail(order)}
          onOpenPackingSlip={(order) => setSelectedOrderForPackingSlip(order)}
          onRejectOrder={handleRejectOrder}
          onMarkReadyForPickup={handleMarkReadyForPickup}
          actionLoadingId={actionLoadingId}
        />
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrderForDetail}
        onClose={() => setSelectedOrderForDetail(null)}
        order={selectedOrderForDetail}
        onRejectOrder={handleRejectOrder}
        onMarkReadyForPickup={handleMarkReadyForPickup}
        onOpenPackingSlip={(order) => {
          setSelectedOrderForDetail(null);
          setSelectedOrderForPackingSlip(order);
        }}
        actionLoading={!!actionLoadingId}
      />

      {/* Printable Packing Slip & Manifest Modal */}
      <PackingSlipModal
        isOpen={!!selectedOrderForPackingSlip}
        onClose={() => setSelectedOrderForPackingSlip(null)}
        order={selectedOrderForPackingSlip}
        seller={seller}
      />
    </div>
  );
};

export default Orders;
