import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets";
import { backendUrl } from "../config";

const inputClass = "w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

const Add = ({ token }) => {
  const [image1, setImage1] = useState(false);
  const [image2, setImage2] = useState(false);
  const [image3, setImage3] = useState(false);
  const [image4, setImage4] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "Fashion",
    subCategory: "",
    collection: "Women",
    brand: "",
    sku: "",
    price: "",
    stock: "",
    variants: "",
    tags: "",
    specifications: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setImage1(false);
    setImage2(false);
    setImage3(false);
    setImage4(false);
    setForm({
      name: "",
      description: "",
      category: "Fashion",
      subCategory: "",
      collection: "Women",
      brand: "",
      sku: "",
      price: "",
      stock: "",
      variants: "",
      tags: "",
      specifications: "",
    });
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      Object.entries({
        name: form.name,
        description: form.description,
        category: form.category,
        subCategory: form.subCategory,
        collection: form.collection,
        brand: form.brand,
        sku: form.sku,
        price: form.price,
        stock: form.stock,
        sizes: form.variants,
        tags: form.tags,
        specifications: form.specifications,
      }).forEach(([key, value]) => {
        formData.append(key, value);
      });

      if (image1) formData.append("image1", image1);
      if (image2) formData.append("image2", image2);
      if (image3) formData.append("image3", image3);
      if (image4) formData.append("image4", image4);

      const response = await axios.post(
        `${backendUrl}/api/product/add`,
        formData,
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        resetForm();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <div className="w-full max-w-5xl rounded-lg bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-950">Add Product</h2>
          <p className="mt-1 text-sm text-gray-500">
            Works for fashion, electronics, accessories, and more.
          </p>
        </div>

        <div className="mb-8">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Upload Images
          </h3>
          <div className="flex flex-wrap gap-4">
            {[
              [image1, setImage1, "image1"],
              [image2, setImage2, "image2"],
              [image3, setImage3, "image3"],
              [image4, setImage4, "image4"],
            ].map(([image, setter, id]) => (
              <label key={id} htmlFor={id} className="cursor-pointer">
                <img
                  className="h-24 w-24 rounded-md border border-dashed border-gray-300 p-2 object-contain"
                  src={image ? URL.createObjectURL(image) : assets.upload_area}
                  alt=""
                />
                <input
                  type="file"
                  id={id}
                  hidden
                  onChange={(e) => setter(e.target.files[0])}
                />
              </label>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Type here"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="5"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Write content here"
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => updateField("category", e.target.value)}
                  className={inputClass}
                >
                  <option>Fashion</option>
                  <option>Electronics</option>
                  <option>Accessories</option>
                  <option>Footwear</option>
                  <option>Home</option>
                  <option>Beauty</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Collection</label>
                <select
                  value={form.collection}
                  onChange={(e) => updateField("collection", e.target.value)}
                  className={inputClass}
                >
                  <option>Women</option>
                  <option>Men</option>
                  <option>Kid</option>
                  <option>Unisex</option>
                  <option>General</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subcategory</label>
                <input
                  type="text"
                  value={form.subCategory}
                  onChange={(e) => updateField("subCategory", e.target.value)}
                  placeholder="Shoes, Smartphone, Watch"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Brand</label>
                <input
                  type="text"
                  value={form.brand}
                  onChange={(e) => updateField("brand", e.target.value)}
                  placeholder="Brand name"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Stock</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => updateField("sku", e.target.value)}
                placeholder="SKU-001"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Variants / Sizes</label>
              <input
                type="text"
                value={form.variants}
                onChange={(e) => updateField("variants", e.target.value)}
                placeholder="S, M, L or 128GB, 256GB"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => updateField("tags", e.target.value)}
                placeholder="premium, wireless, bestseller"
                className={inputClass}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Specifications</label>
              <textarea
                rows="5"
                value={form.specifications}
                onChange={(e) => updateField("specifications", e.target.value)}
                placeholder="Battery: 5000mAh, Material: Leather, Warranty: 1 year"
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 rounded-md bg-black px-8 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Add Product
        </button>
      </div>
    </form>
  );
};

export default Add;
