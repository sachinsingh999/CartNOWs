import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const Returns = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [notes, setNotes] = useState({});

  const fetchReturns = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/service/returns/admin/list`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setRequests(response.data.returns);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [token]);

  useEffect(() => {
    const loadReturns = async () => {
      await fetchReturns();
    };

    loadReturns();
  }, [fetchReturns]);

  const handleStatusUpdate = async (requestId, status) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/service/returns/admin/status`,
        {
          requestId,
          status,
          adminNote: notes[requestId] || "",
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Return request updated.");
        fetchReturns();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          Service Desk
        </p>
        <h2 className="mt-2 text-3xl font-bold text-gray-950">Return Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
          No return requests yet.
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((request) => (
            <div
              key={request._id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 xl:grid-cols-[120px_1fr_280px]">
                <div className="h-28 w-28 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                  {request.itemImage ? (
                    <img
                      src={`${backendUrl}/${request.itemImage}`}
                      alt={request.itemName}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-950">{request.itemName}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Order ID: {request.orderId}
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-800">
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                      Qty {request.quantity}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                      Size {request.itemSize || "N/A"}
                    </span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
                      ₹{request.amount}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">Reason</p>
                    <p className="mt-1">{request.reason}</p>
                    {request.feedback && (
                      <>
                        <p className="mt-3 font-medium text-gray-900">Customer feedback</p>
                        <p className="mt-1">{request.feedback}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <select
                    value={request.status}
                    onChange={(event) => handleStatusUpdate(request._id, event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option>Requested</option>
                    <option>Approved</option>
                    <option>Rejected</option>
                    <option>Received</option>
                    <option>Refunded</option>
                  </select>

                  <textarea
                    rows="5"
                    value={notes[request._id] ?? request.adminNote ?? ""}
                    onChange={(event) =>
                      setNotes((current) => ({
                        ...current,
                        [request._id]: event.target.value,
                      }))
                    }
                    placeholder="Add an admin note for the customer"
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
                  />

                  <button
                    onClick={() => handleStatusUpdate(request._id, request.status)}
                    className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Returns;
