import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  LogOut,
  Package,
  Search,
  MapPin,
  Navigation,
} from "lucide-react";
import axios from "axios";
import { backendUrl } from "../config";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [cartCount, setCartCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [locationLabel, setLocationLabel] = useState("Use location");
  const [locationLoading, setLocationLoading] = useState(false);

  const token = localStorage.getItem("token");
  const query = useMemo(
    () => new URLSearchParams(location.search).get("q") || "",
    [location.search]
  );

  useEffect(() => {
    if (!token) return;

    // ✅ FETCH PROFILE
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          `${backendUrl}/api/user/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          setUsername(res.data.user.name);
        }
      } catch (err) {
        console.log("PROFILE ERROR", err.message);
      }
    };

    // ✅ FETCH CART COUNT
    const fetchCartCount = async () => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/cart/get`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          const cartData = res.data.cartData || {};
          const count = Object.values(cartData).reduce(
            (sum, qty) => sum + qty,
            0
          );
          setCartCount(count);
        }
      } catch (err) {
        console.log("CART COUNT ERROR", err.message);
      }
    };

    fetchProfile();
    fetchCartCount();
  }, [token]);

  useEffect(() => {
    setSearchValue(query);
  }, [query]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleUserClick = () => {
    if (!token) navigate("/login");
    else setOpen((prev) => !prev);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setOpen(false);
    navigate("/login");
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmedSearch = searchValue.trim();

    if (trimmedSearch) {
      params.set("q", trimmedSearch);
    }

    navigate(`/product${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationLabel("Location unavailable");
      return;
    }

    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`
          );
          const data = await response.json();
          const address = data.address || {};
          const place =
            address.city ||
            address.town ||
            address.state_district ||
            address.state ||
            address.country ||
            `${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`;

          setLocationLabel(place);
        } catch {
          setLocationLabel(`${coords.latitude.toFixed(2)}, ${coords.longitude.toFixed(2)}`);
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocationLoading(false);
        setLocationLabel("Permission denied");
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="py-3">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[220px_minmax(0,1fr)_auto] lg:items-center">
            <div className="flex items-center justify-between gap-3">
              <Link to="/" className="flex items-center gap-3 leading-none">
                <img
                  src="/cartnow-logo.svg"
                  alt="CartNOW"
                  className="h-11 w-11 rounded-lg border border-gray-200"
                />
                <span className="flex flex-col">
                  <span className="text-2xl font-bold tracking-tight text-gray-950">
                    Cart<span className="text-orange-500">NOW</span>
                  </span>
                  <span className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
                    Everyday store
                  </span>
                </span>
              </Link>

              <button
                onClick={handleGetLocation}
                className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 lg:hidden"
              >
                {locationLoading ? (
                  <Navigation className="h-4 w-4 animate-pulse" />
                ) : (
                  <MapPin className="h-4 w-4 text-orange-500" />
                )}
                <span className="max-w-24 truncate">
                  {locationLoading ? "Locating..." : locationLabel}
                </span>
              </button>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="flex min-w-0 items-center overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                <Search className="h-4 w-4 shrink-0 text-gray-400" />
                <input
                  type="text"
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search products, brands, electronics, fashion, accessories..."
                  className="h-12 w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                className="h-12 shrink-0 bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Search
              </button>
            </form>

            <div className="flex items-center justify-between gap-2 lg:justify-end">
              <button
                onClick={handleGetLocation}
                className="hidden items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 lg:inline-flex"
              >
                {locationLoading ? (
                  <Navigation className="h-4 w-4 animate-pulse" />
                ) : (
                  <MapPin className="h-4 w-4 text-orange-500" />
                )}
                <span className="max-w-36 truncate">
                  {locationLoading ? "Locating..." : locationLabel}
                </span>
              </button>

              <Link
                to="/cart"
                className="relative inline-flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 text-gray-700 transition hover:bg-gray-100"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-xs text-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={handleUserClick}
                  className="flex h-11 items-center gap-2 rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-800">
                    <User size={16} />
                  </span>
                  <span className="max-w-28 truncate capitalize">
                    {token ? username || "Account" : "Login"}
                  </span>
                </button>

                {token && open && (
                  <div className="absolute right-0 top-14 w-52 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl">
                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/profile");
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100"
                    >
                      Profile
                    </button>

                    <button
                      onClick={() => {
                        setOpen(false);
                        navigate("/orderdetail");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm hover:bg-gray-100"
                    >
                      <Package size={16} />
                      Orders
                    </button>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
