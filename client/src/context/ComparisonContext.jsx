import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within a ComparisonProvider");
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [compareList, setCompareList] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("compareList");
      if (saved) {
        setCompareList(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load comparison list from localStorage", e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("compareList", JSON.stringify(compareList));
    } catch (e) {
      console.error("Failed to save comparison list to localStorage", e);
    }
  }, [compareList]);

  const addToCompare = (product) => {
    if (compareList.some((item) => item._id === product._id)) {
      toast.info("Product is already in the comparison list");
      return;
    }
    if (compareList.length >= 3) {
      toast.warning("You can compare up to 3 products at a time");
      return;
    }
    setCompareList((prev) => [...prev, product]);
    toast.success(`Added ${product.name.split(" ")[0]} to comparison`);
  };

  const removeFromCompare = (productId) => {
    setCompareList((prev) => prev.filter((item) => item._id !== productId));
    toast.info("Removed from comparison");
  };

  const isInCompare = (productId) => {
    return compareList.some((item) => item._id === productId);
  };

  const clearCompare = () => {
    setCompareList([]);
    toast.info("Cleared comparison list");
  };

  return (
    <ComparisonContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
};
