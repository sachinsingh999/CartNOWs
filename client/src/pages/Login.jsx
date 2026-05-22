import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { backendUrl } from "../config";

const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-gray-900 focus:ring-1 focus:ring-gray-900";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${backendUrl}/api/user/login`,
        { email, password }
      );

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success(response.data.message || "Login successful");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Try again.");
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm lg:grid-cols-[1fr_440px]">
        <div className="relative hidden min-h-[620px] lg:block">
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d"
            alt="Fashion rack"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 flex h-full flex-col justify-end p-10 text-white">
            <p className="text-sm font-medium uppercase tracking-wide text-white/70">
              CartNOW
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight">
              Sign in and continue your shopping flow.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/75">
              Access your cart, profile, order tracking, and product reviews.
            </p>
          </div>
        </div>

        <div className="flex items-center p-6 sm:p-10">
          <div className="w-full">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950">
              Login to CartNOW
            </h2>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Login
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              Don&apos;t have an account?
              <button
                onClick={() => navigate("/signup")}
                className="ml-1 font-semibold text-gray-950 hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
