import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Headset, LogOut, Mail, Package, ShieldCheck, User } from "lucide-react";
import { backendUrl } from "../config";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.get(
          `${backendUrl}/api/user/profile`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.log("PROFILE ERROR 👉", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center text-gray-500">
        Loading profile...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] bg-gray-50 flex items-center justify-center text-gray-500">
        No user data found
      </div>
    );
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
            Account
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-950">My Profile</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <aside className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-black text-4xl font-bold text-white">
                {initial}
              </div>
              <h2 className="mt-5 text-2xl font-bold text-gray-950">{user.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="mt-8 grid gap-3">
              <button
                onClick={() => navigate("/orderdetail")}
                className="flex items-center justify-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                <Package className="h-4 w-4" />
                My Orders
              </button>

              <button
                onClick={() => navigate("/help")}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                <Headset className="h-4 w-4" />
                Help Center
              </button>

              <button
                onClick={logoutHandler}
                className="flex items-center justify-center gap-2 rounded-md border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-950">Account Details</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <User className="h-4 w-4" />
                    Name
                  </div>
                  <p className="mt-2 font-semibold text-gray-950">{user.name}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="mt-2 font-semibold text-gray-950">{user.email}</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <ShieldCheck className="h-4 w-4" />
                    Account Status
                  </div>
                  <p className="mt-2 font-semibold text-gray-950">Active customer</p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Package className="h-4 w-4" />
                    Joined On
                  </div>
                  <p className="mt-2 font-semibold text-gray-950">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-black p-6 text-white shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-white/60">
                Quick Access
              </p>
              <h3 className="mt-2 text-2xl font-bold">Track orders and keep shopping faster.</h3>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/orderdetail")}
                  className="rounded-md bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-100"
                >
                  View Orders
                </button>
                <button
                  onClick={() => navigate("/help")}
                  className="rounded-md bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Get Help
                </button>
                <button
                  onClick={() => navigate("/product")}
                  className="rounded-md border border-white/60 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-black"
                >
                  Shop Products
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
