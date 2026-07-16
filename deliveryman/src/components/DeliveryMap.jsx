import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Crosshair, Search, Truck, MapPin, Loader2, Navigation } from "lucide-react";

import { useDriverLocation } from "../hooks/useDriverLocation";
import { useRouteDirections } from "../hooks/useRouteDirections";
import DriverMarker from "./DriverMarker";
import CustomerMarker from "./CustomerMarker";
import RoutePolyline from "./RoutePolyline";

/**
 * High-performance, space-optimized modular Delivery Partner Tracking Map component.
 * Integrates live GPS watching, OSRM driving steps parsing, and a mobile-app styled UI layout.
 */
export const DeliveryMap = ({ nextOrder, stats, driver, isNavigating, setIsNavigating, formatAddress }) => {
  const [mapInstance, setMapInstance] = useState(null);
  const [mapSearchQuery, setMapSearchQuery] = useState("");
  const [destLat, setDestLat] = useState(null);
  const [destLng, setDestLng] = useState(null);
  const [searchedPlaceName, setSearchedPlaceName] = useState("");
  const [leafletReady, setLeafletReady] = useState(!!window.L);

  const defaultDriverLat = driver?.deliveryLat || 22.3072;
  const defaultDriverLng = driver?.deliveryLng || 73.1812;

  // 1. Live Geolocation coordinate streaming
  const { coords: driverCoords, gpsStatus, error: gpsError } = useDriverLocation(
    defaultDriverLat,
    defaultDriverLng,
    stats?.isOnline || false
  );

  // Determine final target coordinates (custom searched location or geocoded address)
  const finalDestLat = useMemo(() => {
    if (destLat !== null) return destLat;
    return nextOrder?.address?.lat || (driverCoords.lat + 0.008);
  }, [destLat, nextOrder?.address?.lat, driverCoords.lat]);

  const finalDestLng = useMemo(() => {
    if (destLng !== null) return destLng;
    return nextOrder?.address?.lng || (driverCoords.lng + 0.012);
  }, [destLng, nextOrder?.address?.lng, driverCoords.lng]);

  // 2. Debounced real street route computation (including steps instructions)
  const { routeCoords, distance, duration, steps, loading, error: routeError } = useRouteDirections(
    driverCoords.lat,
    driverCoords.lng,
    finalDestLat,
    finalDestLng
  );

  // Interval checker to wait for window.L script availability
  useEffect(() => {
    if (window.L) {
      setLeafletReady(true);
      return;
    }
    const interval = setInterval(() => {
      if (window.L) {
        setLeafletReady(true);
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Initialize raw Leaflet container instance when library is ready
  useEffect(() => {
    if (mapInstance || !window.L) return;

    const map = window.L.map("live-delivery-leaflet-map", {
      zoomControl: false
    }).setView([driverCoords.lat, driverCoords.lng], 14);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    setMapInstance(map);

    setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      map.remove();
      setMapInstance(null);
    };
  }, [leafletReady]);

  // Fit view bounds to contain both markers when coordinates update (only when NOT actively navigating)
  useEffect(() => {
    if (!mapInstance || !window.L || isNavigating) return;
    try {
      const bounds = window.L.latLngBounds([
        [driverCoords.lat, driverCoords.lng],
        [finalDestLat, finalDestLng]
      ]);
      mapInstance.fitBounds(bounds, { padding: [50, 50] });
    } catch (e) {
      console.warn("fitBounds failed:", e);
    }
  }, [mapInstance, driverCoords.lat, driverCoords.lng, finalDestLat, finalDestLng, isNavigating]);

  // Keep map centered on driver location during active navigation
  useEffect(() => {
    if (isNavigating && mapInstance && driverCoords.lat) {
      mapInstance.setView([driverCoords.lat, driverCoords.lng], 16);
    }
  }, [isNavigating, mapInstance, driverCoords.lat, driverCoords.lng]);

  // Auto center on driver if coordinates update manually
  const centerOnDriver = useCallback(() => {
    if (mapInstance && driverCoords.lat) {
      mapInstance.panTo([driverCoords.lat, driverCoords.lng]);
      toast.info("Centered on driver location");
    }
  }, [mapInstance, driverCoords]);

  // Geocoding directions query searching
  const handleMapSearch = async () => {
    if (!mapSearchQuery.trim()) return;
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}&limit=1`
      );
      if (response.data && response.data.length > 0) {
        const { lat, lon, display_name } = response.data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        
        setDestLat(newLat);
        setDestLng(newLng);
        setSearchedPlaceName(display_name.split(",")[0]);
        toast.success(`Directions updated to: ${display_name.split(",")[0]}`);
      } else {
        toast.warning("No coordinates found for this location.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Location search failed.");
    }
  };

  const fallbackFormatAddress = (addr) => {
    if (!addr) return "";
    const parts = [
      addr.street,
      addr.landmark,
      addr.city,
      addr.state,
      addr.pincode,
      addr.country
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Reset variables and automatically geocode text address when nextOrder changes
  useEffect(() => {
    setSearchedPlaceName("");
    setMapSearchQuery("");
    setIsNavigating(false);

    if (!nextOrder || !nextOrder.address) {
      setDestLat(null);
      setDestLng(null);
      return;
    }

    const addrLat = nextOrder.address.lat;
    const addrLng = nextOrder.address.lng;
    
    // Use valid database coordinates if present
    if (addrLat && addrLng && Number(addrLat) !== 0 && Number(addrLng) !== 0) {
      setDestLat(parseFloat(addrLat));
      setDestLng(parseFloat(addrLng));
      return;
    }

    // Geocode textual address via Nominatim
    const textAddress = formatAddress ? formatAddress(nextOrder.address) : fallbackFormatAddress(nextOrder.address);
    if (!textAddress) {
      setDestLat(null);
      setDestLng(null);
      return;
    }

    const geocodeAddress = async () => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(textAddress)}&limit=1`
        );
        if (response.data && response.data.length > 0) {
          const { lat, lon } = response.data[0];
          setDestLat(parseFloat(lat));
          setDestLng(parseFloat(lon));
          console.log(`Geocoded textual address: ${textAddress} to coords ${lat}, ${lon}`);
        } else {
          // Fallback to pincode/city
          const fallbackQuery = nextOrder.address.pincode || nextOrder.address.city || "";
          if (fallbackQuery) {
            const fallbackResponse = await axios.get(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackQuery)}&limit=1`
            );
            if (fallbackResponse.data && fallbackResponse.data.length > 0) {
              const { lat, lon } = fallbackResponse.data[0];
              setDestLat(parseFloat(lat));
              setDestLng(parseFloat(lon));
            }
          }
        }
      } catch (err) {
        console.warn("Auto-geocoding failed:", err);
      }
    };

    geocodeAddress();
  }, [nextOrder, formatAddress]);

  return (
    <div className="lg:col-span-5 glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-4.5 shadow-xl flex flex-col justify-between relative overflow-hidden min-h-[380px]">
      
      {/* Leaflet container canvas */}
      <div className="w-full flex-1 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#0c0f1d] border border-slate-200 dark:border-slate-800/60 relative min-h-[320px]">
        {/* Leaflet map div stays unconditionally mounted in the DOM */}
        <div 
          id="live-delivery-leaflet-map" 
          className={`absolute inset-0 w-full h-full rounded-2xl z-10 transition-all duration-500 ${nextOrder && !isNavigating ? "blur-[6px] opacity-60 pointer-events-none" : "blur-none opacity-100"}`} 
        />

        {/* Placeholder overlay when map is blurred (not navigating but we have a job) */}
        {nextOrder && !isNavigating && (
          <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 flex flex-col items-center justify-center text-xs gap-3.5 z-20 transition-all duration-300">
            <div className="glass-panel border border-slate-205 dark:border-slate-800 rounded-2xl p-5 text-center shadow-lg max-w-[280px]">
              <MapPin className="mx-auto text-blue-500 animate-bounce mb-2" size={20} />
              <p className="font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Route Map Blurred</p>
              <p className="text-[10px] text-slate-455 dark:text-slate-500 font-bold mt-1.5 leading-normal">
                Click "Start Navigation" below or the "Navigate" button on the panel to reveal the live road layout.
              </p>
            </div>
          </div>
        )}

        {/* Placeholder overlay when no active job is selected */}
        {!nextOrder && (
          <div className="absolute inset-0 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-xs text-slate-405 gap-2 z-20">
            <MapPin size={24} className="text-slate-350 dark:text-slate-700" />
            <span className="font-extrabold tracking-wide uppercase">No active delivery map to track</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-550 font-bold">
              GPS: {gpsStatus === "tracking" ? `${driverCoords.lat.toFixed(4)}°, ${driverCoords.lng.toFixed(4)}°` : "Searching Signal..."}
            </span>
          </div>
        )}

        {/* Loading skeleton blur overlay */}
        {loading && (
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm z-[1015] flex flex-col items-center justify-center text-xs text-blue-400 font-bold gap-3 rounded-2xl">
            <Loader2 size={32} className="animate-spin text-blue-500" />
            <span className="tracking-wide animate-pulse">Calculating road route...</span>
          </div>
        )}

        {/* Top Panel: Turn-by-Turn Instruction Banner in Navigation Mode */}
        {isNavigating && steps.length > 0 && (
          <div className="absolute top-0 left-0 right-0 z-[1012] bg-emerald-600 dark:bg-emerald-950 text-white p-3.5 shadow-md flex items-center justify-between border-b border-emerald-500/20 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-white">
                <Navigation size={14} className="rotate-45 text-emerald-250" />
              </div>
              <div>
                <p className="text-[8px] font-black text-emerald-300 dark:text-emerald-400 uppercase tracking-widest leading-none">Next Turn Instruction</p>
                <h5 className="text-[11px] font-black mt-1 leading-tight max-w-[200px] sm:max-w-[280px] truncate">
                  {steps[0].instruction}
                </h5>
                <span className="text-[8px] text-emerald-200/80 font-bold">In {steps[0].distance} meters</span>
              </div>
            </div>

            {/* Re-centering control embedded inside the navigation bar */}
            <button
              onClick={centerOnDriver}
              className="p-2.5 rounded-lg bg-emerald-550/30 hover:bg-emerald-500/40 text-white shadow-sm cursor-pointer transition active:scale-95 flex items-center justify-center border border-emerald-400/25"
              title="Center on Driver"
            >
              <Crosshair size={12} />
            </button>
          </div>
        )}

        {/* Top Panel: Row controls in Preview Mode (Search + Center side-by-side) */}
        {!isNavigating && nextOrder && (
          <div className="absolute top-3 left-3 right-3 z-[1012] flex gap-2">
            {/* Search Widget */}
            <div className="flex-1 flex gap-1.5 p-1 bg-white/95 dark:bg-slate-900/95 border border-slate-200/85 dark:border-slate-800/80 rounded-xl shadow-md backdrop-blur-md">
              <input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => setMapSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleMapSearch();
                }}
                placeholder="Search destination to route..."
                className="flex-1 px-3 py-1.5 text-xs bg-transparent text-slate-850 dark:text-slate-200 focus:outline-none placeholder-slate-400"
              />
              <button
                onClick={handleMapSearch}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-sm transition cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
                title="Search location"
              >
                <Search size={12} />
              </button>
            </div>

            {/* Centering button aligned on the same row */}
            <button
              onClick={centerOnDriver}
              className="p-3 rounded-xl bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/85 dark:border-slate-800/80 shadow-md cursor-pointer text-slate-600 dark:text-slate-350 backdrop-blur-md active:scale-95 flex items-center justify-center shrink-0 w-[42px]"
              title="Center on Driver"
            >
              <Crosshair size={14} />
            </button>
          </div>
        )}



        {/* Leaflet dynamic layer rendering */}
        {mapInstance && nextOrder && (
          <>
            <DriverMarker map={mapInstance} position={[driverCoords.lat, driverCoords.lng]} />
            <CustomerMarker map={mapInstance} position={[finalDestLat, finalDestLng]} />
            {routeCoords.length > 0 && (
              <RoutePolyline
                map={mapInstance}
                positions={routeCoords}
                color={isNavigating ? "#10b981" : "#3b82f6"} // Emerald green in active navigation, blue in preview
                weight={isNavigating ? 6 : 4} // Thicker path in active navigation
                dashArray={isNavigating ? null : "8, 8"} // Solid line in navigation, dotted in preview
              />
            )}
          </>
        )}

        {/* Bottom tracking statistics card overlay */}
        {nextOrder && (
          <div className="absolute bottom-3 left-3 right-3 z-[1012] glass-panel border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-3 shadow-lg flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                <Truck size={14} />
              </div>
              <div className="min-w-0">
                <h6 className="text-[10px] font-black text-slate-850 dark:text-white leading-none truncate flex items-center gap-2">
                  {searchedPlaceName
                    ? `Route to ${searchedPlaceName}`
                    : `Delivering to ${nextOrder.address?.firstName || "Customer"}`}
                  
                  {/* Glowing dynamic GPS tracking indicator badge */}
                  <span className="inline-flex items-center gap-1 text-[8px] text-emerald-500 font-extrabold uppercase bg-emerald-500/10 px-1.5 py-0.5 rounded-full shrink-0">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    GPS Connected
                  </span>
                </h6>
                <p className="text-[8px] text-slate-405 dark:text-slate-400 mt-1.5 uppercase font-bold tracking-wider truncate">
                  ETA {duration} mins • {distance} km left
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {isNavigating ? (
                <>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&origin=${driverCoords.lat},${driverCoords.lng}&destination=${finalDestLat},${finalDestLng}&travelmode=driving`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-200 text-[8px] font-black uppercase tracking-wider transition text-center shrink-0"
                  >
                    Google Maps
                  </a>
                  <button
                    onClick={() => {
                      setIsNavigating(false);
                      toast.info("Exited navigation mode");
                    }}
                    className="px-2.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[8px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 active:scale-95"
                  >
                    Exit
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsNavigating(true);
                    toast.success("Active Navigation Started!");
                  }}
                  className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[8px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 active:scale-95"
                >
                  Navigate
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryMap;
