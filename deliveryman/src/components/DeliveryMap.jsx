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
    return nextOrder?.address?.lat ? parseFloat(nextOrder.address.lat) : null;
  }, [destLat, nextOrder?.address?.lat]);

  const finalDestLng = useMemo(() => {
    if (destLng !== null) return destLng;
    return nextOrder?.address?.lng ? parseFloat(nextOrder.address.lng) : null;
  }, [destLng, nextOrder?.address?.lng]);

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
    <div className="w-full h-full min-h-[360px] relative overflow-hidden rounded-xs bg-[#E8EEF5] dark:bg-[#090d16] flex flex-col justify-between">
      {/* Leaflet map container */}
      <div 
        id="live-delivery-leaflet-map" 
        className="absolute inset-0 w-full h-full z-10" 
      />

      {/* Top Floating Bar: Live Location Button & Search */}
      <div className="absolute top-3 left-3 right-3 z-[1010] flex items-center justify-between gap-2 pointer-events-none">
        {/* Search destination popup on hover/focus */}
        <div className="pointer-events-auto flex-1 max-w-[200px] hidden sm:block">
          <div className="flex items-center gap-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1.5 rounded-xs border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <Search size={12} className="text-slate-400" />
            <input
              type="text"
              value={mapSearchQuery}
              onChange={(e) => setMapSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleMapSearch();
              }}
              placeholder="Search area..."
              className="w-full text-[11px] bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Live Location button on the right */}
        <div className="pointer-events-auto ml-auto flex items-center gap-2">
          <button
            onClick={centerOnDriver}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-blue-600 dark:text-blue-400 rounded-xs text-xs font-semibold shadow-sm backdrop-blur-md transition cursor-pointer active:scale-95"
          >
            <Crosshair size={13} className="text-blue-600" />
            <span>Live Location</span>
          </button>
        </div>
      </div>

      {/* Right Side Zoom & Map Controls */}
      <div className="absolute right-3 top-16 z-[1010] flex flex-col gap-1.5">
        <button
          onClick={() => mapInstance && mapInstance.zoomIn()}
          className="h-8 w-8 rounded-xs bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={() => mapInstance && mapInstance.zoomOut()}
          className="h-8 w-8 rounded-xs bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95"
          title="Zoom Out"
        >
          -
        </button>
      </div>

      {/* Leaflet dynamic layer rendering */}
      {mapInstance && (
        <>
          <DriverMarker map={mapInstance} position={[driverCoords.lat, driverCoords.lng]} />
          {nextOrder && finalDestLat && finalDestLng && (
            <CustomerMarker map={mapInstance} position={[finalDestLat, finalDestLng]} />
          )}
          {routeCoords.length > 0 && (
            <RoutePolyline
              map={mapInstance}
              positions={routeCoords}
              color="#2563eb"
              weight={4}
              dashArray={null}
            />
          )}
        </>
      )}

      {/* Bottom floating overlay bar */}
      <div className="absolute bottom-3 left-3 right-3 z-[1010]">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xs p-3 border border-slate-200/80 dark:border-slate-800 shadow-lg flex items-center justify-between gap-3">
          {nextOrder ? (
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {duration ? `Estimated arrival: ${duration}` : "Live Delivery Route"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {distance ? `${distance} to destination` : "GPS tracking active"} • Order #{nextOrder._id ? nextOrder._id.slice(-6).toUpperCase() : ""}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                GPS Radar • Ready for Dispatch
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {stats?.isOnline || driver?.isOnline ? "Online in assigned zone • Awaiting new shipments" : "Offline • Toggle duty online to receive orders"}
              </div>
            </div>
          )}

          {nextOrder && finalDestLat && finalDestLng && (
            <button
              onClick={() => {
                if (mapInstance && finalDestLat && finalDestLng) {
                  const bounds = window.L?.latLngBounds([
                    [driverCoords.lat, driverCoords.lng],
                    [finalDestLat, finalDestLng]
                  ]);
                  if (bounds) mapInstance.fitBounds(bounds, { padding: [40, 40] });
                }
                toast.success("Route view centered!");
              }}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 dark:text-blue-400 rounded-xs text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shrink-0 active:scale-95"
            >
              <Navigation size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Center Route</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryMap;
