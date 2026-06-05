import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  CreditCard,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Search,
  Navigation,
  Loader2,
  X,
  Plus,
  Home,
  Briefcase,
  Banknote,
  Zap,
  ArrowRight,
  Check,
  Edit,
  Trash2,
  Lock,
  Mail,
  Phone,
  ShoppingCart
} from "lucide-react";
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

const inputClass =
  "w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 outline-none transition duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm hover:border-slate-300 dark:hover:border-slate-700";

const labelClass =
  "text-[10px] font-black uppercase text-slate-500 dark:text-slate-450 tracking-wider pl-1 mb-1 block";

// Fallback Product Image Component
const ProductImage = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const src = item.images?.[0]?.startsWith("http")
    ? item.images[0]
    : `${backendUrl}/${item.images?.[0]}`;

  if (imgError || !item.images?.[0]) {
    return (
      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center shrink-0">
        <ShoppingCart className="h-5 w-5 text-slate-400 dark:text-slate-500" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={item.name}
      onError={() => setImgError(true)}
      className="h-12 w-12 rounded-xl bg-white dark:bg-slate-900 object-contain p-1 border border-slate-100 dark:border-slate-800 shrink-0"
    />
  );
};

const PlaceOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("cod");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Payment, 3: Review

  // Form data for the final order placement
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    country: "India",
    phone: "",
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  
  // Address Modal States
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    pincode: "",
    flat: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    country: "India",
  });

  // Coupon engine states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${backendUrl}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Set user email defaults if form is empty
        const userEmail = res.data.user.email || "";
        setFormData(prev => ({ ...prev, email: prev.email || userEmail }));
        setModalFormData(prev => ({ ...prev, email: prev.email || userEmail }));

        if (res.data.user.addresses && res.data.user.addresses.length > 0) {
          setSavedAddresses(res.data.user.addresses);
          // Default select the first address
          const firstAddr = res.data.user.addresses[0];
          setSelectedAddressId(firstAddr._id);
          setFormData({
            firstName: firstAddr.firstName,
            lastName: firstAddr.lastName || "",
            email: firstAddr.email || userEmail,
            phone: firstAddr.phone,
            street: firstAddr.street,
            city: firstAddr.city,
            state: firstAddr.state,
            country: firstAddr.country,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile/addresses:", err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr._id);
    setFormData({
      firstName: addr.firstName,
      lastName: addr.lastName || "",
      email: addr.email || formData.email,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state,
      country: addr.country,
    });
  };

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setModalFormData({
      fullName: "",
      phone: "",
      email: formData.email || "",
      pincode: "",
      flat: "",
      area: "",
      landmark: "",
      city: "",
      state: "",
      country: "India",
    });
    setShowAddressModal(true);
  };

  const handleOpenEditModal = (addr, e) => {
    e.stopPropagation(); // Prevent selecting
    setEditingAddress(addr);
    
    // Parse street field to extract details if possible
    let flatVal = "";
    let areaVal = addr.street || "";
    let landmarkVal = "";
    let pincodeVal = "";

    // Simple heuristic parser for flat, area, landmark, pincode from street
    if (addr.street && addr.street.includes(",")) {
      const parts = addr.street.split(",");
      flatVal = parts[0]?.trim() || "";
      if (parts.length > 1) {
        // Look for pincode and landmark
        const remainingParts = parts.slice(1);
        const pinIndex = remainingParts.findIndex(p => p.toLowerCase().includes("pincode:"));
        const landmarkIndex = remainingParts.findIndex(p => p.toLowerCase().includes("landmark:"));
        
        if (pinIndex !== -1) {
          pincodeVal = remainingParts[pinIndex].split(":")[1]?.trim() || "";
          remainingParts.splice(pinIndex, 1);
        }
        if (landmarkIndex !== -1) {
          landmarkVal = remainingParts[landmarkIndex].split(":")[1]?.trim() || "";
          remainingParts.splice(landmarkIndex, 1);
        }
        areaVal = remainingParts.join(", ").trim();
      }
    }

    setModalFormData({
      fullName: `${addr.firstName} ${addr.lastName || ""}`.trim(),
      phone: addr.phone,
      email: addr.email || formData.email || "",
      pincode: pincodeVal,
      flat: flatVal,
      area: areaVal,
      landmark: landmarkVal,
      city: addr.city,
      state: addr.state,
      country: addr.country,
    });
    setShowAddressModal(true);
  };

  const handleDeleteAddress = async (addrId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        `${backendUrl}/api/user/delete-address`,
        { addressId: addrId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Address deleted successfully!");
        if (selectedAddressId === addrId) {
          setSelectedAddressId("");
          setFormData(prev => ({
            ...prev,
            firstName: "",
            lastName: "",
            phone: "",
            street: "",
            city: "",
            state: "",
            country: "India",
          }));
        }
        fetchUserProfile();
      }
    } catch (err) {
      toast.error("Failed to delete address");
    }
  };

  const handleAutofillLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setGeocodingLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          if (!res.ok) throw new Error("Failed to fetch location");
          const data = await res.json();
          if (data && data.address) {
            const addr = data.address;
            setModalFormData((prev) => ({
              ...prev,
              pincode: addr.postcode || prev.pincode || "",
              flat: addr.house_number || prev.flat || "",
              area: [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ") || prev.area || "",
              landmark: addr.amenity || addr.landmark || prev.landmark || "",
              city: addr.city || addr.town || addr.village || addr.suburb || prev.city || "",
              state: addr.state || prev.state || "",
              country: addr.country || prev.country || "India",
            }));
            toast.success("Location autofilled successfully!");
          } else {
            toast.warning("Could not resolve address details for your location.");
          }
        } catch (err) {
          console.error("Autofill geocode error:", err);
          toast.error("Failed to retrieve location details.");
        } finally {
          setGeocodingLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        toast.error("Geolocation request denied or timed out.");
        setGeocodingLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSaveModalAddress = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login first");
      return;
    }

    const { fullName, phone, email, pincode, flat, area, landmark, city, state, country } = modalFormData;

    if (!fullName.trim() || !phone.trim() || !email.trim() || !area.trim() || !city.trim() || !state.trim()) {
      toast.warning("Please fill in all required fields.");
      return;
    }

    // Split Full Name into First and Last Name
    const nameParts = fullName.trim().split(" ");
    const fName = nameParts[0] || "";
    const lName = nameParts.slice(1).join(" ") || "";

    // Join address parts for the street field
    const streetParts = [flat, area].filter(Boolean);
    if (landmark) streetParts.push(`Landmark: ${landmark}`);
    if (pincode) streetParts.push(`Pincode: ${pincode}`);
    const streetAddress = streetParts.join(", ");

    const payload = {
      firstName: fName,
      lastName: lName,
      email: email,
      phone: phone,
      street: streetAddress,
      city: city,
      state: state,
      country: country,
    };

    setLoading(true);
    try {
      if (editingAddress) {
        // Delete old address first, since there's no edit endpoint
        await axios.post(
          `${backendUrl}/api/user/delete-address`,
          { addressId: editingAddress._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const res = await axios.post(
        `${backendUrl}/api/user/add-address`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(editingAddress ? "Address updated successfully!" : "Address saved successfully!");
        setShowAddressModal(false);
        
        // Auto-select the newly added/edited address
        const addresses = res.data.addresses || [];
        // Find matching saved address (normally the last one added)
        const newAddr = addresses[addresses.length - 1];
        if (newAddr) {
          setSelectedAddressId(newAddr._id);
          setFormData({
            firstName: newAddr.firstName,
            lastName: newAddr.lastName || "",
            email: newAddr.email || email,
            phone: newAddr.phone,
            street: newAddr.street,
            city: newAddr.city,
            state: newAddr.state,
            country: newAddr.country,
          });
        }
        fetchUserProfile();
      } else {
        toast.error(res.data.message || "Failed to save address.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update saved addresses.");
    } finally {
      setLoading(false);
    }
  };

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
  const shipping = subtotal > 0 ? 10 : 0;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal + shipping - discount);

  const handleDeliverToAddress = () => {
    if (!selectedAddressId) {
      toast.warning("Please select a delivery address.");
      return;
    }
    setActiveStep(2);
  };

  const handleUsePaymentMethod = () => {
    if (!method) {
      toast.warning("Please select a payment method.");
      return;
    }
    setActiveStep(3);
  };

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
        setError(`Address field is incomplete: ${field}`);
        setActiveStep(1);
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
          toast.success("Order placed successfully!");
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
                  isMock: true,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              );

              if (verifyRes.data.success) {
                toast.success("Mock payment verified!");
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
            setError("Failed to load Razorpay script.");
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
                    isMock: rzpOrder.isMock,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                if (verifyRes.data.success) {
                  toast.success("Payment verified successfully!");
                  navigate(`/order-confirmed/${orderId}`);
                } else {
                  setError(verifyRes.data.message || "Signature verification failed.");
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
              contact: formData.phone,
            },
            theme: {
              color: "#000000",
            },
            modal: {
              ondismiss: () => {
                setError("Payment checkout cancelled by user.");
              },
            },
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

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-24 pb-20 flex items-center justify-center transition-colors duration-200">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 text-center shadow-sm">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">No products in checkout</p>
          <p className="text-xs text-slate-400 dark:text-slate-550 mt-1">Please add items to your cart first.</p>
          <button
            onClick={() => navigate("/product")}
            className="mt-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/10 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 px-4 sm:px-6 pt-20 pb-16 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <form onSubmit={onSubmitHandler} className="mx-auto max-w-6xl">
        
        {/* COMPACT PROGRESS HEADER */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-4">
          <div className="text-center sm:text-left mb-2 sm:mb-0">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Checkout Process</span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight mt-0.5">Checkout</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800 px-4 py-2 rounded-xl text-xs shadow-sm">
            <button
              type="button"
              disabled={activeStep < 1}
              onClick={() => setActiveStep(1)}
              className={`font-bold transition hover:text-orange-500 ${activeStep === 1 ? "text-orange-500" : "text-slate-400 dark:text-slate-500"}`}
            >
              1. Address
            </button>
            <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              disabled={!selectedAddressId}
              onClick={() => setActiveStep(2)}
              className={`font-bold transition hover:text-orange-500 ${activeStep === 2 ? "text-orange-500" : "text-slate-400 dark:text-slate-500"}`}
            >
              2. Payment
            </button>
            <div className="h-3 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <button
              type="button"
              disabled={!selectedAddressId || !method}
              onClick={() => setActiveStep(3)}
              className={`font-bold transition hover:text-orange-500 ${activeStep === 3 ? "text-orange-500" : "text-slate-400 dark:text-slate-500"}`}
            >
              3. Review
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 px-4 py-2.5 text-xs text-red-700 dark:text-red-400 text-left flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          
          {/* LEFT WIZARD COLUMN */}
          <div className="space-y-4">
            
            {/* STEP 1: SELECT A DELIVERY ADDRESS */}
            <section className={`rounded-2xl border transition duration-200 bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 shadow-sm ${
              activeStep === 1 ? "border-orange-500/30" : "border-slate-200/80 dark:border-slate-800/80"
            }`}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg font-extrabold text-xs border transition ${
                    activeStep === 1
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                      : activeStep > 1
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700"
                  }`}>
                    {activeStep > 1 ? <Check size={12} /> : "1"}
                  </div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider">Select a delivery address</h2>
                </div>

                {activeStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="text-xs font-black text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition flex items-center gap-1 bg-orange-500/5 dark:bg-orange-500/10 px-2.5 py-1 rounded-lg"
                  >
                    Change
                  </button>
                )}
              </div>

              {activeStep === 1 ? (
                <div className="space-y-4 text-left">
                  {savedAddresses.length > 0 ? (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Delivery addresses ({savedAddresses.length})</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {savedAddresses.map((addr) => {
                          const isSelected = selectedAddressId === addr._id;
                          return (
                            <div
                              key={addr._id}
                              onClick={() => handleSelectAddress(addr)}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition duration-150 cursor-pointer ${
                                isSelected
                                  ? "border-orange-500 bg-orange-50/10 dark:bg-orange-950/5 shadow-sm"
                                  : "border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name="selectedAddress"
                                checked={isSelected}
                                onChange={() => handleSelectAddress(addr)}
                                className="mt-1 h-3.5 w-3.5 text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-800"
                              />
                              <div className="min-w-0 flex-1 text-xs">
                                <span className="font-extrabold text-slate-900 dark:text-slate-100">{addr.firstName} {addr.lastName}</span>
                                <p className="text-slate-600 dark:text-slate-405 mt-0.5 leading-snug">{addr.street}</p>
                                <p className="text-slate-450 dark:text-slate-500 mt-0.5">{addr.city}, {addr.state}, {addr.country}</p>
                                <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-1 font-semibold">Phone: {addr.phone}</p>
                                
                                <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-450">
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenEditModal(addr, e)}
                                    className="text-orange-500 hover:underline font-bold"
                                  >
                                    Edit address
                                  </button>
                                  <span className="text-slate-300 dark:text-slate-850">|</span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteAddress(addr._id, e)}
                                    className="text-red-500 hover:underline font-bold flex items-center gap-0.5"
                                  >
                                    <Trash2 size={10} /> Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="py-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
                      <p className="text-xs text-slate-450 font-bold">No saved addresses found.</p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex flex-wrap gap-2 items-center justify-between">
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-600 transition"
                    >
                      <Plus size={14} />
                      <span>Add a new delivery address</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDeliverToAddress}
                      disabled={!selectedAddressId}
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/10 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      Deliver to this address
                    </button>
                  </div>
                </div>
              ) : (
                /* COLLAPSED SUMMARY STATE */
                <div className="text-left bg-slate-50/30 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-xs flex items-start gap-2.5 leading-snug">
                  <MapPin className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">
                      {formData.firstName} {formData.lastName}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 ml-1">
                      - {formData.street}, {formData.city}, {formData.state}, {formData.country} (Phone: {formData.phone})
                    </span>
                  </div>
                </div>
              )}
            </section>

            {/* STEP 2: SELECT A PAYMENT METHOD */}
            <section className={`rounded-2xl border transition duration-200 bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 shadow-sm ${
              activeStep === 2 ? "border-orange-500/30" : "border-slate-200/80 dark:border-slate-800/80"
            } ${activeStep < 2 ? "opacity-60" : ""}`}>
              
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg font-extrabold text-xs border transition ${
                    activeStep === 2
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm shadow-orange-500/20"
                      : activeStep > 2
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700"
                  }`}>
                    {activeStep > 2 ? <Check size={12} /> : "2"}
                  </div>
                  <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider">Select a payment method</h2>
                </div>

                {activeStep > 2 && (
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="text-xs font-black text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition flex items-center gap-1 bg-orange-500/5 dark:bg-orange-500/10 px-2.5 py-1 rounded-lg"
                  >
                    Change
                  </button>
                )}
              </div>

              {activeStep === 2 ? (
                <div className="space-y-4 text-left">
                  <div className="grid gap-2">
                    {[
                      { id: "stripe", title: "Stripe Secure Cards", desc: "Pay with Visa, Mastercard, AMEX", icon: CreditCard, color: "text-indigo-500" },
                      { id: "razorpay", title: "Razorpay Gateway", desc: "Pay with UPI, NetBanking, Cards", icon: Zap, color: "text-sky-500" },
                      { id: "cod", title: "Cash on Delivery (COD)", desc: "Pay cash to the delivery agent", icon: Banknote, color: "text-emerald-500" }
                    ].map((m) => {
                      const isSelected = method === m.id;
                      const Icon = m.icon;
                      return (
                        <div
                          key={m.id}
                          onClick={() => setMethod(m.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer ${
                            isSelected
                              ? "border-orange-500 bg-orange-50/10 dark:bg-orange-950/5 shadow-sm"
                              : "border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            checked={isSelected}
                            onChange={() => setMethod(m.id)}
                            className="mt-1 h-3.5 w-3.5 text-orange-500 focus:ring-orange-500 border-slate-300 dark:border-slate-800"
                          />
                          <div className="flex-1 text-xs">
                            <span className="font-extrabold text-slate-805 dark:text-slate-100 flex items-center gap-1.5">
                              <Icon size={14} className={m.color} />
                              {m.title}
                            </span>
                            <p className="text-slate-450 dark:text-slate-500 mt-0.5 leading-snug">{m.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex justify-end">
                    <button
                      type="button"
                      onClick={handleUsePaymentMethod}
                      disabled={!method}
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/10 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                    >
                      Use this payment method
                    </button>
                  </div>
                </div>
              ) : activeStep > 2 ? (
                /* COLLAPSED SUMMARY STATE */
                <div className="text-left bg-slate-50/30 dark:bg-slate-900/10 p-3 rounded-xl border border-slate-100 dark:border-slate-800/40 text-xs flex items-center gap-2.5 leading-snug">
                  <CreditCard className="h-4 w-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="font-extrabold text-slate-850 dark:text-slate-200">Payment: </span>
                    <span className="text-slate-600 dark:text-slate-400 capitalize">
                      {method === "cod" ? "Cash on Delivery (COD)" : method === "stripe" ? "Stripe (Secure Cards)" : "Razorpay Gateway"}
                    </span>
                  </div>
                </div>
              ) : (
                /* LOCKED STATE */
                <div className="text-left py-2.5 pl-9 text-xs text-slate-450 font-bold flex items-center gap-2">
                  <Lock size={12} className="text-slate-350 dark:text-slate-700" />
                  <span>Please complete delivery address details first.</span>
                </div>
              )}
            </section>

            {/* STEP 3: REVIEW ITEMS AND DELIVERY */}
            <section className={`rounded-2xl border transition duration-200 bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 sm:p-5 shadow-sm ${
              activeStep === 3 ? "border-orange-500/30" : "border-slate-200/80 dark:border-slate-800/80"
            } ${activeStep < 3 ? "opacity-60" : ""}`}>
              
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3 mb-4">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg font-extrabold text-xs border transition bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700">
                  3
                </div>
                <h2 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wider">Review items and delivery</h2>
              </div>

              {activeStep === 3 ? (
                <div className="space-y-4">
                  {/* Order items checklist */}
                  <div className="space-y-2">
                    {products.map((item, i) => (
                      <div
                        key={`${item._id}-${item.size}-${i}`}
                        className="flex gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20 p-2.5 text-left"
                      >
                        <ProductImage item={item} />
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate">{item.name}</p>
                          <p className="mt-0.5 text-[10px] text-slate-450 dark:text-slate-550 font-bold uppercase tracking-wider">
                            Qty {item.qty} · Size {item.size}
                          </p>
                          <p className="mt-1 font-bold text-slate-950 dark:text-slate-50">
                            ₹{item.price * item.qty}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submission Notice & Submit Button (Mobile fallback placement) */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-850 text-left space-y-3">
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed font-semibold">
                      By placing your order, you agree to CartNOW's conditions of use and privacy policy. We will send you an email receipt upon order placement.
                    </p>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-98 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Placing order...</span>
                        </>
                      ) : (
                        <>
                          <span>Place your order</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                /* LOCKED STATE */
                <div className="text-left py-2.5 pl-9 text-xs text-slate-450 font-bold flex items-center gap-2">
                  <Lock size={12} className="text-slate-350 dark:text-slate-700" />
                  <span>Please complete previous steps.</span>
                </div>
              )}
            </section>

          </div>

          {/* RIGHT SIDEBAR (STICKY SUMMARY CARD) */}
          <aside className="h-fit rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 backdrop-blur-md p-4 shadow-sm dark:shadow-slate-950/10 lg:sticky lg:top-24 space-y-4">
            
            {/* Primary Yellow/Orange CTA */}
            <button
              type={activeStep === 3 ? "submit" : "button"}
              onClick={activeStep === 1 ? handleDeliverToAddress : activeStep === 2 ? handleUsePaymentMethod : undefined}
              disabled={loading || (activeStep === 1 && !selectedAddressId) || (activeStep === 2 && !method)}
              className="w-full rounded-xl bg-[#e5a93b] hover:bg-[#d8972d] dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:to-amber-600 py-3 text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider transition active:scale-98 disabled:opacity-55 shadow-md shadow-orange-500/5 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {activeStep === 1 ? (
                <span>Deliver to this address</span>
              ) : activeStep === 2 ? (
                <span>Use this payment method</span>
              ) : loading ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place your order</span>
              )}
            </button>
            
            <p className="text-[10px] text-slate-450 dark:text-slate-500 font-semibold text-center mt-1">
              Choose a delivery address and payment method to continue.
            </p>

            <hr className="border-slate-100 dark:border-slate-850" />

            <div className="text-left space-y-2 text-xs">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-[11px] uppercase tracking-wider mb-2">Order Summary</h3>
              
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">₹{subtotal}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-455 font-bold">
                  <span>Coupon Discount:</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Shipping & handling:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">₹{shipping}</span>
              </div>
              
              <hr className="border-slate-100 dark:border-slate-850 my-2" />

              <div className="flex justify-between text-sm font-black text-rose-700 dark:text-orange-500">
                <span>Order Total:</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            {/* Promo Code Input Block */}
            <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/20 dark:bg-slate-950/20 text-left">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
                Apply Promo Code
              </p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-orange-50/40 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-900/20 rounded-lg px-2.5 py-1.5 text-[11px] text-orange-700 dark:text-orange-450 font-bold">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-wider shrink-0">
                      {appliedCoupon.code}
                    </span>
                    <span className="truncate">-₹{appliedCoupon.discountAmount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[10px] text-slate-450 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-350 cursor-pointer transition font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WELCOME10"
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider outline-none focus:border-orange-500 text-slate-900 dark:text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-slate-900 dark:bg-orange-600 hover:bg-slate-850 dark:hover:bg-orange-700 text-white font-black text-[9px] uppercase tracking-wider px-3 rounded-lg active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-1 text-[9px] font-bold text-rose-500">
                  {couponError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-50/50 dark:bg-slate-955/20 px-2.5 py-2 text-[10px] text-slate-450 dark:text-slate-500 border border-slate-100 dark:border-slate-800/40 text-left font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>Secure checkout. SSL encryption active.</span>
            </div>

          </aside>
        </div>
      </form>

      {/* ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {editingAddress ? "Edit your address" : "Add a new address"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-150 dark:hover:bg-slate-800 text-slate-550 dark:text-slate-400 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModalAddress} className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[75vh] text-left">
              
              {/* Geolocation Autofill Banner */}
              <div className="flex items-center justify-between gap-3 bg-[#e2f6ff] dark:bg-sky-950/20 border border-[#bce8ff] dark:border-sky-900/30 rounded-xl px-3.5 py-2.5 text-xs text-[#004e7c] dark:text-sky-400 font-semibold shadow-sm">
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-[#0082c8] dark:text-sky-400 shrink-0 animate-pulse" />
                  <span>Save time. Autofill your current location.</span>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillLocation}
                  disabled={geocodingLoading}
                  className="rounded-lg border border-[#0082c8] dark:border-sky-500 bg-white dark:bg-slate-900/40 px-3 py-1 text-[11px] font-black text-[#0082c8] dark:text-sky-450 hover:bg-[#bce8ff] dark:hover:bg-sky-900/30 transition shrink-0 disabled:opacity-50"
                >
                  {geocodingLoading ? "Loading..." : "Autofill"}
                </button>
              </div>

              {/* Form Input fields */}
              <div>
                <label className={labelClass}>Country/Region</label>
                <select
                  value={modalFormData.country}
                  onChange={(e) => setModalFormData({ ...modalFormData, country: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 text-slate-900 dark:text-slate-100 outline-none"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Full name (First and Last name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sachin kumar"
                  value={modalFormData.fullName}
                  onChange={(e) => setModalFormData({ ...modalFormData, fullName: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Mobile number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={modalFormData.phone}
                    onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                    className={inputClass}
                  />
                  <span className="text-[9px] text-slate-400 mt-0.5 block pl-1 font-semibold">May be used to assist delivery</span>
                </div>
                
                <div>
                  <label className={labelClass}>Pincode</label>
                  <input
                    type="text"
                    placeholder="6-digit PIN code"
                    value={modalFormData.pincode}
                    onChange={(e) => setModalFormData({ ...modalFormData, pincode: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Flat, House no., Building, Company, Apartment</label>
                <input
                  type="text"
                  placeholder="Flat/House No."
                  value={modalFormData.flat}
                  onChange={(e) => setModalFormData({ ...modalFormData, flat: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Area, Street, Sector, Village *</label>
                <input
                  type="text"
                  required
                  placeholder="Street / Locality details"
                  value={modalFormData.area}
                  onChange={(e) => setModalFormData({ ...modalFormData, area: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. near Apollo Hospital"
                  value={modalFormData.landmark}
                  onChange={(e) => setModalFormData({ ...modalFormData, landmark: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Town/City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={modalFormData.city}
                    onChange={(e) => setModalFormData({ ...modalFormData, city: e.target.value })}
                    className={inputClass}
                  />
                </div>
                
                <div>
                  <label className={labelClass}>State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={modalFormData.state}
                    onChange={(e) => setModalFormData({ ...modalFormData, state: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-xl border border-slate-205 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-[#e5a93b] hover:bg-[#d8972d] dark:bg-gradient-to-r dark:from-orange-500 dark:to-amber-500 px-5 py-2.5 text-xs font-black text-slate-955 dark:text-white uppercase tracking-wider shadow-md active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Address"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;
