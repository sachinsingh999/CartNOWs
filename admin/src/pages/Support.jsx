import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const Support = ({ token }) => {
  const [requests, setRequests] = useState([]);
  const [replies, setReplies] = useState({});

  const fetchRequests = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.post(
        `${backendUrl}/api/service/help/admin/list`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setRequests(response.data.helpRequests);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [token]);

  useEffect(() => {
    const loadRequests = async () => {
      await fetchRequests();
    };

    loadRequests();
  }, [fetchRequests]);

  const handleUpdate = async (requestId, status) => {
    try {
      const request = requests.find((r) => r._id === requestId);
      const response = await axios.post(
        `${backendUrl}/api/service/help/admin/status`,
        {
          requestId,
          status,
          adminReply: replies[requestId] ?? request?.adminReply ?? "",
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success("Support request updated.");
        fetchRequests();
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
        <h2 className="mt-2 text-3xl font-bold text-gray-950">Help Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
          No support requests yet.
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((request) => (
            <article
              key={request._id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {request.category}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-gray-950">
                        {request.subject}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500">
                        {request.name} · {request.email}
                      </p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                    {request.message}
                  </div>

                  <p className="mt-4 text-xs text-gray-400">
                    Submitted on {new Date(request.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="space-y-3">
                  <select
                    value={request.status}
                    onChange={(event) => handleUpdate(request._id, event.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Resolved</option>
                  </select>

                  <textarea
                    rows="7"
                    value={replies[request._id] ?? request.adminReply ?? ""}
                    onChange={(event) =>
                      setReplies((current) => ({
                        ...current,
                        [request._id]: event.target.value,
                      }))
                    }
                    placeholder="Reply to the customer here"
                    className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none"
                  />

                  <button
                    onClick={() => handleUpdate(request._id, request.status)}
                    className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Save Reply
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Support;
