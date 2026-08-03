import React, { useEffect, useRef, useState } from "react";
import { User, ShieldAlert, MapPin, Settings, Mail, Phone, Truck, ShieldCheck, HelpCircle, Crosshair, Lock, Bell } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

/**
 * Enhanced ProfileSettingsTab component.
 * Preserves the interactive Leaflet dispatch sector map and adds security configurations
 * (Change Password, Forgot/Reset Password) and delivery preferences.
 */
const ProfileSettingsTab = ({
  driver,
  stats,
  setShowResignModal,
  deliveryLat,
  setDeliveryLat,
  deliveryLng,
  setDeliveryLng,
  deliveryRadius,
  setDeliveryRadius,
  handleSaveMapArea,
  mapSaving,
  token
}) => {
  const circleRef = useRef(null);
  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const [gpsStatus, setGpsStatus] = useState("idle");

  // Change Password state variables
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Forgot / Reset Password state variables
  const [showResetFlow, setShowResetFlow] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // Other delivery man options
  const [audioAlerts, setAudioAlerts] = useState(() => {
    return localStorage.getItem("driver_audio_alerts") !== "false";
  });
  const [autoAccept, setAutoAccept] = useState(() => {
    return localStorage.getItem("driver_auto_accept") === "true";
  });

  // Handle toggling audio settings
  useEffect(() => {
    localStorage.setItem("driver_audio_alerts", audioAlerts);
  }, [audioAlerts]);

  useEffect(() => {
    localStorage.setItem("driver_auto_accept", autoAccept);
  }, [autoAccept]);

  // Submit Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }
    setPasswordLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/deliveryman/change-password`,
        { oldPassword, newPassword },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Password updated successfully!");
        setOldPassword("");
        setNewPassword("");
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Network error");
    } finally {
      setPasswordLoading(false);
    }
  };

  // Submit Forgot Password request to generate token
  const handleForgotPasswordRequest = async () => {
    if (!driver?.email) {
      toast.error("Driver email not loaded");
      return;
    }
    setForgotLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/deliveryman/forgot-password`, {
        email: driver.email
      });
      if (response.data.success) {
        toast.info(`Reset code generated! Check popup / console.`);
        // For testing/local debug convenience, print and display the mock token
        alert(`MOCK EMAIL DELIVERY:\nYour password reset code is: ${response.data.resetToken}`);
        setResetTokenInput(response.data.resetToken); // Pre-fill for ease of use
        setShowResetFlow(true);
      } else {
        toast.error(response.data.message || "Failed to request reset token");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Network error");
    } finally {
      setForgotLoading(false);
    }
  };

  // Submit token and new password to complete reset
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetTokenInput || !resetNewPassword) {
      toast.error("Please enter the reset token and choose a new password");
      return;
    }
    setResetLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/deliveryman/reset-password`, {
        token: resetTokenInput,
        newPassword: resetNewPassword
      });
      if (response.data.success) {
        toast.success("Password reset successfully! You can now use your new credentials.");
        setShowResetFlow(false);
        setResetTokenInput("");
        setResetNewPassword("");
      } else {
        toast.error(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Network error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setGpsStatus("error");
      return;
    }
    setGpsStatus("fetching");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = parseFloat(position.coords.latitude.toFixed(6));
        const lng = parseFloat(position.coords.longitude.toFixed(6));
        setDeliveryLat(lat);
        setDeliveryLng(lng);
        setGpsStatus("success");
        toast.success("Synchronized coordinates with device GPS!");
        
        // Dynamic Leaflet map updates
        if (mapRef.current) {
          mapRef.current.setView([lat, lng], 13);
        }
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        }
        if (circleRef.current) {
          circleRef.current.setLatLng([lat, lng]);
        }
      },
      (error) => {
        console.error("GPS error:", error);
        setGpsStatus("error");
        toast.error(`GPS Sync Error: ${error.message || "Access denied"}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    let mapInstance = null;
    let circleInstance = null;
    let markerInstance = null;

    if (!document.querySelector("link[href*='leaflet.css']")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const mapDiv = document.getElementById("delivery-leaflet-map");
      if (!mapDiv) return;

      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          console.log(e);
        }
      }

      const initialLat = deliveryLat || 22.3072;
      const initialLng = deliveryLng || 73.1812;

      if (!window.L) return;

      mapInstance = window.L.map("delivery-leaflet-map").setView([initialLat, initialLng], 12);

      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      markerInstance = window.L.marker([initialLat, initialLng], { draggable: true }).addTo(mapInstance);
      
      circleInstance = window.L.circle([initialLat, initialLng], {
        radius: deliveryRadius * 1000,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
      markerRef.current = markerInstance;
      circleRef.current = circleInstance;

      markerInstance.on("dragend", (e) => {
        const position = markerInstance.getLatLng();
        setDeliveryLat(parseFloat(position.lat.toFixed(6)));
        setDeliveryLng(parseFloat(position.lng.toFixed(6)));
        circleInstance.setLatLng(position);
      });

      mapInstance.on("click", (e) => {
        const position = e.latlng;
        setDeliveryLat(parseFloat(position.lat.toFixed(6)));
        setDeliveryLng(parseFloat(position.lng.toFixed(6)));
        markerInstance.setLatLng(position);
        circleInstance.setLatLng(position);
      });
    };

    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
          mapRef.current = null;
        } catch (e) {
          console.log(e);
        }
      }
    };
  }, []);

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(deliveryRadius * 1000);
    }
  }, [deliveryRadius]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
      
      {/* Left Column: Driver Agent Profile Summary & Credentials */}
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xs relative overflow-hidden group transition-all duration-300">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="flex flex-col items-center text-center space-y-4 pt-3 pb-5 border-b border-slate-100 dark:border-slate-800/85">
            <div className="relative group cursor-pointer">
              {driver?.profilePhoto ? (
                <img
                  src={driver.profilePhoto}
                  alt={driver.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-blue-500/20 shadow-md group-hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-slate-50 dark:bg-slate-900 border-4 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner group-hover:scale-105 transition duration-300">
                  <User size={40} className="stroke-[1.5]" />
                </div>
              )}
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white/10 dark:border-slate-800 dark:border-gray-900 shadow" title="Active Account" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white tracking-tight">{driver?.name}</h4>
              <p className="text-[9px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-widest mt-1">Courier Hub Partner</p>
            </div>
          </div>
          
          {/* Informational list */}
          <div className="space-y-3 pt-5">
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <Truck size={13} className="text-slate-400" />
                <span>Vehicle Type</span>
              </span>
              <span className="font-black text-slate-900 dark:text-slate-200 capitalize">{driver?.vehicleType || "Bike"}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <Mail size={13} className="text-slate-400" />
                <span>Email Address</span>
              </span>
              <span className="font-black text-slate-900 dark:text-slate-200 truncate pl-4 max-w-[200px]">{driver?.email}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span>Phone Contact</span>
              </span>
              <span className="font-black text-slate-900 dark:text-slate-200">{driver?.phone}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <ShieldCheck size={13} className="text-slate-400" />
                <span>Contract Status</span>
              </span>
              <span className="font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 border border-emerald-500/20 rounded-lg capitalize">
                {stats?.status || driver?.status || "Active"}
              </span>
            </div>
          </div>
        </div>

        {/* Change / Reset Password Security Options */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5.5 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <Lock size={16} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">Security Settings</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-normal">Configure authentication preferences and change passwords.</p>
            </div>
          </div>

          {!showResetFlow ? (
            <form onSubmit={handleChangePassword} className="space-y-3.5 pt-1">
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-100 dark:text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={handleForgotPasswordRequest}
                  disabled={forgotLoading}
                  className="text-[9px] font-black text-blue-500 hover:underline uppercase tracking-wider cursor-pointer"
                >
                  {forgotLoading ? "Requesting..." : "Forgot Password? Get Reset Token"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 pt-1">
              <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-lg">
                <p className="text-[9px] text-blue-600 dark:text-blue-400 leading-normal font-bold">
                  Enter the recovery reset token code shown in your alert/toast notification below to choose a new password.
                </p>
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Reset Token</label>
                <input
                  type="text"
                  required
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                  placeholder="ENTER TOKEN"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">Choose New Password</label>
                <input
                  type="password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetFlow(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {resetLoading ? "Resetting..." : "Submit Reset"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Driver Preferences Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-start gap-3">
            <Settings size={16} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">Driver Options</h4>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-normal">Configure alert notifications and dispatch preferences.</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Audio Alerts */}
            <label className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 cursor-pointer select-none">
              <span className="text-[11px] text-slate-650 dark:text-slate-350 font-bold flex items-center gap-2">
                <Bell size={13} className="text-slate-400" />
                <span>Audio alerts on new job</span>
              </span>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={() => setAudioAlerts(!audioAlerts)}
                className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
              />
            </label>

            {/* Auto Accept short jobs */}
            <label className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 cursor-pointer select-none">
              <span className="text-[11px] text-slate-650 dark:text-slate-350 font-bold flex items-center gap-2">
                <ShieldCheck size={13} className="text-slate-400" />
                <span>Auto-accept short routes</span>
              </span>
              <input
                type="checkbox"
                checked={autoAccept}
                onChange={() => setAutoAccept(!autoAccept)}
                className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
              />
            </label>
          </div>
        </div>

        {/* Deactivation Card */}
        <div className="bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/10 dark:border-rose-950 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3 text-rose-600 dark:text-rose-400">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">Deactivate Hub Account</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">Resign your partnership contract. This action will permanently remove your login access and unassign pending jobs.</p>
            </div>
          </div>
          <button
            onClick={() => setShowResignModal(true)}
            className="w-full bg-rose-500 dark:bg-rose-500/10 hover:bg-rose-600 dark:hover:bg-rose-500/20 border border-rose-500/20 text-slate-100 dark:text-white dark:text-rose-400 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition duration-150 active:scale-98 cursor-pointer text-center"
          >
            Resign Partner Account
          </button>
        </div>
      </div>
 
      {/* Right Column: Interactive Sector Map Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xs space-y-5 hover:shadow-sm transition-all duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MapPin size={15} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Configure Dispatch Sector</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click/drag marker to pin your center hub coordinates</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-600 cursor-help" title="Radius settings determine which orders appear in your Available Pool.">
            <HelpCircle size={14} />
          </div>
        </div>
 
        {/* Map Container */}
        <div id="delivery-leaflet-map" className="h-[320px] w-full rounded-2xl border border-slate-200 dark:border-slate-800/80 relative z-10 shadow-inner" />
 
        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-6 items-end pt-2">
          {/* Left sub-column: Radius Slider */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-[9px] text-slate-500 uppercase tracking-widest">Delivery Range Limit</span>
              <span className="font-black text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20 shadow-sm">
                {deliveryRadius} km sector
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="range"
                min="1"
                max="50"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                className="w-full accent-blue-600 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
 
          {/* Right sub-column: Coordinate metrics & Save */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800/80">
              <div>
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-550 block tracking-widest">Lat</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-200">{deliveryLat}</span>
              </div>
              <div>
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-550 block tracking-widest">Lng</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-200">{deliveryLng}</span>
              </div>
            </div>
 
            <button
              onClick={handleLocateMe}
              disabled={gpsStatus === "fetching"}
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 py-2.5 text-xs font-bold transition duration-200 cursor-pointer border border-slate-200 dark:border-slate-700 disabled:opacity-60"
            >
              <Crosshair size={14} className={gpsStatus === "fetching" ? "animate-spin text-blue-500" : "text-slate-500"} />
              <span>{gpsStatus === "fetching" ? "Acquiring GPS..." : "Sync Device GPS"}</span>
            </button>
 
            <button
              onClick={handleSaveMapArea}
              disabled={mapSaving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-slate-100 dark:text-white py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {mapSaving ? "Saving..." : "Save Sector limits"}
            </button>
          </div>
        </div>
      </div>
 
    </div>
  );
};

export default ProfileSettingsTab;
