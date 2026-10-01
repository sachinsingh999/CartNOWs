import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";
import { backendUrl } from "../config";

// Modular Inventory Sub-components
import InventoryHeaderKPIs from "../components/inventory/InventoryHeaderKPIs";
import UrgentRestockQueue from "../components/inventory/UrgentRestockQueue";
import WarehouseStockTable from "../components/inventory/WarehouseStockTable";
import RestockPurchaseOrderModal from "../components/inventory/RestockPurchaseOrderModal";

const Inventory = ({ 
  token, 
  seller = {}, 
  products = [], 
  orders = [], 
  loading = false, 
  fetchProducts 
}) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [restockUpdatingId, setRestockUpdatingId] = useState(null);
  const [isProcessingPO, setIsProcessingPO] = useState(false);

  // PO Modal state
  const [poProducts, setPoProducts] = useState(null); // array of products for PO

  // Quick Restock Handler
  const handleQuickRestock = async (productId, newStock) => {
    if (newStock < 0) return;
    setRestockUpdatingId(productId);

    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/inventory/update-stock`,
        { id: productId, stock: newStock },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`Warehouse inventory replenished to ${newStock} units!`);
        if (fetchProducts) fetchProducts();
      } else {
        toast.error(response.data.message || "Failed to replenish stock");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setRestockUpdatingId(null);
    }
  };

  // Open PO for single product
  const handleOpenSinglePO = (product) => {
    setPoProducts([product]);
  };

  // Open Batch PO for all critical/low-stock items
  const handleOpenBatchPO = () => {
    const lowStock = products.filter(p => (parseInt(p.stock, 10) || 0) < 10);
    if (lowStock.length === 0) {
      toast.info("All warehouse products currently have healthy stock!");
      setPoProducts(products.slice(0, 5)); // fallback to top items
    } else {
      setPoProducts(lowStock);
    }
  };

  // Confirm and fulfill PO quantities
  const handleConfirmRestockOrder = async (quantitiesMap) => {
    setIsProcessingPO(true);
    try {
      const updates = Object.entries(quantitiesMap).map(([id, addQty]) => {
        const prod = products.find(p => p._id === id);
        const current = parseInt(prod?.stock, 10) || 0;
        return { id, stock: current + addQty };
      });

      const response = await axios.post(
        `${backendUrl}/api/seller/inventory/bulk-stock`,
        { updates },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`Purchase Order received! Replenished ${updates.length} SKUs.`);
        setPoProducts(null);
        if (fetchProducts) fetchProducts();
      } else {
        toast.error(response.data.message || "Failed to process stock replenishment");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsProcessingPO(false);
    }
  };

  // Multi-select toggle
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p._id));
    }
  };

  // Export Stock CSV
  const handleExportCSV = () => {
    if (products.length === 0) {
      toast.info("No warehouse items to export.");
      return;
    }

    const headers = ["SKU", "Product Name", "Category", "Current Stock", "Unit Price", "Locked Capital", "Stock Health Status"];
    const rows = products.map(p => {
      const s = parseInt(p.stock, 10) || 0;
      const price = parseFloat(p.price) || 0;
      const val = s * price;
      const status = s === 0 ? "Out of Stock" : s < 10 ? "Low Stock" : "Healthy Buffer";
      return [
        `"${p.sku || p._id}"`,
        `"${(p.name || "").replace(/"/g, '""')}"`,
        `"${p.category || ""}"`,
        s,
        price,
        val,
        `"${status}"`
      ];
    });

    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = `warehouse_inventory_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Warehouse Inventory CSV audit downloaded!");
  };

  // Export Stock JSON
  const handleExportJSON = () => {
    if (products.length === 0) {
      toast.info("No warehouse items to export.");
      return;
    }

    const json = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(products, null, 2))}`;
    const link = document.createElement("a");
    link.href = json;
    link.download = `warehouse_inventory_audit_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Warehouse Inventory JSON audit downloaded!");
  };

  return (
    <div className="space-y-2.5 pb-20 text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* 1. Header & Live Warehouse Analytics */}
      <InventoryHeaderKPIs
        products={products}
        orders={orders}
        loading={loading}
        onRefresh={fetchProducts}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onOpenBatchPO={handleOpenBatchPO}
      />

      {/* 2. Urgent Restock Action Queue */}
      <UrgentRestockQueue
        products={products}
        onQuickRestock={handleQuickRestock}
        restockUpdatingId={restockUpdatingId}
        onOpenSinglePO={handleOpenSinglePO}
      />

      {/* 3. Detailed Warehouse Stock Ledger Table */}
      <WarehouseStockTable
        products={products}
        orders={orders}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onSelectAll={handleSelectAll}
        onQuickRestock={handleQuickRestock}
        restockUpdatingId={restockUpdatingId}
        onOpenSinglePO={handleOpenSinglePO}
        loading={loading}
      />

      {/* 4. Supplier Purchase Order Generator Modal */}
      <AnimatePresence>
        {poProducts && (
          <RestockPurchaseOrderModal
            poProducts={poProducts}
            seller={seller}
            onClose={() => setPoProducts(null)}
            onConfirmRestockOrder={handleConfirmRestockOrder}
            isProcessing={isProcessingPO}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
