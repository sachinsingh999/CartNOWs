import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/register`,
        { name, email, password }
      );

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:grid-cols-[440px_1fr]">
        <div className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Create account
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">
              Join CartNOW
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-500">
              Save your cart, track orders, and write reviews after purchase.
            </p>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Sign Up
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?
              <button
                onClick={() => navigate("/login")}
                className="ml-1 font-semibold text-gray-950 hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>

        <div className="relative hidden min-h-[650px] lg:block">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            alt="Shopping"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 text-white">
            <p className="text-sm font-medium uppercase tracking-wide text-white/70">
              Shop better
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Your orders, profile, cart, and reviews in one place.
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
