import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CreditCard, MapPin, PackageCheck, ShieldCheck } from "lucide-react";
import { backendUrl } from "../config";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

const PlaceOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("cod");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const singleProduct = location.state?.product;
  const cartItems = location.state?.cartItems;
  const qty = location.state?.qty || 1;
  const size = location.state?.size || "N/A";

  const products = cartItems
    ? cartItems
    : singleProduct
    ? [{ ...singleProduct, qty, size }]
    : [];

  const subtotal = products.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping = 10;
  const total = subtotal + shipping;

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-md rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-lg font-semibold text-gray-950">No product selected</p>
          <button
            onClick={() => navigate("/product")}
            className="mt-5 rounded-md bg-black px-6 py-3 text-sm font-medium text-white"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      return;
    }

    const requiredFields = [
      "firstName",
      "email",
      "street",
      "city",
      "state",
      "country",
      "phone",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError("All fields are required");
        return;
      }
    }

    const items = products.map((item) => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      size: item.size,
      image: item.images?.[0],
    }));

    try {
      setLoading(true);

      const res = await axios.post(
        `${backendUrl}/api/order/place`,
        {
          items,
          amount: total,
          address: { ...formData },
          paymentMethod: method,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        navigate("/orderdetail", {
          state: { order: res.data.order },
        });
      } else {
        setError(res.data.message || "Order failed");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <form onSubmit={onSubmitHandler} className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Checkout
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-950">Place Order</h1>
        </div>

        {error && (
          <p className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                  <MapPin className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-950">Delivery Information</h2>
                  <p className="text-sm text-gray-500">Where should we send your order?</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input name="firstName" placeholder="First Name" onChange={onChangeHandler} className={inputClass} />
                <input name="lastName" placeholder="Last Name" onChange={onChangeHandler} className={inputClass} />
                <input name="email" placeholder="Email" onChange={onChangeHandler} className={`${inputClass} sm:col-span-2`} />
                <input name="street" placeholder="Street Address" onChange={onChangeHandler} className={`${inputClass} sm:col-span-2`} />
                <input name="city" placeholder="City" onChange={onChangeHandler} className={inputClass} />
                <input name="state" placeholder="State" onChange={onChangeHandler} className={inputClass} />
                <input name="country" placeholder="Country" onChange={onChangeHandler} className={inputClass} />
                <input name="phone" placeholder="Phone" onChange={onChangeHandler} className={inputClass} />
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                  <CreditCard className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-950">Payment Method</h2>
                  <p className="text-sm text-gray-500">Choose how you want to pay.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {["stripe", "razorpay", "cod"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`rounded-md border px-4 py-3 text-sm font-semibold transition ${
                      method === m
                        ? "border-black bg-black text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {m === "cod" ? "Cash on Delivery" : m.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                <PackageCheck className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-950">Order Summary</h2>
                <p className="text-sm text-gray-500">{products.length} product lines</p>
              </div>
            </div>

            <div className="space-y-4">
              {products.map((item, i) => (
                <div key={`${item._id}-${item.size}-${i}`} className="flex gap-4 rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <img
                    src={`${backendUrl}/${item.images?.[0]}`}
                    alt={item.name}
                    className="h-16 w-16 rounded-md bg-white object-contain p-2"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-950">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Qty {item.qty} · Size {item.size}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-950">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-950">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-950">₹{shipping}</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-500">
                <ShieldCheck className="h-4 w-4 text-gray-700" />
                Secure checkout and order tracking included.
              </div>
            </div>

            <hr className="my-6" />

            <div className="flex justify-between text-lg font-bold text-gray-950">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              disabled={loading}
              className="mt-6 w-full rounded-md bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </aside>
        </div>
      </form>
    </div>
  );
};

export default PlaceOrder;
