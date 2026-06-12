import React, { useEffect, useRef } from "react";
import { User, ShieldAlert, MapPin, Settings, Mail, Phone, Truck, ShieldCheck, HelpCircle } from "lucide-react";

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
  mapSaving
}) => {
  const circleRef = useRef(null);
  const markerRef = useRef(null);
  const mapRef = useRef(null);

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
      
      {/* Left Column: Driver Agent Profile Summary */}
      <div className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden group transition-all duration-300">
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
              <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111827] shadow" title="Active Account" />
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
              <span className="font-black text-slate-905 dark:text-slate-200 capitalize">{driver?.vehicleType || "Bike"}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <Mail size={13} className="text-slate-400" />
                <span>Email Address</span>
              </span>
              <span className="font-black text-slate-905 dark:text-slate-200 truncate pl-4 max-w-[200px]">{driver?.email}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/60 text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2">
                <Phone size={13} className="text-slate-400" />
                <span>Phone Contact</span>
              </span>
              <span className="font-black text-slate-905 dark:text-slate-200">{driver?.phone}</span>
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

        {/* Deactivation Card */}
        <div className="bg-rose-500/5 dark:bg-[#1C1115]/30 border border-rose-500/10 dark:border-rose-950 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-start gap-3 text-rose-600 dark:text-rose-400">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-xs uppercase tracking-wider">Deactivate Hub Account</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">Resign your partnership contract. This action will permanently remove your login access and unassign pending jobs.</p>
            </div>
          </div>
          <button
            onClick={() => setShowResignModal(true)}
            className="w-full bg-rose-550 dark:bg-rose-500/10 hover:bg-rose-600 dark:hover:bg-rose-500/20 border border-rose-500/20 text-white dark:text-rose-400 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition duration-150 active:scale-98 cursor-pointer text-center"
          >
            Resign Partner Account
          </button>
        </div>
      </div>

      {/* Right Column: Interactive Sector Map Settings */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5 hover:shadow-md transition-all duration-300">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-550 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MapPin size={15} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Configure Dispatch Sector</h3>
              <p className="text-[10px] text-slate-500 mt-0.5">Click/drag marker to pin your center hub coordinates</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-555 cursor-help" title="Radius settings determine which orders appear in your Available Pool.">
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
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 block tracking-widest">Lat</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-200">{deliveryLat}</span>
              </div>
              <div>
                <span className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 block tracking-widest">Lng</span>
                <span className="font-mono font-black text-slate-800 dark:text-slate-200">{deliveryLng}</span>
              </div>
            </div>

            <button
              onClick={handleSaveMapArea}
              disabled={mapSaving}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-md shadow-blue-500/10 active:scale-98 cursor-pointer disabled:opacity-50"
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
