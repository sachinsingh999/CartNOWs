import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../config";
import ProductCard from "../pages/ProductCard";
import { toast } from "react-toastify";

const Category = () => {
  const { slug } = useParams(); // e.g., "beauty"
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/product/list`);
        if (res.data.success) {
          const filtered = res.data.products.filter(
            (p) => (p.category || "").toLowerCase() === slug.toLowerCase()
          );
          setProducts(filtered);
        } else {
          toast.error(res.data.message);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [slug]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <h1 className="text-3xl font-bold mb-6 capitalize">{slug.replace(/-/g, " ")}</h1>
      {loading ? (
        <p className="text-gray-600 dark:text-gray-300">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No products found for {slug}.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
