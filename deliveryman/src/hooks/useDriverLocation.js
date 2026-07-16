import { useState, useEffect, useRef } from "react";

/**
 * Custom React Hook to stream the driver's real-time device coordinate positions.
 * @param {number} fallbackLat Default latitude
 * @param {number} fallbackLng Default longitude
 * @param {boolean} isEnabled Activates active Geolocation watchPosition tracking
 * @returns {{coords: {lat: number, lng: number}, gpsStatus: string, error: string|null}} Geolocation details
 */
export const useDriverLocation = (fallbackLat, fallbackLng, isEnabled) => {
  const [coords, setCoords] = useState({
    lat: fallbackLat || 22.3072,
    lng: fallbackLng || 73.1812
  });
  const [gpsStatus, setGpsStatus] = useState("idle");
  const [error, setError] = useState(null);
  
  const watchIdRef = useRef(null);
  const prevCoordsRef = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!isEnabled) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setGpsStatus("idle");
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setGpsStatus("error");
      return;
    }

    setGpsStatus("acquiring");

    const handleSuccess = (position) => {
      const lat = parseFloat(position.coords.latitude.toFixed(6));
      const lng = parseFloat(position.coords.longitude.toFixed(6));

      // Calculate change: ignore movements under 0.0001 (~11 meters) to throttle rendering load
      const deltaLat = Math.abs(lat - prevCoordsRef.current.lat);
      const deltaLng = Math.abs(lng - prevCoordsRef.current.lng);

      if (deltaLat > 0.0001 || deltaLng > 0.0001) {
        const newCoords = { lat, lng };
        setCoords(newCoords);
        prevCoordsRef.current = newCoords;
        setGpsStatus("tracking");
        setError(null);
      }
    };

    const handleError = (err) => {
      console.warn("watchPosition geolocation tracking error:", err);
      let errMsg = "Failed to acquire location signal";
      if (err.code === 1) {
        errMsg = "GPS permission denied";
        setGpsStatus("unauthorized");
      } else {
        setGpsStatus("error");
      }
      setError(errMsg);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isEnabled]);

  // Synchronize coords if fallback changes and tracking is inactive
  useEffect(() => {
    if (!isEnabled && fallbackLat && fallbackLng) {
      setCoords({ lat: fallbackLat, lng: fallbackLng });
    }
  }, [fallbackLat, fallbackLng, isEnabled]);

  return { coords, gpsStatus, error };
};
