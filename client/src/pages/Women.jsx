import React, { useEffect, useState } from "react";
import ProductCard from "../pages/ProductCard";
import FilterSidebar from "../componenets/CategoryFilterSidebar";
import axios from "axios";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

const Women = () => {
  const [womenProducts, setWomenProducts] = useState([]);
  const [filteredList, setFilteredList] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/product/list`);
        if (response.data.success) {
          const onlyWomen = response.data.products.filter(
            (item) => item.collection?.toLowerCase() === "women"
          );
          setWomenProducts(onlyWomen);
          setFilteredList(onlyWomen);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Women</p>
          <h1 className="mt-2 text-4xl font-bold text-gray-950">
            Women Products
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Sidebar */}
          <FilterSidebar
            productList={womenProducts}
            setFilteredList={setFilteredList}
          />

          {/* Products */}
          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              {filteredList.map(item => (
                <ProductCard key={item._id} product={item} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Women;
