import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ShoppingCart,
  RotateCcw,
  Truck,
  Award,
  Headphones
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
  "w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none transition duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm hover:border-slate-350 dark:hover:border-slate-700";

const labelClass =
  "text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider pl-1 mb-1 block";

// Fallback Product Image Component
const ProductImage = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const src = item.images?.[0]?.startsWith("http")
    ? item.images[0]
    : `${backendUrl}/${item.images?.[0]}`;

  if (imgError || !item.images?.[0]) {
    return (
      <div className="h-10 w-10 rounded-sm bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center shrink-0">
        <ShoppingCart className="h-4 w-4 text-slate-400 dark:text-slate-505" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={item.name}
      onError={() => setImgError(true)}
      className="h-10 w-10 rounded-sm bg-white dark:bg-slate-900 object-contain p-0.5 shrink-0"
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
  const [modalErrors, setModalErrors] = useState({});
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [searchingMapLocation, setSearchingMapLocation] = useState(false);
  
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
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
  const [couponCode, setCouponCode] = useState(location.state?.appliedCoupon?.code || "");
  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);
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
            lat: firstAddr.lat || 0,
            lng: firstAddr.lng || 0,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch user profile/addresses:", err);
    }
  };

  const validateField = (name, value) => {
    let err = "";
    const trimmed = (value || "").trim();
    if (name === "fullName") {
      const parts = trimmed.split(/\s+/);
      if (!trimmed) {
        err = "Full name is required";
      } else if (parts.length < 2) {
        err = "Please enter both first and last name (separated by space)";
      }
    } else if (name === "phone") {
      let cleaned = trimmed.replace(/\D/g, "");
      if (cleaned.length === 11 && cleaned.startsWith("0")) {
        cleaned = cleaned.slice(1);
      } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
        cleaned = cleaned.slice(2);
      }
      if (!trimmed) {
        err = "Mobile number is required";
      } else if (!/^\d{10}$/.test(cleaned)) {
        err = "Mobile number must be a valid 10-digit number";
      }
    } else if (name === "pincode") {
      if (!trimmed) {
        err = "Pincode is required";
      } else if (!/^\d{6}$/.test(trimmed)) {
        err = "Pincode must be exactly 6 digits";
      }
    } else if (name === "area") {
      if (!trimmed) {
        err = "Area/Street is required";
      }
    } else if (name === "city") {
      if (!trimmed) {
        err = "Town/City is required";
      }
    } else if (name === "state") {
      if (!trimmed) {
        err = "State is required";
      }
    }
    return err;
  };

  const updateAddressFromCoords = useCallback(async (lat, lng) => {
    setGeocodingLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          setModalFormData(prev => ({
            ...prev,
            pincode: addr.postcode || prev.pincode || "",
            flat: addr.house_number || prev.flat || "",
            area: [addr.road, addr.suburb, addr.neighbourhood].filter(Boolean).join(", ") || prev.area || "",
            landmark: addr.amenity || addr.landmark || prev.landmark || "",
            city: addr.city || addr.town || addr.village || addr.suburb || prev.city || "",
            state: addr.state || prev.state || "",
            country: addr.country || prev.country || "India",
            lat: lat,
            lng: lng
          }));
          toast.success("Address synchronized successfully!");
        }
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
      toast.error("Failed to fetch address details for coordinates.");
    } finally {
      setGeocodingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const pin = modalFormData.pincode;
    if (pin && pin.length === 6 && /^\d+$/.test(pin)) {
      const timer = setTimeout(async () => {
        setGeocodingLoading(true);
        try {
          const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice) {
              const postOffice = data[0].PostOffice[0];
              const district = postOffice.District;
              const state = postOffice.State;
              
              let latVal = 0;
              let lngVal = 0;
              try {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&postalcode=${pin}&country=India`);
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  if (geoData && geoData[0]) {
                    latVal = parseFloat(geoData[0].lat);
                    lngVal = parseFloat(geoData[0].lon);
                  }
                }
              } catch (gErr) {
                console.error("Geocoding pincode error:", gErr);
              }

              setModalFormData(prev => ({
                ...prev,
                city: district || prev.city,
                state: state || prev.state,
                country: "India",
                lat: latVal || prev.lat || 28.6139,
                lng: lngVal || prev.lng || 77.2090
              }));
              setModalErrors(prev => ({ ...prev, pincode: "", city: "", state: "" }));
              toast.success(`Location synced with Pincode: ${pin}`);
            } else {
              setModalErrors(prev => ({ ...prev, pincode: "Invalid pincode or not found in India Post database" }));
              toast.error("Invalid pincode. Please check your pincode.");
            }
          }
        } catch (err) {
          console.error("Pincode fetch error:", err);
        } finally {
          setGeocodingLoading(false);
        }
      }, 400);

      return () => clearTimeout(timer);
    } else if (pin && (pin.length !== 6 || !/^\d+$/.test(pin))) {
      setModalErrors(prev => ({ ...prev, pincode: "Pincode must be exactly 6 digits" }));
    } else {
      setModalErrors(prev => ({ ...prev, pincode: "" }));
    }
  }, [modalFormData.pincode]);

  useEffect(() => {
    if (!showAddressModal) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
      return;
    }

    const loadLeaflet = async () => {
      if (window.L) {
        setMapLoaded(true);
        return;
      }

      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!document.getElementById("leaflet-js")) {
        const script = document.createElement("script");
        script.id = "leaflet-js";
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.onload = () => {
          setMapLoaded(true);
        };
        document.body.appendChild(script);
      } else {
        setMapLoaded(true);
      }
    };

    loadLeaflet();
  }, [showAddressModal]);

  useEffect(() => {
    if (!mapLoaded || !showAddressModal || !document.getElementById("address-map")) return;

    const initialLat = modalFormData.lat || 28.6139;
    const initialLng = modalFormData.lng || 77.2090;

    const map = window.L.map("address-map").setView([initialLat, initialLng], 14);
    mapInstanceRef.current = map;

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Draggable marker with premium Tailwind orange theme
    const marker = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Radius circle highlighting the selected location area
    const circle = window.L.circle([initialLat, initialLng], {
      color: '#f97316',
      fillColor: '#f97316',
      fillOpacity: 0.12,
      radius: 300
    }).addTo(map);
    circleRef.current = circle;

    // Draggable marker event listener
    marker.on("dragend", () => {
      const position = marker.getLatLng();
      circle.setLatLng(position);
      updateAddressFromCoords(position.lat, position.lng);
    });

    // Map click event listener
    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
      updateAddressFromCoords(lat, lng);
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [mapLoaded, showAddressModal, updateAddressFromCoords]);

  // Sync state coordinates to Leaflet marker, circle, & map view (One-way: State -> Map)
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && modalFormData.lat && modalFormData.lng) {
      const currentPos = markerRef.current.getLatLng();
      const distance = Math.sqrt(
        Math.pow(currentPos.lat - modalFormData.lat, 2) +
        Math.pow(currentPos.lng - modalFormData.lng, 2)
      );
      // Only update position if difference is significant
      if (distance > 0.0001) {
        markerRef.current.setLatLng([modalFormData.lat, modalFormData.lng]);
        if (circleRef.current) {
          circleRef.current.setLatLng([modalFormData.lat, modalFormData.lng]);
        }
        mapInstanceRef.current.setView([modalFormData.lat, modalFormData.lng], 16);
      }
    }
  }, [modalFormData.lat, modalFormData.lng]);

  const handleMapSearch = async (e) => {
    e.preventDefault();
    if (!mapSearchQuery.trim()) return;
    setSearchingMapLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1`
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data[0]) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([lat, lon], 16);
          }
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lon]);
          }
          if (circleRef.current) {
            circleRef.current.setLatLng([lat, lon]);
          }

          await updateAddressFromCoords(lat, lon);
          toast.success("Location found on map!");
        } else {
          toast.warning("Location not found on map.");
        }
      }
    } catch (err) {
      console.error("Map search error:", err);
      toast.error("Error searching location.");
    } finally {
      setSearchingMapLocation(false);
    }
  };

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
      lat: addr.lat || 0,
      lng: addr.lng || 0,
    });
  };

  const handleOpenAddModal = () => {
    setEditingAddress(null);
    setModalErrors({});
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
    setModalErrors({});
    
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

    const successCallback = async (position) => {
      const { latitude, longitude } = position.coords;

      // Update Leaflet map view and marker position if the map is initialized
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([latitude, longitude], 16);
      }
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
      }

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
            lat: latitude,
            lng: longitude
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
    };

    const errorCallback = (err) => {
      console.warn("Primary geolocation failed:", err.message);
      if (err.code === 1) {
        toast.error("Location permission denied. Please verify macOS System Settings > Privacy & Security > Location Services is enabled for your browser.");
        setGeocodingLoading(false);
      } else if (err.code === 3) {
        // High accuracy timed out, retry with normal accuracy
        navigator.geolocation.getCurrentPosition(
          successCallback,
          (err2) => {
            console.warn("Secondary geolocation failed (normal accuracy):", err2.message);
            toast.error("Location Services are unavailable or disabled on your device. Please type your address manually.");
            setGeocodingLoading(false);
          },
          { enableHighAccuracy: false, timeout: 8500 }
        );
      } else if (err.code === 2) {
        // Position unavailable - Location services disabled globally or no network triangulation
        toast.error("Location Services are disabled or unavailable on your system. Please type your address manually.");
        setGeocodingLoading(false);
      } else {
        toast.error("Location services are unavailable. Please input your address manually.");
        setGeocodingLoading(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
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

    // Run validation checks on all fields
    const errors = {};
    ["fullName", "phone", "pincode", "area", "city", "state"].forEach(field => {
      const err = validateField(field, modalFormData[field]);
      if (err) {
        errors[field] = err;
      }
    });

    if (Object.keys(errors).length > 0) {
      setModalErrors(errors);
      toast.warning("Please correct the errors in the form before saving.");
      return;
    }

    setLoading(true);
    try {
      const pinCheck = await fetch(`https://api.postalpincode.in/pincode/${pincode.trim()}`);
      if (pinCheck.ok) {
        const data = await pinCheck.json();
        if (!data || !data[0] || data[0].Status !== "Success") {
          setModalErrors(prev => ({ ...prev, pincode: "Invalid Pincode. Please enter a valid Indian pincode." }));
          toast.error("Invalid Pincode. Please enter a valid Indian pincode.");
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log("Pincode check error:", err);
    }
    setLoading(false);

    // Split Full Name into First and Last Name
    const nameParts = fullName.trim().split(" ");
    const fName = nameParts[0] || "";
    const lName = nameParts.slice(1).join(" ") || "";

    // Join address parts for the street field
    const streetParts = [flat, area].filter(Boolean);
    if (landmark) streetParts.push(`Landmark: ${landmark}`);
    if (pincode) streetParts.push(`Pincode: ${pincode}`);
    const streetAddress = streetParts.join(", ");

    let cleanedPhone = (phone || "").trim().replace(/\D/g, "");
    if (cleanedPhone.length === 11 && cleanedPhone.startsWith("0")) {
      cleanedPhone = cleanedPhone.slice(1);
    } else if (cleanedPhone.length === 12 && cleanedPhone.startsWith("91")) {
      cleanedPhone = cleanedPhone.slice(2);
    }

    const payload = {
      firstName: fName,
      lastName: lName,
      email: email,
      phone: cleanedPhone || phone,
      street: streetAddress,
      city: city,
      state: state,
      country: country,
      lat: modalFormData.lat || 0,
      lng: modalFormData.lng || 0
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
            lat: newAddr.lat || 0,
            lng: newAddr.lng || 0,
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

  const [products, setProducts] = useState([]);
  const [fetchingCart, setFetchingCart] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const singleProduct = location.state?.product;
      const cartItems = location.state?.cartItems;
      const qty = location.state?.qty || 1;
      const size = location.state?.size || "N/A";

      if (cartItems) {
        setProducts(cartItems);
      } else if (singleProduct) {
        setProducts([{
          ...singleProduct,
          price: location.state?.total / qty || singleProduct.price,
          qty,
          size,
          selectedAttributes: location.state?.selectedAttributes
        }]);
      } else {
        // Fetch from cart backend / localStorage
        const token = localStorage.getItem("token");
        setFetchingCart(true);
        try {
          let cartData = {};
          if (token) {
            const cartRes = await axios.post(
              `${backendUrl}/api/cart/get`,
              {},
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (cartRes.data.success) {
              cartData = cartRes.data.cartData || {};
            }
          } else {
            cartData = JSON.parse(localStorage.getItem("cart") || "{}");
          }

          const items = [];
          
          const uniqueIds = [];
          for (const key in cartData) {
            if (cartData[key] > 0) {
              const firstUnderscoreIdx = key.indexOf("_");
              const itemId = firstUnderscoreIdx !== -1 ? key.substring(0, firstUnderscoreIdx) : key;
              if (!uniqueIds.includes(itemId)) {
                uniqueIds.push(itemId);
              }
            }
          }

          let bulkProductsMap = {};
          if (uniqueIds.length > 0) {
            try {
              const bulkRes = await axios.post(`${backendUrl}/api/product/bulk`, { ids: uniqueIds });
              if (bulkRes.data.success && bulkRes.data.products) {
                bulkRes.data.products.forEach(p => {
                  bulkProductsMap[p._id] = p;
                });
              }
            } catch (e) {
              console.error("Failed to load bulk products for place order:", e);
            }
          }

          for (const key in cartData) {
            const firstUnderscoreIdx = key.indexOf("_");
            const itemId = firstUnderscoreIdx !== -1 ? key.substring(0, firstUnderscoreIdx) : key;
            const sizeVal = firstUnderscoreIdx !== -1 ? key.substring(firstUnderscoreIdx + 1) : "";
            const qtyVal = cartData[key];

            if (qtyVal > 0) {
              const prod = bulkProductsMap[itemId];
              if (prod) {
                let itemPrice = prod.price;
                let itemStock = prod.stock;
                let itemSku = prod.sku;
                let selectedAttributes = undefined;

                if (prod.variants && prod.variants.length > 0 && sizeVal && sizeVal.includes(":")) {
                  selectedAttributes = {};
                  sizeVal.split(",").forEach(pair => {
                    const [k, v] = pair.split(":");
                    if (k && v) selectedAttributes[k] = v;
                  });

                  const match = prod.variants.find(variant => {
                    return Object.keys(selectedAttributes).every(k => variant.attributes?.[k] === selectedAttributes[k]);
                  });

                  if (match) {
                     itemPrice = match.price;
                     itemStock = match.stock;
                     itemSku = match.sku;
                  }
                }

                items.push({
                  ...prod,
                  price: itemPrice,
                  stock: itemStock,
                  sku: itemSku,
                  qty: qtyVal,
                  size: sizeVal || "N/A",
                  selectedAttributes
                });
              }
            }
          }
          setProducts(items);
        } catch (error) {
          console.log("Failed to fetch cart:", error);
        } finally {
          setFetchingCart(false);
        }
      }
    };

    loadProducts();
  }, [location.state]);

  const giftWrap = location.state?.giftWrap || false;
  const giftMessage = location.state?.giftMessage || "";

  const subtotal = products.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 40;
  const platformFee = products.length > 0 ? 20 : 0;
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, subtotal + shipping + platformFee + (giftWrap ? 50 : 0) - discount);

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
      selectedAttributes: item.selectedAttributes,
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
            address: { ...formData, giftWrap, giftMessage },
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
            address: { ...formData, giftWrap, giftMessage },
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
            address: { ...formData, giftWrap, giftMessage },
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

  if (fetchingCart) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-6 pb-20 flex items-center justify-center transition-colors duration-200">
        <div className="mx-auto max-w-md text-center">
          <Loader2 className="mx-auto h-12 w-12 text-orange-500 animate-spin mb-4" />
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Loading Checkout...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 px-6 pt-6 pb-20 flex items-center justify-center transition-colors duration-200">
        <div className="mx-auto max-w-md rounded-sm border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 backdrop-blur-md p-10 text-center shadow-sm">
          <ShoppingCart className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-4" />
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">No products in checkout</p>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Please add items to your cart first.</p>
          <button
            onClick={() => navigate("/product")}
            className="mt-6 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md shadow-orange-500/10 hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 px-4 sm:px-6 pt-6 pb-16 text-slate-700 dark:text-slate-200 transition-colors duration-200">
      <form onSubmit={onSubmitHandler} className="mx-auto max-w-7xl">
        
        {/* CHECKOUT HEADER AREA */}
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-102 active:scale-98 transition shadow-xs cursor-pointer"
            >
              <ArrowRight className="rotate-180 h-4 w-4 stroke-[2.5]" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Checkout</h1>
                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <ShieldCheck size={11} className="text-emerald-600 dark:text-emerald-400" />
                  100% Secure Checkout
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-400 mt-1 font-semibold">
                Complete your purchase by providing your delivery and payment details.
              </p>
            </div>
          </div>
          
          {/* STEPPER TRACKER */}
          <div className="flex items-center w-full md:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-md shadow-xs">
            {[
              { step: 1, title: "Address", desc: "Select delivery address" },
              { step: 2, title: "Payment", desc: "Choose payment method" },
              { step: 3, title: "Review", desc: "Review your order" }
            ].map((s, idx) => {
              const isCompleted = activeStep > s.step;
              const isActive = activeStep === s.step;
              const canNavigate = s.step === 1 || (s.step === 2 && selectedAddressId) || (s.step === 3 && selectedAddressId && method);

              return (
                <div key={s.step} className="flex items-center">
                  <button
                    type="button"
                    disabled={!canNavigate}
                    onClick={() => setActiveStep(s.step)}
                    className="flex items-center gap-2.5 px-3 py-1 focus:outline-none cursor-pointer disabled:cursor-not-allowed text-left animate-none"
                  >
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full font-black text-xs transition duration-200 shrink-0 ${
                      isActive 
                        ? "bg-orange-500 text-white shadow-sm shadow-orange-500/10" 
                        : isCompleted 
                        ? "bg-emerald-500 text-white" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400"
                    }`}>
                      {s.step}
                    </div>
                    <div className="hidden sm:block">
                      <p className={`text-[11px] font-black uppercase tracking-wider leading-none ${isActive ? "text-orange-500 dark:text-orange-400" : "text-slate-500 dark:text-slate-400"}`}>{s.title}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-400 mt-0.5 font-semibold leading-none">{s.desc}</p>
                    </div>
                  </button>
                  
                  {idx < 2 && (
                    <div className="h-[2px] w-8 sm:w-12 mx-1 rounded-full bg-slate-100 dark:bg-slate-800">
                      <div 
                        className="h-full bg-orange-500 transition-all duration-300 rounded-full"
                        style={{ width: activeStep > s.step ? "100%" : activeStep === s.step ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-sm border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-950/40 px-4 py-3 text-xs text-red-700 dark:text-red-300 text-left flex items-center gap-2 shadow-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            {error}
          </div>
        )}

        {/* TWO COLUMN GRID */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] items-start">
          
          {/* LEFT CONTENT CONTAINER */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 sm:p-6 shadow-xs text-left">
            
            {/* STEP 1: SELECT A DELIVERY ADDRESS */}
            {activeStep === 1 && (
              <div className="space-y-6">
                
                {/* Header Title */}
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-500">
                    <MapPin size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="bg-orange-500 text-white text-[11px] font-black h-5 w-5 rounded flex items-center justify-center">1</span>
                      Select a Delivery Address
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 font-medium">Choose where you want your order to be delivered</p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Addresses Deck */}
                <div className="space-y-4">
                  {savedAddresses.length > 0 ? (
                    <>
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">Saved Addresses ({savedAddresses.length})</p>
                      
                      <div className="space-y-3 max-h-[290px] overflow-y-auto pr-1 custom-scrollbar" data-lenis-prevent>
                        {savedAddresses.map((addr, idx) => {
                          const isSelected = selectedAddressId === addr._id;
                          return (
                            <div
                              key={addr._id}
                              onClick={() => handleSelectAddress(addr)}
                              className={`flex items-start gap-4 p-4.5 rounded-md border transition duration-200 cursor-pointer relative ${
                                isSelected 
                                  ? "border-orange-500 bg-orange-500/[0.03] dark:bg-orange-500/[0.08]" 
                                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                              }`}
                            >
                              
                              {/* Left Radio Selector & Icon */}
                              <div className="mt-1 flex items-center gap-3 shrink-0">
                                <div className="flex items-center justify-center">
                                  <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${isSelected ? "border-orange-500" : "border-slate-300 dark:border-slate-700"}`}>
                                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                                  </div>
                                </div>
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isSelected ? "bg-orange-500/10 text-orange-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400"}`}>
                                  {idx === 0 ? <Home size={16} /> : <Briefcase size={16} />}
                                </div>
                              </div>

                              {/* Address Details */}
                              <div className="flex-1 text-xs min-w-0 pr-6">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-slate-900 dark:text-white text-[13px]">{addr.firstName} {addr.lastName}</span>
                                  {idx === 0 && (
                                    <span className="bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <p className="text-slate-700 dark:text-slate-200 mt-2 font-medium leading-relaxed">
                                  {addr.street}
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">
                                  {addr.city}, {addr.state}, {addr.country}
                                </p>
                                <div className="mt-2 flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-bold">
                                  <Phone size={12} className="text-slate-400" />
                                  <span>{addr.phone}</span>
                                </div>
                              </div>

                              {/* Actions bottom right */}
                              <div className="absolute bottom-4 right-4 flex items-center gap-3 text-[10px]">
                                <button
                                  type="button"
                                  onClick={(e) => handleOpenEditModal(addr, e)}
                                  className="text-blue-500 hover:text-blue-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Edit size={11} />
                                  Edit
                                </button>
                                <span className="text-slate-200 dark:text-slate-700">|</span>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeleteAddress(addr._id, e)}
                                  className="text-red-500 hover:text-red-600 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                                >
                                  <Trash2 size={11} />
                                  Delete
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-sm bg-slate-50/50 dark:bg-slate-800/30 flex flex-col items-center">
                      <MapPin className="h-8 w-8 text-slate-400 dark:text-slate-600 mb-2.5" />
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-extrabold">No saved delivery addresses found.</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Please add a delivery location to continue.</p>
                    </div>
                  )}

                  {/* Add & Auto-detect grids */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/40 rounded-md text-center group cursor-pointer transition"
                    >
                      <span className="text-xs font-black text-blue-500 flex items-center gap-1 hover:underline">
                        <Plus size={14} className="stroke-[2.5]" /> Add New Address
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-400 mt-1 font-semibold">Add a new delivery address</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        handleOpenAddModal();
                        setTimeout(() => {
                          handleAutofillLocation();
                        }, 250);
                      }}
                      className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/30 dark:bg-slate-800/40 rounded-md text-center group cursor-pointer transition"
                    >
                      <span className="text-xs font-black text-blue-500 flex items-center gap-1 hover:underline">
                        <Navigation size={13} className="animate-pulse" /> Use Current Location
                      </span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-400 mt-1 font-semibold">Detect your location automatically</span>
                    </button>
                  </div>
                </div>

                {/* Primary Proceed CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <button
                    type="button"
                    onClick={handleDeliverToAddress}
                    disabled={!selectedAddressId}
                    className="w-full rounded-md bg-[#ff6a00] hover:bg-[#e65c00] py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-md hover:shadow-lg active:scale-99 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} className="stroke-[2.5]" />
                    <span>Deliver to This Address</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 font-semibold">
                    <Lock size={11} className="text-slate-400" />
                    Your address is safe and secure with us
                  </p>
                </div>

              </div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {activeStep === 2 && (
              <div className="space-y-6">
                
                {/* Header Title */}
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-500">
                    <CreditCard size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="bg-orange-500 text-white text-[11px] font-black h-5 w-5 rounded flex items-center justify-center">2</span>
                      Select a Payment Method
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 font-medium">Choose how you want to pay for your order</p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Payment grids */}
                <div className="space-y-3">
                  {[
                    { id: "stripe", title: "Stripe Secure Cards", desc: "Pay with Visa, Mastercard, Diner, or AMEX", tag: "Safe & Fast", icon: CreditCard, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { id: "razorpay", title: "Razorpay Gateway", desc: "Pay with UPI, NetBanking, GooglePay, Wallets", tag: "Instant Validation", icon: Zap, color: "text-sky-500", bg: "bg-sky-500/10" },
                    { id: "cod", title: "Cash on Delivery (COD)", desc: "Pay cash at your doorstep during delivery", tag: "Flexible", icon: Banknote, color: "text-emerald-500", bg: "bg-emerald-500/10" }
                  ].map((m) => {
                    const isSelected = method === m.id;
                    const Icon = m.icon;
                    return (
                      <div
                        key={m.id}
                        onClick={() => setMethod(m.id)}
                        className={`flex items-start gap-4.5 p-4 rounded-md border transition duration-200 cursor-pointer ${
                          isSelected 
                            ? "border-orange-500 bg-orange-500/[0.03] dark:bg-orange-500/[0.08]" 
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="mt-1 flex items-center gap-3 shrink-0">
                          <div className="flex items-center justify-center">
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${isSelected ? "border-orange-500" : "border-slate-300 dark:border-slate-700"}`}>
                              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />}
                            </div>
                          </div>
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isSelected ? "bg-orange-500/10 text-orange-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400"}`}>
                            <Icon size={16} className={m.color} />
                          </div>
                        </div>

                        <div className="flex-1 text-xs min-w-0 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 dark:text-white text-[13px]">{m.title}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 px-2 py-0.5 rounded">
                              {m.tag}
                            </span>
                          </div>
                          <p className="text-slate-400 dark:text-slate-400 mt-1 font-medium leading-relaxed">{m.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Proceed payment button */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <button
                    type="button"
                    onClick={handleUsePaymentMethod}
                    disabled={!method}
                    className="w-full rounded-md bg-[#ff6a00] hover:bg-[#e65c00] py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-md hover:shadow-lg active:scale-99 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Use This Payment Method</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 text-center flex items-center justify-center gap-1.5 font-semibold">
                    <Lock size={11} className="text-slate-400" />
                    All payments are processed securely & encrypted
                  </p>
                </div>

              </div>
            )}

            {/* STEP 3: ORDER REVIEW */}
            {activeStep === 3 && (
              <div className="space-y-6">
                
                {/* Header Title */}
                <div className="flex items-start gap-3.5">
                  <div className="h-9 w-9 rounded-md bg-orange-500/10 flex items-center justify-center shrink-0 text-orange-500">
                    <PackageCheck size={18} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="bg-orange-500 text-white text-[11px] font-black h-5 w-5 rounded flex items-center justify-center">3</span>
                      Review Items and Delivery
                    </h2>
                    <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5 font-medium">Please review items and press order confirmation to proceed</p>
                  </div>
                </div>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Items Stack */}
                <div className="space-y-3">
                  {products.map((item, i) => (
                    <div
                      key={`${item._id}-${item.size}-${i}`}
                      className="flex gap-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 text-left hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <ProductImage item={item} />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-extrabold text-slate-900 dark:text-white text-[13px] truncate">{item.name}</p>
                        
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                            Qty: {item.qty}
                          </span>
                          {item.size && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                              {item.size.includes(":") ? (
                                item.size.split(",").map(pair => {
                                  const [k, v] = pair.split(":");
                                  return `${k}: ${v}`;
                                }).join(" • ")
                              ) : (
                                `Size: ${item.size}`
                              )}
                            </span>
                          )}
                        </div>
                        
                        <p className="mt-2 font-extrabold text-slate-900 dark:text-white text-[14px]">
                          ₹{item.price * item.qty}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Place order CTA */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-start gap-2.5 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>By placing your order, you agree to CartNOW's terms of use, privacy policies, and return conditions. An invoice will be dispatched upon order authorization.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-md bg-[#ff6a00] hover:bg-[#e65c00] py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-md hover:shadow-lg active:scale-99 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Processing order...</span>
                      </>
                    ) : (
                      <>
                        <span>Place Your Order</span>
                        <ArrowRight size={14} className="stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR (STICKY SUMMARY CARD) */}
          <div className="space-y-4">
            
            {/* Sidebar Card */}
            <aside className="h-fit rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs text-left">
              
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingCart size={13} className="text-orange-500" />
                  Order Summary
                </h3>
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-black text-[9px] uppercase tracking-wider shrink-0">
                  {products.reduce((sum, item) => sum + item.qty, 0)} Items
                </span>
              </div>

              {/* Items Summary list */}
              <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1 custom-scrollbar" data-lenis-prevent>
                {products.map((item, i) => (
                  <div key={`${item._id}-${item.size}-${i}`} className="flex gap-2.5 items-start text-xs border-b border-slate-100 dark:border-slate-800 pb-2.5 last:border-b-0 last:pb-0">
                    <div className="h-12 w-12 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0">
                      <ProductImage item={item} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 font-medium truncate">
                        {item.size && item.size.includes(":") ? (
                          item.size.split(",").map(pair => {
                            const [k, v] = pair.split(":");
                            return `${k}: ${v}`;
                          }).join(" • ")
                        ) : (
                          `Size: ${item.size}`
                        )}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 font-semibold">Qty: {item.qty}</p>
                    </div>
                    <div className="font-extrabold text-slate-900 dark:text-white shrink-0 text-right">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-slate-100 dark:border-slate-800 my-4" />

              {/* Price Details table */}
              <div className="text-left space-y-2.5 text-xs">
                
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Items Total ({products.reduce((sum, item) => sum + item.qty, 0)}):</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                    <span>Discount:</span>
                    <span>- ₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}

                {giftWrap && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                    <span>Gift Wrapping:</span>
                    <span className="font-bold text-slate-900 dark:text-white">₹50</span>
                  </div>
                )}
                
                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium">
                  <span>Delivery:</span>
                  {shipping === 0 ? (
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase text-[10px]">FREE</span>
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white">₹{shipping}</span>
                  )}
                </div>

                <div className="flex justify-between text-slate-600 dark:text-slate-300 font-medium items-center">
                  <span className="flex items-center gap-1">
                    Platform Fee
                    <span className="text-[10px] cursor-help text-slate-400">ⓘ</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{platformFee}</span>
                </div>
                
                <hr className="border-slate-100 dark:border-slate-800 my-3" />

                <div className="flex justify-between items-baseline pt-1">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white">Total Amount</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 block font-semibold leading-none mt-0.5">(Inclusive of all taxes)</span>
                  </div>
                  <span className="text-xl font-extrabold text-[#f95738] dark:text-[#f95738] tracking-tight">₹{finalTotal.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800 my-4.5" />

              {/* Promo input field */}
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter promo code"
                    className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 pl-8 text-xs font-bold uppercase tracking-wider outline-none text-slate-900 dark:text-white focus:border-orange-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <div className="absolute left-2.5 top-[12px] text-slate-400">
                    <span className="text-xs">🎫</span>
                  </div>
                </div>
                
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-[10px] uppercase tracking-wider px-3 rounded-md active:scale-95 transition cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-500 font-extrabold border border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider px-4 rounded-md active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                )}
              </div>
              
              {couponError && (
                <p className="mt-1.5 text-[9px] font-bold text-rose-500 pl-1">
                  {couponError}
                </p>
              )}

              {/* Secure banner */}
              <div className="mt-5 flex items-start gap-3 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.12] border border-emerald-500/20 rounded-md p-4 text-xs text-left leading-relaxed">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white">Secure Checkout</span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 font-semibold">SSL Encrypted • 256-bit Security</p>
                </div>
              </div>

            </aside>

          </div>
        </div>

        {/* BOTTOM LEFT FEATURE ICONS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 border-t border-slate-200 dark:border-slate-850 pt-8 text-left select-none max-w-2xl">
          {[
            { title: "SSL Secured", desc: "Your data is protected", icon: ShieldCheck },
            { title: "7-Day Returns", desc: "Easy returns & refunds", icon: RotateCcw },
            { title: "Free Delivery", desc: "On all orders above ₹499", icon: Truck },
            { title: "24/7 Support", desc: "We're here to help", icon: Headphones }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="h-7 w-7 rounded-sm bg-blue-500/5 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 border border-blue-500/10">
                  <Icon size={14} className="stroke-[2.5]" />
                </div>
                <div className="text-[10px]">
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-wider">{item.title}</p>
                  <p className="text-slate-405 mt-0.5 font-semibold">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

      </form>

      {/* ADD / EDIT ADDRESS MODAL */}
      {showAddressModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                {editingAddress ? "Modify Delivery Location" : "Add Delivery Location"}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-805 text-slate-505 dark:text-slate-400 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModalAddress} className="flex-1 overflow-y-auto p-5 space-y-4 text-left custom-scrollbar" data-lenis-prevent>
              
              {/* Map Selection Container */}
              <div className="space-y-3.5 border border-slate-100 dark:border-slate-805 rounded-sm p-4 bg-slate-50/30 dark:bg-slate-950/10 shadow-xs relative">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-550 tracking-wider">
                    Interactive Location Finder
                  </span>
                  <span className="text-[9px] text-emerald-505 font-extrabold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" /> Live Map Sync
                  </span>
                </div>

                {/* Location Search Bar & Quick Pincode Finder */}
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-[1fr_100px]">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search landmark, street, sector..."
                      value={mapSearchQuery}
                      onChange={(e) => setMapSearchQuery(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleMapSearch(e); } }}
                      className="w-full rounded-md border border-slate-200 dark:border-slate-855 bg-white dark:bg-slate-955 pl-3 pr-8 py-2 text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-455 focus:border-orange-505 focus:ring-1 focus:ring-orange-505/35 transition"
                    />
                    <button
                      type="button"
                      onClick={handleMapSearch}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition"
                    >
                      <Search size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleMapSearch}
                    disabled={searchingMapLocation || !mapSearchQuery.trim()}
                    className="w-full rounded-md bg-slate-900 hover:bg-slate-855 dark:bg-slate-800 dark:hover:bg-slate-750 py-2 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                  >
                    {searchingMapLocation ? "Searching..." : "Locate"}
                  </button>
                </div>

                {/* Map Wrapper */}
                <div className="relative rounded-sm border border-slate-200 dark:border-slate-800 overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-955">
                  <div 
                    id="address-map" 
                    className="w-full h-[240px] relative z-10"
                    style={{ minHeight: "240px" }}
                  />

                  {/* Floating Current Location Button on Map */}
                  <button
                    type="button"
                    onClick={handleAutofillLocation}
                    disabled={geocodingLoading}
                    className="absolute bottom-4 right-4 z-20 h-10 w-10 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center transition active:scale-95 cursor-pointer disabled:opacity-60"
                    title="Pin my current location"
                  >
                    {geocodingLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                    ) : (
                      <Navigation className="h-5 w-5 text-orange-500 fill-orange-500/10" />
                    )}
                  </button>
                  
                  {/* Coordinates Badge */}
                  {modalFormData.lat && modalFormData.lng ? (
                    <div className="absolute bottom-4 left-4 z-20 rounded-sm bg-slate-950/80 backdrop-blur-xs px-2 py-1 text-[9px] font-mono text-slate-300 font-bold border border-white/5">
                      {modalFormData.lat.toFixed(5)}, {modalFormData.lng.toFixed(5)}
                    </div>
                  ) : null}
                </div>

                {/* Live Address Preview Card */}
                <div className="rounded-md border border-orange-500/15 bg-orange-500/5 p-3 text-xs text-left">
                  <span className="text-[9px] font-black uppercase text-orange-500 tracking-wider block mb-1">
                    Selected Location Address
                  </span>
                  <div className="text-slate-655 dark:text-slate-355 leading-relaxed font-semibold">
                    {modalFormData.area || modalFormData.city || modalFormData.state ? (
                      <>
                        <p className="font-extrabold text-slate-900 dark:text-white">
                          {[modalFormData.flat, modalFormData.area].filter(Boolean).join(", ") || "No street selected"}
                        </p>
                        <p className="text-slate-405 dark:text-slate-500 mt-0.5">
                          {[modalFormData.city, modalFormData.state, modalFormData.country].filter(Boolean).join(", ")}
                          {modalFormData.pincode ? ` - ${modalFormData.pincode}` : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-slate-400 italic">Drag map marker or search above to sync address details</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Input fields */}
              <div>
                <label className={labelClass}>Country/Region</label>
                <select
                  value={modalFormData.country}
                  onChange={(e) => setModalFormData({ ...modalFormData, country: e.target.value })}
                  className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 px-3 py-2.5 text-xs text-slate-900 dark:text-white outline-none focus:border-orange-500 transition"
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Full Name (First and Last name) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sachin Kumar"
                  value={modalFormData.fullName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModalFormData({ ...modalFormData, fullName: val });
                    setModalErrors(prev => ({ ...prev, fullName: validateField("fullName", val) }));
                  }}
                  className={`${inputClass} ${modalErrors.fullName ? "border-rose-500 focus:ring-rose-500/10" : ""}`}
                />
                {modalErrors.fullName && (
                  <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">{modalErrors.fullName}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit phone number"
                    value={modalFormData.phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      let cleaned = val.replace(/\D/g, "");
                      if (cleaned.length === 11 && cleaned.startsWith("0")) {
                        val = cleaned.slice(1);
                      } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
                        val = cleaned.slice(2);
                      }
                      setModalFormData({ ...modalFormData, phone: val });
                      setModalErrors(prev => ({ ...prev, phone: validateField("phone", val) }));
                    }}
                    className={`${inputClass} ${modalErrors.phone ? "border-rose-500 focus:ring-rose-505/10" : ""}`}
                  />
                  {modalErrors.phone ? (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">{modalErrors.phone}</p>
                  ) : (
                    <span className="text-[9px] text-slate-400 mt-0.5 block pl-1">May be used to assist delivery couriers</span>
                  )}
                </div>
                
                <div>
                  <label className={labelClass}>Pincode / Postal Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="6-digit PIN code"
                    value={modalFormData.pincode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModalFormData({ ...modalFormData, pincode: val });
                      setModalErrors(prev => ({ ...prev, pincode: validateField("pincode", val) }));
                    }}
                    className={`${inputClass} ${modalErrors.pincode ? "border-rose-500 focus:ring-rose-500/10" : ""}`}
                  />
                  {modalErrors.pincode && (
                    <p className="text-[10px] text-rose-555 font-bold mt-1 pl-1">{modalErrors.pincode}</p>
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>Flat, House no., Building, Company, Apartment</label>
                <input
                  type="text"
                  placeholder="Flat No. / House Name / Suite"
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
                  placeholder="e.g. Sector 15, Park Road"
                  value={modalFormData.area}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModalFormData({ ...modalFormData, area: val });
                    setModalErrors(prev => ({ ...prev, area: validateField("area", val) }));
                  }}
                  className={`${inputClass} ${modalErrors.area ? "border-rose-500 focus:ring-rose-505/10" : ""}`}
                />
                {modalErrors.area && (
                  <p className="text-[10px] text-rose-505 font-bold mt-1 pl-1">{modalErrors.area}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Opp. City Mall / Metro station"
                  value={modalFormData.landmark}
                  onChange={(e) => setModalFormData({ ...modalFormData, landmark: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Town / City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={modalFormData.city}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModalFormData({ ...modalFormData, city: val });
                      setModalErrors(prev => ({ ...prev, city: validateField("city", val) }));
                    }}
                    className={`${inputClass} ${modalErrors.city ? "border-rose-500 focus:ring-rose-505/10" : ""}`}
                  />
                  {modalErrors.city && (
                    <p className="text-[10px] text-rose-500 font-bold mt-1 pl-1">{modalErrors.city}</p>
                  )}
                </div>
                
                <div>
                  <label className={labelClass}>State *</label>
                  <input
                    type="text"
                    required
                    placeholder="State"
                    value={modalFormData.state}
                    onChange={(e) => {
                      const val = e.target.value;
                      setModalFormData({ ...modalFormData, state: val });
                      setModalErrors(prev => ({ ...prev, state: validateField("state", val) }));
                    }}
                    className={`${inputClass} ${modalErrors.state ? "border-rose-500 focus:ring-rose-500/10" : ""}`}
                  />
                  {modalErrors.state && (
                    <p className="text-[10px] text-rose-550 font-bold mt-1 pl-1">{modalErrors.state}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="rounded-md border border-slate-205 dark:border-slate-805 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 px-6 py-2.5 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-orange-500/10 active:scale-95 transition cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Delivery Address"}
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
