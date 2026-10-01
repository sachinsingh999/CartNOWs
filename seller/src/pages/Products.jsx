import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import { backendUrl } from "../config";

// Modular Sub-components
import ProductsControlPanel from "../components/products/ProductsControlPanel";
import ProductsTableView from "../components/products/ProductsTableView";
import ProductsGridView from "../components/products/ProductsGridView";
import ProductPreviewDrawer from "../components/products/ProductPreviewDrawer";
import ProductEditModal from "../components/products/ProductEditModal";
import BulkActionsBar from "../components/products/BulkActionsBar";
import { ChevronLeft, ChevronRight, PackagePlus } from "lucide-react";

const Products = ({ 
  token, 
  products = [], 
  deleteProduct, 
  loading = false, 
  fetchProducts 
}) => {
  const navigate = useNavigate();

  // Search, Filters & View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
  const [priceRangeFilter, setPriceRangeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Selection for bulk operations
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // Modal / Drawer state
  const [previewProduct, setPreviewProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockUpdatingId, setStockUpdatingId] = useState(null);

  // Dynamic unique categories
  const categories = useMemo(() => {
    return ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  // Filter & Sort Pipeline
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Text Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => {
        const name = (p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        const subcat = (p.subCategory || "").toLowerCase();
        const desc = (p.description || "").toLowerCase();
        const tags = Array.isArray(p.tags) ? p.tags.join(" ").toLowerCase() : (p.tags || "").toLowerCase();
        return name.includes(q) || sku.includes(q) || brand.includes(q) || cat.includes(q) || subcat.includes(q) || desc.includes(q) || tags.includes(q);
      });
    }

    // 2. Category Filter
    if (categoryFilter !== "All") {
      result = result.filter(p => p.category === categoryFilter);
    }

    // 3. Stock Level Filter
    if (stockFilter !== "All") {
      result = result.filter(p => {
        const s = parseInt(p.stock, 10) || 0;
        if (stockFilter === "Healthy") return s >= 10;
        if (stockFilter === "Low Stock") return s > 0 && s < 10;
        if (stockFilter === "Out of Stock") return s === 0;
        return true;
      });
    }

    // 4. Price Range Filter
    if (priceRangeFilter !== "All") {
      result = result.filter(p => {
        const pr = parseFloat(p.price) || 0;
        if (priceRangeFilter === "under500") return pr < 500;
        if (priceRangeFilter === "500to2000") return pr >= 500 && pr <= 2000;
        if (priceRangeFilter === "2000to5000") return pr >= 2000 && pr <= 5000;
        if (priceRangeFilter === "above5000") return pr > 5000;
        return true;
      });
    }

    // 5. Sorting
    result.sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;
      const stockA = parseInt(a.stock, 10) || 0;
      const stockB = parseInt(b.stock, 10) || 0;
      const nameA = (a.name || "").toLowerCase();
      const nameB = (b.name || "").toLowerCase();
      const dateA = new Date(a.createdAt || a.date || 0).getTime();
      const dateB = new Date(b.createdAt || b.date || 0).getTime();

      if (sortBy === "name-asc") return nameA.localeCompare(nameB);
      if (sortBy === "name-desc") return nameB.localeCompare(nameA);
      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "stock-asc") return stockA - stockB;
      if (sortBy === "stock-desc") return stockB - stockA;
      if (sortBy === "newest") return dateB - dateA;
      return 0;
    });

    return result;
  }, [products, searchQuery, categoryFilter, stockFilter, priceRangeFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, currentPage, rowsPerPage]);

  // Multi-select handlers
  const handleToggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === paginatedProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedProducts.map(p => p._id));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setStockFilter("All");
    setPriceRangeFilter("All");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Quick Stock Inline Update
  const handleQuickStockUpdate = async (productId, newStock) => {
    if (newStock < 0) return;
    setStockUpdatingId(productId);

    try {
      const response = await axios.post(
        `${backendUrl}/api/seller/inventory/update-stock`,
        { id: productId, stock: newStock },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`Stock updated to ${newStock} units`);
        if (fetchProducts) fetchProducts();
      } else {
        toast.error(response.data.message || "Failed to update stock");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setStockUpdatingId(null);
    }
  };

  // Bulk Stock Update Handler
  const handleBulkStockUpdate = async (adjustment) => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      const updates = selectedIds.map(id => {
        const prod = products.find(p => p._id === id);
        const currentStock = parseInt(prod?.stock, 10) || 0;
        let finalStock = adjustment.value;
        if (adjustment.mode === "add") finalStock = currentStock + adjustment.value;
        if (adjustment.mode === "subtract") finalStock = Math.max(0, currentStock - adjustment.value);
        return { id, stock: finalStock };
      });

      const response = await axios.post(
        `${backendUrl}/api/seller/inventory/bulk-stock`,
        { updates },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(`Bulk stock updated for ${selectedIds.length} items`);
        setSelectedIds([]);
        if (fetchProducts) fetchProducts();
      } else {
        toast.error(response.data.message || "Failed to perform bulk stock update");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Price Adjust Handler
  const handleBulkPriceAdjust = async (adjustment) => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      for (const id of selectedIds) {
        const prod = products.find(p => p._id === id);
        if (!prod) continue;
        const currentPrice = parseFloat(prod.price) || 0;
        let newPrice = currentPrice;
        if (adjustment.type === "discount") {
          newPrice = currentPrice * (1 - adjustment.percent / 100);
        } else {
          newPrice = currentPrice * (1 + adjustment.percent / 100);
        }
        newPrice = Math.max(1, Math.round(newPrice * 100) / 100);

        await axios.post(
          `${backendUrl}/api/seller/update-product`,
          { id, price: newPrice },
          { headers: { token } }
        );
      }

      toast.success(`Price adjusted for ${selectedIds.length} items`);
      setSelectedIds([]);
      if (fetchProducts) fetchProducts();
    } catch (err) {
      toast.error("Failed to adjust prices: " + err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Bulk Delete Handler
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);

    try {
      for (const id of selectedIds) {
        if (deleteProduct) {
          await deleteProduct(id);
        }
      }
      toast.success(`Deleted ${selectedIds.length} products`);
      setSelectedIds([]);
      if (fetchProducts) fetchProducts();
    } catch (err) {
      toast.error("Failed to delete products: " + err.message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.info("No products to export.");
      return;
    }

    const headers = ["ID", "Name", "SKU", "Category", "SubCategory", "Brand", "Price", "Stock", "Audience"];
    const rows = filteredProducts.map(p => [
      p._id,
      `"${(p.name || "").replace(/"/g, '""')}"`,
      `"${p.sku || ""}"`,
      `"${p.category || ""}"`,
      `"${p.subCategory || ""}"`,
      `"${p.brand || ""}"`,
      p.price,
      p.stock,
      `"${p.audience || ""}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cartnow_products_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (filteredProducts.length === 0) {
      toast.info("No products to export.");
      return;
    }

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredProducts, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `cartnow_products_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("JSON export downloaded successfully!");
  };

  return (
    <div className="space-y-2.5 pb-20 text-slate-800 dark:text-slate-100 animate-fadeIn">
      {/* 1. Combined Master Control Panel (Header + 4 KPIs + Search & Multi-Filters) */}
      <ProductsControlPanel
        products={products}
        loading={loading}
        onRefresh={fetchProducts}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        navigate={navigate}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        stockFilter={stockFilter}
        setStockFilter={setStockFilter}
        priceRangeFilter={priceRangeFilter}
        setPriceRangeFilter={setPriceRangeFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        rowsPerPage={rowsPerPage}
        setRowsPerPage={setRowsPerPage}
        categories={categories}
        totalFilteredCount={filteredProducts.length}
        totalProductsCount={products.length}
        onResetFilters={handleResetFilters}
      />

      {/* 3. Products List View (Table or Grid) */}
      {viewMode === "table" ? (
        <ProductsTableView
          products={paginatedProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onOpenPreview={(prod) => setPreviewProduct(prod)}
          onOpenEdit={(prod) => setEditingProduct(prod)}
          onDeleteProduct={deleteProduct}
          onQuickStockUpdate={handleQuickStockUpdate}
          stockUpdatingId={stockUpdatingId}
          loading={loading}
        />
      ) : (
        <ProductsGridView
          products={paginatedProducts}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onOpenPreview={(prod) => setPreviewProduct(prod)}
          onOpenEdit={(prod) => setEditingProduct(prod)}
          onDeleteProduct={deleteProduct}
          onQuickStockUpdate={handleQuickStockUpdate}
          stockUpdatingId={stockUpdatingId}
          loading={loading}
        />
      )}

      {/* 4. Pagination Controls */}
      {filteredProducts.length > rowsPerPage && (
        <div className="bg-white dark:bg-[#0F172A] rounded-xl p-2.5 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            Page <strong className="text-slate-900 dark:text-white">{currentPage}</strong> of {totalPages} ({filteredProducts.length} total items)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1;
              if (totalPages > 5 && currentPage > 3) {
                pageNum = currentPage - 2 + i;
                if (pageNum > totalPages) pageNum = totalPages - (4 - i);
              }
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-7 w-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-amber-500 text-slate-950 font-black shadow-2xs"
                      : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* 5. Sticky Floating Bulk Actions Bar */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <BulkActionsBar
            selectedCount={selectedIds.length}
            onClearSelection={() => setSelectedIds([])}
            onBulkStockUpdate={handleBulkStockUpdate}
            onBulkPriceAdjust={handleBulkPriceAdjust}
            onBulkDelete={handleBulkDelete}
            isProcessing={isBulkProcessing}
          />
        )}
      </AnimatePresence>

      {/* 6. Quick Preview Slide-Over Drawer */}
      <AnimatePresence>
        {previewProduct && (
          <ProductPreviewDrawer
            product={previewProduct}
            onClose={() => setPreviewProduct(null)}
            onOpenEdit={(prod) => setEditingProduct(prod)}
            onDeleteProduct={deleteProduct}
            onQuickStockUpdate={handleQuickStockUpdate}
            stockUpdatingId={stockUpdatingId}
          />
        )}
      </AnimatePresence>

      {/* 7. Structured 5-Tab Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <ProductEditModal
            editingProduct={editingProduct}
            onClose={() => setEditingProduct(null)}
            token={token}
            fetchProducts={fetchProducts}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
