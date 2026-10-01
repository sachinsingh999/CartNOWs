import React, { useEffect, useRef, useState } from "react";
import { 
  User, ShieldAlert, MapPin, Mail, Phone, Truck, ShieldCheck, 
  Crosshair, Lock, Star
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { backendUrl } from "../config";

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

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [audioAlerts, setAudioAlerts] = useState(() => {
    return localStorage.getItem("driver_audio_alerts") !== "false";
  });
  const [autoAccept, setAutoAccept] = useState(() => {
    return localStorage.getItem("driver_auto_accept") === "true";
  });

  useEffect(() => {
    localStorage.setItem("driver_audio_alerts", audioAlerts);
  }, [audioAlerts]);

  useEffect(() => {
    localStorage.setItem("driver_auto_accept", autoAccept);
  }, [autoAccept]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      toast.error("Please fill in both current and new password");
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
        toast.success("GPS synchronized!");
        
        if (mapRef.current) mapRef.current.setView([lat, lng], 13);
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        if (circleRef.current) circleRef.current.setLatLng([lat, lng]);
      },
      (error) => {
        console.error("GPS error:", error);
        setGpsStatus("error");
        toast.error(`GPS Error: ${error.message || "Access denied"}`);
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
        fillOpacity: 0.12
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
    <div className="space-y-3.5 text-slate-800 dark:text-slate-200">
      
      {/* Top Header Card */}
      <div className="glass-panel-elevated rounded-md p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border border-slate-200 dark:border-slate-800 border-t-2 border-t-blue-500">
        <div className="space-y-0.5">
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-mono">
            Courier Profile & Sector Range
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">
            Manage your credentials, adjust your delivery radius, and sync GPS location.
          </p>
        </div>

        <div className="glass-card px-2.5 py-1 rounded-sm text-left shrink-0 border border-slate-200 dark:border-slate-800">
          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block">Status</span>
          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            Active Verified Partner
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-3.5 items-start">
        
        {/* Left: Driver Card & Security */}
        <div className="space-y-3.5">
          <div className="glass-panel-elevated rounded-md p-4 shadow-sm space-y-3.5 border border-slate-200 dark:border-slate-800 border-t-2 border-t-blue-500">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="h-10 w-10 rounded-sm bg-slate-900 dark:bg-slate-800 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-sm shrink-0">
                {driver?.name ? driver.name.split(" ").map(n=>n[0]).join("").toUpperCase() : <User size={18} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate font-mono">{driver?.name}</h3>
                  <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono font-bold text-amber-500 flex items-center gap-0.5 bg-amber-500/10 px-1.5 py-0.5 rounded-sm border border-amber-500/20">
                    <Star size={9} className="fill-amber-400 text-amber-400" />
                    <span>{driver?.rating ? Number(driver.rating).toFixed(2) : "5.00"}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 truncate">{driver?.deliveryZone || "Designated Sector"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between p-2.5 glass-card rounded-sm border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-mono font-bold uppercase text-[8px] tracking-wider">Agent Email</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[170px] text-[11px]">{driver?.email || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 glass-card rounded-sm border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-mono font-bold uppercase text-[8px] tracking-wider">Phone</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">{driver?.phone || "—"}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 glass-card rounded-sm border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 font-mono font-bold uppercase text-[8px] tracking-wider">Vehicle Class</span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 capitalize text-[11px]">{driver?.vehicleType || "Standard Courier"}</span>
              </div>
            </div>

            {/* App Preferences Toggles */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2">
              <span className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-widest block">Dispatch Preferences</span>
              <div className="flex items-center justify-between p-2 glass-card rounded-sm border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Audio Broadcast Alerts</p>
                  <p className="text-[9px] text-slate-400">Play chime on new job assignment</p>
                </div>
                <input
                  type="checkbox"
                  checked={audioAlerts}
                  onChange={(e) => {
                    setAudioAlerts(e.target.checked);
                    toast.info(`Audio alerts ${e.target.checked ? "enabled" : "muted"}`);
                  }}
                  className="h-3.5 w-3.5 accent-blue-600 rounded-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 glass-card rounded-sm border border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Auto-Accept Direct Tasks</p>
                  <p className="text-[9px] text-slate-400">Instantly accept assigned orders</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoAccept}
                  onChange={(e) => {
                    setAutoAccept(e.target.checked);
                    toast.info(`Auto-accept ${e.target.checked ? "enabled" : "disabled"}`);
                  }}
                  className="h-3.5 w-3.5 accent-blue-600 rounded-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="glass-panel-elevated rounded-md p-4 shadow-sm space-y-3 border border-slate-200 dark:border-slate-800">
            <div className="pb-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5">
              <Lock size={13} className="text-blue-500" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white font-mono">Security & Password</h4>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-2.5">
              <div>
                <label className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-widest block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[8px] font-mono font-bold uppercase text-slate-400 tracking-widest block mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-2 rounded-sm border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition active:scale-98 cursor-pointer disabled:opacity-50 shadow-xs border border-blue-400/30"
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </form>
          </div>

          {/* Resign Account */}
          <div className="glass-panel rounded-md p-4 shadow-sm space-y-2 border border-rose-500/20 bg-rose-500/5">
            <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <ShieldAlert size={13} />
              <span>Deactivate Courier Contract</span>
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Resign partner status and permanently terminate active courier access.
            </p>
            <button
              onClick={() => setShowResignModal(true)}
              className="w-full bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer active:scale-98"
            >
              Resign Contract
            </button>
          </div>
        </div>

        {/* Right: Map & Radius Slider */}
        <div className="glass-panel-elevated rounded-md p-4 shadow-sm space-y-3.5 border border-slate-200 dark:border-slate-800 border-t-2 border-t-blue-500">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800/80">
            <div>
              <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 uppercase font-mono">
                <MapPin size={14} className="text-blue-500" />
                <span>Dispatch Sector & Operational Radius</span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">Drag map pin or sync live GPS to set coverage boundary</p>
            </div>

            <button
              onClick={handleLocateMe}
              disabled={gpsStatus === "fetching"}
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider transition cursor-pointer shadow-xs active:scale-98 border border-blue-400/30"
            >
              <Crosshair size={11} className={gpsStatus === "fetching" ? "animate-spin" : ""} />
              <span>{gpsStatus === "fetching" ? "Locating..." : "Sync GPS"}</span>
            </button>
          </div>

          {/* Leaflet Map */}
          <div id="delivery-leaflet-map" className="h-[340px] w-full rounded-sm border border-slate-200 dark:border-slate-800 shadow-inner z-10 overflow-hidden" />

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 items-end pt-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono font-bold text-[8px] uppercase tracking-widest text-slate-400">
                  Coverage Radius
                </span>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm border border-blue-500/20 text-xs">
                  {deliveryRadius} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={deliveryRadius}
                onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-none appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-1.5 text-xs glass-card p-2 rounded-sm border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[8px] font-mono font-bold uppercase text-slate-400 block">Lat</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[10px]">{deliveryLat}</span>
                </div>
                <div>
                  <span className="text-[8px] font-mono font-bold uppercase text-slate-400 block">Lng</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[10px]">{deliveryLng}</span>
                </div>
              </div>

              <button
                onClick={handleSaveMapArea}
                disabled={mapSaving}
                className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 py-2 rounded-sm text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer disabled:opacity-50 active:scale-98 shadow-xs"
              >
                {mapSaving ? "Saving..." : "Save Coverage Range"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileSettingsTab;
