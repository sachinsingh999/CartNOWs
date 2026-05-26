import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { backendUrl } from "../config";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const cartRes = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!cartRes.data.success) return;

        const cartData = cartRes.data.cartData || {};
        const items = [];

        for (const key in cartData) {
          const [itemId, size] = key.split("_");
          const qty = cartData[key];

          if (qty > 0) {
            try {
              const productRes = await axios.get(
                `${backendUrl}/api/product/single/${itemId}`
              );

              if (productRes.data.success && productRes.data.product) {
                items.push({
                  itemId,
                  size,
                  qty,
                  product: productRes.data.product,
                });
              }
            } catch (err) {
              console.log(`Failed to load cart item ${itemId}:`, err);
            }
          }
        }

        setCartItems(items);
      } catch (error) {
        console.log("CART FETCH ERROR:", error);
      }
    };

    fetchCart();
  }, [token, navigate]);

  const updateQty = async (index, newQty) => {
    if (newQty < 1) return;

    const item = cartItems[index];

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/update`,
        {
          itemId: item.itemId,
          size: item.size,
          qty: newQty,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        const updated = [...cartItems];
        updated[index].qty = newQty;
        setCartItems(updated);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const removeItem = async (index) => {
    const item = cartItems[index];

    try {
      const res = await axios.post(
        `${backendUrl}/api/cart/update`,
        {
          itemId: item.itemId,
          size: item.size,
          qty: 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCartItems(cartItems.filter((_, i) => i !== index));
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 px-6 py-20">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-lg border border-dashed border-gray-300 bg-white p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-100">
            <ShoppingBag className="h-8 w-8 text-gray-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-gray-950">Your cart is empty</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
            Add your favorite products and come back here to checkout.
          </p>
          <button
            onClick={() => navigate("/product")}
            className="mt-6 rounded-md bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const shipping = 0;
  const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Shopping Bag
            </p>
            <h1 className="mt-2 text-4xl font-bold text-gray-950">Your Cart</h1>
          </div>
          <p className="text-sm text-gray-500">
            {itemCount} {itemCount === 1 ? "item" : "items"} ready for checkout
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={`${item.itemId}-${item.size}`}
                className="grid gap-5 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:grid-cols-[120px_1fr_auto]"
              >
                <div className="flex h-28 w-28 items-center justify-center rounded-lg bg-gray-50">
                  <img
                    src={`${backendUrl}/${item.product.images[0]}`}
                    className="h-full w-full object-contain p-3"
                    alt={item.product.name}
                  />
                </div>

                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-950">{item.product.name}</p>
                      <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
                    </div>
                    <p className="text-lg font-bold text-gray-950">
                      ₹{item.product.price}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-700">
                      Size {item.size}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      Subtotal ₹{item.product.price * item.qty}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <div className="flex items-center rounded-md border border-gray-200">
                    <button
                      onClick={() => updateQty(index, item.qty - 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-10 px-3 text-center text-sm font-semibold">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(index, item.qty + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-100"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(index)}
                    className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="h-fit rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <h2 className="text-xl font-semibold text-gray-950">Order Summary</h2>
            <p className="mt-1 text-sm text-gray-500">Review your total before checkout.</p>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-950">₹{total}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-medium text-gray-950">
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
            </div>

            <hr className="my-6" />

            <div className="flex justify-between text-lg font-bold text-gray-950">
              <span>Total</span>
              <span>₹{total + shipping}</span>
            </div>

            <button
              onClick={() =>
                navigate("/placeorder", {
                  state: {
                    cartItems: cartItems.map((item) => ({
                      ...item.product,
                      qty: item.qty,
                      size: item.size,
                    })),
                    total,
                  },
                })
              }
              className="mt-6 w-full rounded-md bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate("/product")}
              className="mt-3 w-full rounded-md border border-gray-300 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
