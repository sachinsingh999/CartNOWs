import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  CalendarDays,
  Headset,
  PackageCheck,
  RotateCcw,
  Truck,
} from "lucide-react";
import { backendUrl } from "../config";

const Orderdetail = () => {
  const [orderData, setOrderData] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturnItem, setSelectedReturnItem] = useState(null);
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnForm, setReturnForm] = useState({
    reason: "Wrong item delivered",
    feedback: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const fetchOrders = useCallback(async () => {
    if (!token) return;

    const [orderResponse, returnResponse] = await Promise.all([
      axios.post(
        `${backendUrl}/api/order/userOrder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      axios.get(`${backendUrl}/api/service/returns/user`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (orderResponse.data.success) {
      const allOrdersItem = [];

      orderResponse.data.orders.forEach((order) => {
        order.items.forEach((item) => {
          allOrdersItem.push({
            ...item,
            orderId: order._id,
            status: order.orderStatus,
            payment: order.paymentStatus === "paid",
            paymentMethod: order.paymentMethod,
            date: order.createdAt,
            amount: order.amount,
            address: order.address,
          });
        });
      });

      setOrderData(allOrdersItem.reverse());
    }

    if (returnResponse.data.success) {
      setReturnRequests(returnResponse.data.returns);
    }
  }, [token]);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        await fetchOrders();
      } catch (error) {
        console.log("ORDER FETCH ERROR 👉", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [fetchOrders]);

  const getReturnRequest = (item) =>
    returnRequests.find(
      (request) =>
        String(request.orderId) === String(item.orderId) &&
        String(request.productId) === String(item.productId) &&
        (request.itemSize || "") === (item.size || "")
    );

  const openReturnModal = (item) => {
    setSelectedReturnItem(item);
    setReturnForm({
      reason: "Wrong item delivered",
      feedback: "",
    });
  };

  const submitReturnRequest = async (event) => {
    event.preventDefault();

    if (!selectedReturnItem) return;

    try {
      setSubmittingReturn(true);
      const response = await axios.post(
        `${backendUrl}/api/service/returns/create`,
        {
          orderId: selectedReturnItem.orderId,
          productId: selectedReturnItem.productId,
          size: selectedReturnItem.size,
          reason: returnForm.reason,
          feedback: returnForm.feedback,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Return request submitted.");
        setSelectedReturnItem(null);
        setReturnForm({ reason: "Wrong item delivered", feedback: "" });
        await fetchOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmittingReturn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <span className="text-gray-500">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">Orders</p>
            <h2 className="mt-2 text-4xl font-bold text-gray-950">My Orders</h2>
          </div>
          <button
            onClick={() => navigate("/product")}
            className="rounded-md border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-100"
          >
            Continue Shopping
          </button>
        </div>

        {orderData.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center">
            <PackageCheck className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-semibold text-gray-950">No orders found</p>
            <p className="mt-1 text-sm text-gray-500">Your purchased products will appear here.</p>
          </div>
        )}

        <div className="space-y-5">
          {orderData.map((item, index) => (
            <div
              key={`${item.orderId}-${item.productId || item.name}-${index}`}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              {(() => {
                const returnRequest = getReturnRequest(item);
                const canRequestReturn = item.status === "Delivered" && !returnRequest;

                return (
              <div className="grid gap-5 lg:grid-cols-[96px_1fr_auto] lg:items-center">
                <div className="h-24 w-24 rounded-lg border border-gray-100 bg-gray-50">
                  <img
                    src={`${backendUrl}/${item.image}`}
                    alt={item.name}
                    className="h-full w-full rounded-lg object-contain p-2"
                  />
                </div>

                <div>
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <p className="text-lg font-semibold text-gray-950">{item.name}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Qty {item.qty} · Size {item.size}
                      </p>
                    </div>
                    <p className="text-xl font-bold text-gray-950">
                      ₹{item.price * item.qty}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-medium ${
                        item.status === "Delivered"
                          ? "bg-green-100 text-green-800"
                          : item.status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 font-medium ${
                        item.payment
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {item.payment ? "Paid" : "Payment Pending"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                      {item.paymentMethod.toUpperCase()}
                    </span>
                    {returnRequest && (
                      <span className="rounded-full bg-orange-100 px-3 py-1 font-medium text-orange-800">
                        Return {returnRequest.status}
                      </span>
                    )}
                  </div>

                  {returnRequest && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">
                        Return reason: {returnRequest.reason}
                      </p>
                      {returnRequest.feedback && (
                        <p className="mt-1">Your note: {returnRequest.feedback}</p>
                      )}
                      {returnRequest.adminNote && (
                        <p className="mt-2 text-gray-900">
                          Admin note: {returnRequest.adminNote}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-4 max-w-2xl truncate text-xs text-gray-400">
                    Order ID: {item.orderId}
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() =>
                      navigate(`/track/${item.orderId}`, { state: { item } })
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    <Truck className="h-4 w-4" />
                    Track
                  </button>

                  {canRequestReturn && (
                    <button
                      onClick={() => openReturnModal(item)}
                      className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Return
                    </button>
                  )}

                  <button
                    onClick={() => navigate("/help")}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-orange-200 px-5 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                  >
                    <Headset className="h-4 w-4" />
                    Help
                  </button>
                </div>
              </div>
                );
              })()}
            </div>
          ))}
        </div>
      </div>

      {selectedReturnItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
                  Return Request
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-950">
                  {selectedReturnItem.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReturnItem(null)}
                className="rounded-md px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={submitReturnRequest} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Return reason
                </label>
                <select
                  value={returnForm.reason}
                  onChange={(event) =>
                    setReturnForm((current) => ({ ...current, reason: event.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  <option>Wrong item delivered</option>
                  <option>Damaged item</option>
                  <option>Product not as expected</option>
                  <option>Quality issue</option>
                  <option>Changed my mind</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Feedback
                </label>
                <textarea
                  rows="5"
                  value={returnForm.feedback}
                  onChange={(event) =>
                    setReturnForm((current) => ({ ...current, feedback: event.target.value }))
                  }
                  placeholder="Share the issue in a little more detail."
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReturnItem(null)}
                  className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="rounded-md bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
                >
                  {submittingReturn ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orderdetail;
