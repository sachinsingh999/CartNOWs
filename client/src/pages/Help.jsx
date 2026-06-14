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
    if (!token) {
      setLoading(false);
      return;
    }

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-12 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400 font-semibold">
            Support
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-900 dark:text-slate-50">Help Center</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-550 dark:text-slate-400">
            Ask for help, report an issue, and keep track of every response from the support team.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[420px_1fr]">
          <section className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400">
                <Headset className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">Create a support request</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">We will keep your messages and updates here.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Category</label>
                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, category: event.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 dark:border-slate-805 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-gray-900 dark:text-slate-100 outline-none transition focus:border-gray-900 dark:focus:border-slate-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-100"
                >
                  {categories.map((item) => (
                    <option key={item} value={item} className="bg-white dark:bg-slate-900">
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-300">Subject</label>
                <input
                  value={form.subject}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subject: event.target.value }))
                  }
                  placeholder="Tell us what you need help with"
                  className="w-full rounded-md border border-gray-300 dark:border-slate-805 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-gray-900 dark:text-slate-100 outline-none transition focus:border-gray-900 dark:focus:border-slate-100 focus:ring-1 focus:ring-gray-900 dark:focus:ring-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-slate-305">Message</label>
                <textarea
                  rows="6"
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Share the full issue, what happened, and what kind of help you need."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-indigo-500 dark:focus:border-indigo-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition disabled:opacity-60 cursor-pointer shadow-md hover:shadow-lg active:scale-98"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </section>

          <section className="space-y-5">
            <div className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 dark:bg-slate-805 text-gray-700 dark:text-slate-300">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-50">Your support history</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Every request stays visible here with replies and status changes.</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="rounded-lg border border-gray-200 dark:border-slate-805 bg-white dark:bg-slate-900 p-10 text-center text-gray-500 dark:text-slate-400 shadow-sm dark:shadow-slate-950/20">
                Loading support requests...
              </div>
            ) : tickets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
                <ShieldQuestion className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500" />
                <p className="mt-4 text-lg font-semibold text-gray-900 dark:text-slate-100">No support requests yet</p>
                <p className="mt-2 text-sm text-gray-505 dark:text-slate-400">
                  Create your first help request and the team will respond here.
                </p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <article
                  key={ticket._id}
                  className="rounded-lg border border-gray-200 dark:border-slate-805 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
                        {ticket.category}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-slate-50">
                        {ticket.subject}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        ticket.status === "Open"
                          ? "bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400"
                          : ticket.status === "In Progress"
                          ? "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400"
                          : "bg-green-105 dark:bg-green-950/30 text-green-800 dark:text-green-400"
                      }`}
                    >
                      {ticket.status}
                    </span>
                  </div>

                  <div className="mt-4 rounded-lg bg-gray-50 dark:bg-slate-950/40 p-4 text-sm leading-6 text-gray-700 dark:text-slate-300 border border-gray-100 dark:border-slate-800">
                    <div className="mb-2 flex items-center gap-2 font-medium text-gray-900 dark:text-slate-100">
                      <MessageSquareText className="h-4 w-4" />
                      Your message
                    </div>
                    {ticket.message}
                  </div>

                  {ticket.adminReply && (
                    <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950/20 p-4 text-sm leading-6 text-green-905 dark:text-green-405 border border-green-100 dark:border-green-900/30">
                      <p className="mb-2 font-medium">Support reply</p>
                      {ticket.adminReply}
                    </div>
                  )}

                  <p className="mt-4 text-xs text-gray-400 dark:text-slate-500">
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
