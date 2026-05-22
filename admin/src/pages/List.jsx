import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const List = ({ token }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/product/remove`,
        { id },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let active = true;

    axios.get(`${backendUrl}/api/product/list`)
      .then((response) => {
        if (!active) return;

        if (response.data.success) {
          setList(response.data.products);
        } else {
          toast.error(response.data.message);
        }
      })
      .catch((error) => {
        if (active) {
          toast.error(error.message);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Inventory
          </p>
          <h2 className="mt-1 text-2xl font-bold text-gray-950">All Products</h2>
        </div>
        <p className="text-sm text-gray-500">{list.length} total products</p>
      </div>

      <div className="grid gap-4">
        {list.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">
            No products found
          </div>
        ) : (
          list.map((item) => (
            <div
              key={item._id}
              className="grid gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm lg:grid-cols-[80px_1.2fr_1fr_120px_110px]"
            >
              <img
                src={`${backendUrl}/${item.images?.[0]}`}
                alt={item.name}
                className="h-20 w-20 rounded-md bg-gray-100 object-contain p-2"
              />

              <div>
                <p className="text-base font-semibold text-gray-950">{item.name}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                    {item.category}
                  </span>
                  {item.subCategory && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                      {item.subCategory}
                    </span>
                  )}
                  {item.collection && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium text-gray-700">
                      {item.collection}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium text-gray-900">Brand:</span> {item.brand || "-"}</p>
                <p><span className="font-medium text-gray-900">SKU:</span> {item.sku || "-"}</p>
                <p><span className="font-medium text-gray-900">Variants:</span> {item.sizes?.length ? item.sizes.join(", ") : "-"}</p>
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-semibold text-gray-950">₹{item.price}</p>
                <p className={`${item.stock > 0 ? "text-green-600" : "text-red-500"}`}>
                  Stock: {item.stock ?? 0}
                </p>
              </div>

              <button
                onClick={() => removeProduct(item._id)}
                className="h-fit rounded-md bg-red-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default List;
