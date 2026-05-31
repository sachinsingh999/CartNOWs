import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { CreditCard, MapPin, PackageCheck, ShieldCheck, Search, Navigation, Loader2, X } from "lucide-react";
import { backendUrl } from "../config";
import { toast } from "react-toastify";

// Helper function to dynamically load Razorpay checkout script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

let leafletLoadingPromise = null;
const geocodeCache = new Map();

// Helper function to dynamically load Leaflet CSS/JS assets
const loadLeafletAssets = () => {
  if (window.L) return Promise.resolve(true);
  if (leafletLoadingPromise) return leafletLoadingPromise;

  leafletLoadingPromise = new Promise((resolve) => {
    let cssLoaded = false;
    let jsLoaded = false;

    const checkResolve = () => {
      if (cssLoaded && jsLoaded) {
        resolve(true);
      }
    };

    // Load CSS
    const linkId = "leaflet-css-cdn";
    let link = document.getElementById(linkId);
    if (!link) {
      link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.onload = () => {
        cssLoaded = true;
        checkResolve();
      };
      link.onerror = () => {
        console.error("Failed to load Leaflet CSS");
        cssLoaded = true; // Proceed anyway, JS is the main dependency
        checkResolve();
      };
      document.head.appendChild(link);
    } else {
      cssLoaded = true;
    }

    // Load JS
    const scriptId = "leaflet-js-cdn";
    let script = document.getElementById(scriptId);
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        jsLoaded = true;
        checkResolve();
      };
      script.onerror = () => {
        console.error("Failed to load Leaflet JS");
        leafletLoadingPromise = null; // reset
        resolve(false);
      };
      document.body.appendChild(script);
    } else {
      if (window.L) {
        jsLoaded = true;
      } else {
        script.addEventListener("load", () => {
          jsLoaded = true;
          checkResolve();
        });
        script.addEventListener("error", () => {
          leafletLoadingPromise = null;
          resolve(false);
        });
      }
    }

    if (cssLoaded && jsLoaded) {
      resolve(true);
    }
  });

  return leafletLoadingPromise;
};

const inputClass =
  "w-full rounded-md border border-gray-300 dark:border-slate-805 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-gray-900 dark:text-slate-100 outline-none transition focus:border-gray-950 dark:focus:border-slate-100 focus:ring-1 focus:ring-gray-950 dark:focus:ring-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-500";

const PlaceOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("cod");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "",
    phone: "",
  });

  // Map state and refs
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapLoading, setMapLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mapAddress, setMapAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    display: ""
  });

  // Coupon engine states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    const token = localStorage.getItem("token") || "";

    if (!token) {
      setCouponError("Please login to use coupon codes");
      setCouponLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${backendUrl}/api/coupon/apply`,
        { code: couponCode, cartAmount: subtotal },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setAppliedCoupon(response.data);
        toast.success("Coupon applied successfully!");
      } else {
        setCouponError(response.data.message);
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || "Failed to apply coupon");
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);
  const lastGeocodeRequestTime = useRef(0);
  const geocodeTimeoutRef = useRef(null);

  const reverseGeocode = async (lat, lon) => {
    // Round coordinates to 5 decimal places (~1.1 meter resolution) for high-hit caching
    const key = `${lat.toFixed(5)},${lon.toFixed(5)}`;
    if (geocodeCache.has(key)) {
      const cached = geocodeCache.get(key);
      setMapAddress(cached);
      setFormData((prev) => ({
        ...prev,
        street: cached.street || prev.street,
        city: cached.city || prev.city,
        state: cached.state || prev.state,
        country: cached.country || prev.country,
      }));
      return;
    }

    // Enforce OSM Nominatim rate limit (maximum 1 request per second)
    const now = Date.now();
    const timeElapsed = now - lastGeocodeRequestTime.current;
    if (timeElapsed < 1000) {
      // Debounce: delay the query until the 1s cooldown clears
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
      geocodeTimeoutRef.current = setTimeout(() => {
        reverseGeocode(lat, lon);
      }, 1000 - timeElapsed);
      return;
    }

    lastGeocodeRequestTime.current = now;
    setGeocodingLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      );
      if (!response.ok) {
        throw new Error(`Nominatim error: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        
        // Construct street address
        const streetNum = addr.house_number || "";
        const road = addr.road || addr.suburb || addr.neighbourhood || "";
        const streetStr = [streetNum, road].filter(Boolean).join(" ") || data.name || "Selected Location";
        
        const cityStr = addr.city || addr.town || addr.village || addr.suburb || "";
        const stateStr = addr.state || "";
        const countryStr = addr.country || "";
        
        const addressData = {
          street: streetStr,
          city: cityStr,
          state: stateStr,
          country: countryStr,
          display: data.display_name
        };

        // Cache coordinates lookup result
        geocodeCache.set(key, addressData);

        setMapAddress(addressData);

        // Auto-fill form fields in real-time
        setFormData((prev) => ({
          ...prev,
          street: streetStr || prev.street,
          city: cityStr || prev.city,
          state: stateStr || prev.state,
          country: countryStr || prev.country,
        }));
      } else {
        toast.warning("Could not fetch address details for this exact point.");
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      toast.warning("Failed to retrieve address details. You can still input details manually.");
    } finally {
      setGeocodingLoading(false);
    }
  };

  const handleOpenMapModal = async () => {
    setShowMapModal(true);
    setMapLoading(true);
    const loaded = await loadLeafletAssets();
    setMapLoading(false);
    if (!loaded) {
      toast.error("Failed to load map library");
      setShowMapModal(false);
      return;
    }
  };

  const handleMapSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Map search error:", err);
      toast.error("Error searching location");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);
    
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 16);
      markerInstanceRef.current.setLatLng([lat, lon]);
      reverseGeocode(lat, lon);
    }
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleConfirmAddress = () => {
    setFormData((prev) => ({
      ...prev,
      street: mapAddress.street || prev.street,
      city: mapAddress.city || prev.city,
      state: mapAddress.state || prev.state,
      country: mapAddress.country || prev.country,
    }));
    setShowMapModal(false);
    toast.success("Delivery address updated from map!");
  };

  useEffect(() => {
    if (!showMapModal || mapLoading || !mapRef.current || !window.L) return;

    if (mapInstanceRef.current) return;

    const defaultLat = 28.6139; // Delhi
    const defaultLon = 77.2090;

    const isDarkMode = localStorage.getItem("theme") === "dark" || 
                       document.documentElement.classList.contains("dark");

    const map = window.L.map(mapRef.current).setView([defaultLat, defaultLon], 13);
    mapInstanceRef.current = map;

    // Use a custom SVG icon for the map marker
    const svgIcon = window.L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ea580c" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 32px; height: 32px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3" fill="#ffffff"/></svg>`,
      className: 'custom-map-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });

    const tileUrl = isDarkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png";

    const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    const tileLayer = window.L.tileLayer(tileUrl, { 
      attribution,
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    tileLayer.on("tileerror", () => {
      console.warn("CartoDB tiles failed to load. Falling back to standard OpenStreetMap.");
      tileLayer.setUrl("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
    });

    const marker = window.L.marker([defaultLat, defaultLon], { 
      draggable: true,
      icon: svgIcon
    }).addTo(map);
    markerInstanceRef.current = marker;

    reverseGeocode(defaultLat, defaultLon);

    marker.on("dragend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      reverseGeocode(lat, lng);
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });

    // Use ResizeObserver with a debounce delay to prevent layout thrashing during animation frames
    let resizeTimeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    });
    if (mapRef.current) {
      resizeObserver.observe(mapRef.current);
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([userLat, userLon], 15);
            marker.setLatLng([userLat, userLon]);
            reverseGeocode(userLat, userLon);
          }
        },
        () => {
          console.log("Geolocation permission denied");
        }
      );
    }

    return () => {
      clearTimeout(resizeTimeout);
      if (geocodeTimeoutRef.current) clearTimeout(geocodeTimeoutRef.current);
      resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, [showMapModal, mapLoading]);

  const onChangeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const singleProduct = location.state?.product;
  const cartItems = location.state?.cartItems;
  const qty = location.state?.qty || 1;
  const size = location.state?.size || "N/A";

  const products = cartItems
    ? cartItems
    : singleProduct
    ? [{ ...singleProduct, qty, size }]
    : [];

  const subtotal = products.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping = 10;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = subtotal + shipping - discount;

  if (products.length === 0) {
    return (
      <div className="min-h-[60vh] bg-gray-50 dark:bg-slate-950 px-6 py-20 flex items-center justify-center transition-colors duration-200">
        <div className="mx-auto max-w-md rounded-lg border border-dashed border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-gray-955 dark:text-slate-100">No product selected</p>
          <button
            onClick={() => navigate("/product")}
            className="mt-5 rounded-md bg-black dark:bg-orange-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-805 dark:hover:bg-orange-500 cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      return;
    }

    const requiredFields = [
      "firstName",
      "email",
      "street",
      "city",
      "state",
      "country",
      "phone",
    ];

    for (const field of requiredFields) {
      if (!formData[field]) {
        setError("All fields are required");
        return;
      }
    }

    const items = products.map((item) => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      qty: item.qty,
      size: item.size,
      image: item.images?.[0],
    }));

    try {
      setLoading(true);

      if (method === "cod") {
        const res = await axios.post(
          `${backendUrl}/api/order/place`,
          {
            items,
            amount: finalTotal,
            address: { ...formData },
            paymentMethod: "cod",
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            discount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          toast.success("Order placed successfully via COD!");
          navigate(`/order-confirmed/${res.data.order._id}`, {
            state: { order: res.data.order },
          });
        } else {
          setError(res.data.message || "Order placement failed.");
        }

      } else if (method === "stripe") {
        const res = await axios.post(
          `${backendUrl}/api/order/stripe`,
          {
            items,
            amount: finalTotal,
            address: { ...formData },
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            discount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success && res.data.session_url) {
          window.location.href = res.data.session_url;
        } else {
          setError(res.data.message || "Stripe session creation failed.");
        }

      } else if (method === "razorpay") {
        const res = await axios.post(
          `${backendUrl}/api/order/rozorpay`,
          {
            items,
            amount: finalTotal,
            address: { ...formData },
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            discount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success && res.data.rzpOrder) {
          const { key_id, rzpOrder, orderId } = res.data;
          
          if (rzpOrder.isMock) {
            toast.info("Razorpay keys not configured. Simulating payment...");
            try {
              setLoading(true);
              const verifyRes = await axios.post(
                `${backendUrl}/api/order/verifyRazorpay`,
                {
                  orderId: orderId,
                  razorpay_payment_id: `pay_mock_${Date.now()}`,
                  razorpay_order_id: rzpOrder.id,
                  razorpay_signature: "mock_signature",
                  isMock: true
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.success) {
                toast.success("Mock payment verified and order registered!");
                navigate(`/order-confirmed/${orderId}`);
              } else {
                setError(verifyRes.data.message || "Mock signature verification failed.");
              }
            } catch (err) {
              setError(err.response?.data?.message || err.message);
            } finally {
              setLoading(false);
            }
            return;
          }

          const isLoaded = await loadRazorpayScript();
          if (!isLoaded) {
            setError("Failed to load Razorpay script. Please check your internet connection.");
            return;
          }

          const options = {
            key: key_id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "CartNOW Checkout",
            description: `Payment for Order #${orderId.substring(orderId.length - 6)}`,
            order_id: rzpOrder.id,
            handler: async (response) => {
              try {
                setLoading(true);
                const verifyRes = await axios.post(
                  `${backendUrl}/api/order/verifyRazorpay`,
                  {
                    orderId: orderId,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    isMock: rzpOrder.isMock
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (verifyRes.data.success) {
                  toast.success("Payment verified and order registered!");
                  navigate(`/order-confirmed/${orderId}`);
                } else {
                  setError(verifyRes.data.message || "Razorpay signature verification failed.");
                }
              } catch (err) {
                setError(err.response?.data?.message || err.message);
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              contact: formData.phone
            },
            theme: {
              color: "#000000"
            },
            modal: {
              ondismiss: () => {
                setError("Payment checkout cancelled by user.");
              }
            }
          };

          if (window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.open();
          } else {
            setError("Razorpay SDK was not initialized correctly.");
          }
        } else {
          setError(res.data.message || "Razorpay order creation failed.");
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong during checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 px-6 py-12 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <form onSubmit={onSubmitHandler} className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Checkout
          </p>
          <h1 className="mt-2 text-4xl font-bold text-gray-950 dark:text-slate-50">Place Order</h1>
        </div>

        {error && (
          <p className="mb-6 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </p>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 dark:border-slate-805 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20">
              <div className="mb-6 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-slate-800">
                    <MapPin className="h-5 w-5 text-gray-700 dark:text-slate-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-955 dark:text-slate-50">Delivery Information</h2>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Where should we send your order?</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenMapModal}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 px-3.5 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition active:scale-95 cursor-pointer shadow-sm shrink-0"
                >
                  <MapPin size={14} className="animate-bounce" />
                  <span>Locate on Map</span>
                </button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <input name="firstName" value={formData.firstName} placeholder="First Name" onChange={onChangeHandler} className={inputClass} />
                <input name="lastName" value={formData.lastName} placeholder="Last Name" onChange={onChangeHandler} className={inputClass} />
                <input name="email" value={formData.email} placeholder="Email" onChange={onChangeHandler} className={`${inputClass} sm:col-span-2`} />
                <input name="street" value={formData.street} placeholder="Street Address" onChange={onChangeHandler} className={`${inputClass} sm:col-span-2`} />
                <input name="city" value={formData.city} placeholder="City" onChange={onChangeHandler} className={inputClass} />
                <input name="state" value={formData.state} placeholder="State" onChange={onChangeHandler} className={inputClass} />
                <input name="country" value={formData.country} placeholder="Country" onChange={onChangeHandler} className={inputClass} />
                <input name="phone" value={formData.phone} placeholder="Phone" onChange={onChangeHandler} className={inputClass} />
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 dark:border-slate-805 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-slate-800">
                  <CreditCard className="h-5 w-5 text-gray-700 dark:text-slate-300" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-955 dark:text-slate-50">Payment Method</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Choose how you want to pay.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {["stripe", "razorpay", "cod"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`rounded-md border px-4 py-3 text-sm font-semibold transition cursor-pointer ${
                      method === m
                        ? "border-black dark:border-orange-550 bg-black dark:bg-orange-600 text-white"
                        : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {m === "cod" ? "Cash on Delivery" : m.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-lg border border-gray-200 dark:border-slate-805 bg-white dark:bg-slate-900/50 p-6 shadow-sm dark:shadow-slate-950/20 lg:sticky lg:top-28">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 dark:bg-slate-800">
                <PackageCheck className="h-5 w-5 text-gray-700 dark:text-slate-300" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-955 dark:text-slate-50">Order Summary</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">{products.length} product lines</p>
              </div>
            </div>

            <div className="space-y-4">
              {products.map((item, i) => (
                <div key={`${item._id}-${item.size}-${i}`} className="flex gap-4 rounded-lg border border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 p-3">
                  <img
                    src={item.images?.[0]?.startsWith("http") ? item.images[0] : `${backendUrl}/${item.images?.[0]}`}
                    alt={item.name}
                    className="h-16 w-16 rounded-md bg-white dark:bg-slate-900 object-contain p-2 border border-gray-100 dark:border-slate-800"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-950 dark:text-slate-100">{item.name}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      Qty {item.qty} · Size {item.size}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-955 dark:text-slate-50">
                      ₹{item.price * item.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input Block */}
            <div className="mt-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-950/20">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5 text-left">
                Apply Promo Code
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl px-3 py-2 text-xs text-orange-700 dark:text-orange-450 font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#FF5100] text-white px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">
                      {appliedCoupon.code}
                    </span>
                    <span>Applied (-₹{appliedCoupon.discountAmount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer transition"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE (e.g. WELCOME10)"
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-bold uppercase tracking-wider outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-slate-900 hover:bg-slate-850 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-black text-[10px] uppercase tracking-wider px-4 rounded-xl active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-1.5 text-[10px] font-semibold text-rose-500 text-left">
                  {couponError}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-3 text-sm font-semibold text-gray-650">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-950 dark:text-slate-100">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-455 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Shipping</span>
                <span className="font-semibold text-gray-955 dark:text-slate-100">₹{shipping}</span>
              </div>
              <div className="flex items-center gap-2 rounded-md bg-gray-50 dark:bg-slate-950/40 px-3 py-2 text-xs text-gray-550 dark:text-slate-400 border border-gray-100 dark:border-slate-800">
                <ShieldCheck className="h-4 w-4 text-gray-700 dark:text-slate-350" />
                Secure checkout and order tracking included.
              </div>
            </div>

            <hr className="my-6 border-gray-200 dark:border-slate-800" />

            <div className="flex justify-between text-lg font-bold text-gray-955 dark:text-slate-50">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>

            <button
              disabled={loading}
              className="mt-6 w-full rounded-md bg-black dark:bg-orange-600 py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:hover:bg-orange-500 disabled:opacity-60 cursor-pointer"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </aside>
        </div>
      </form>

      {/* Map Modal Backdrop */}
      {showMapModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Locate Delivery Address</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">Search place or drag pin to your exact door</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Bar Row */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative z-30">
              <form onSubmit={handleMapSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search landmark, street, building..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-orange-500 transition"
                  />
                  {searchLoading && (
                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
                  )}
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-orange-600 hover:bg-slate-800 dark:hover:bg-orange-500 text-sm font-bold text-white transition cursor-pointer disabled:opacity-50"
                >
                  Search
                </button>
              </form>

              {/* Suggestions dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute left-4 right-4 top-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-45 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full text-left px-4 py-3 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors duration-150 block truncate"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Map Frame */}
            <div className="flex-1 w-full relative z-10 bg-slate-100 dark:bg-slate-950 min-h-[350px] md:min-h-[450px]">
              {mapLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-sm z-20">
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 animate-pulse">Loading map library...</p>
                </div>
              ) : null}
              <div ref={mapRef} className="absolute inset-0 w-full h-full" />
            </div>

            {/* Footer Address Preview / Geocoding Status */}
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-3 items-start w-full md:max-w-[70%]">
                <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-900/40">
                  <Navigation size={16} className="text-orange-500 animate-pulse" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Geocoded Address</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                    {geocodingLoading ? (
                      <span className="flex items-center gap-1.5 text-orange-500 animate-pulse">
                        <Loader2 size={12} className="animate-spin" />
                        Fetching location details...
                      </span>
                    ) : (
                      mapAddress.display || "Click on the map or drag the marker to fetch address details..."
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAddress}
                  disabled={!mapAddress.street || geocodingLoading || mapLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-xs font-black text-white shadow-md shadow-orange-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  Confirm Address
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
