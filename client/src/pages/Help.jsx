import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Headset,
  MessageSquareText,
  ShieldQuestion,
  Ticket,
} from "lucide-react";
import { backendUrl } from "../config";

const categories = [
  "Order issue",
  "Return and refund",
  "Payment help",
  "Delivery support",
  "Account support",
  "Other",
];

const statusClasses = {
  Open: "bg-amber-100 text-amber-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Resolved: "bg-green-100 text-green-800",
};

const Help = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    category: categories[0],
    subject: "",
    message: "",
  });

  const token = localStorage.getItem("token");

  const fetchTickets = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${backendUrl}/api/service/help/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setTickets(response.data.helpRequests);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const loadTickets = async () => {
      await fetchTickets();
    };

    loadTickets();
  }, [fetchTickets]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      toast.error("Please login first.");
      return;
    }

    if (!form.subject.trim() || !form.message.trim()) {
      toast.error("Please fill in the subject and message.");
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${backendUrl}/api/service/help/create`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Help request submitted.");
        setForm({
          category: categories[0],
          subject: "",
          message: "",
        });
        fetchTickets();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Support
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-950">Help Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">
            Ask for help, report an issue, and keep track of every response from the support team.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-950">Create a support request</h2>
                <p className="text-sm text-gray-500">We will keep your messages and updates here.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Subject</label>
                <input
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subject: event.target.value }))
                  }
                  placeholder="Tell us what you need help with"
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  rows="6"
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Share the full issue, what happened, and what kind of help you need."
                  className="w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </section>

          <section className="space-y-5">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-950">Your support history</h2>
                  <p className="text-sm text-gray-500">Every request stays visible here with replies and status changes.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
                Loading support requests...
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <ShieldQuestion className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-lg font-semibold text-gray-950">No support requests yet</p>
                <p className="mt-2 text-sm text-gray-500">
                  Create your first help request and the team will respond here.
                </p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <article
                  key={ticket._id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {ticket.category}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-gray-950">
                        {ticket.subject}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClasses[ticket.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                    <div className="mb-2 flex items-center gap-2 font-medium text-gray-900">
                      <MessageSquareText className="h-4 w-4" />
                      Your message
                    </div>
                    {ticket.message}
                  </div>

                  {ticket.adminReply && (
                    <div className="mt-4 rounded-lg bg-green-50 p-4 text-sm leading-6 text-green-900">
                      <p className="mb-2 font-medium">Support reply</p>
                      {ticket.adminReply}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-400">
                    Submitted on {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Help;
