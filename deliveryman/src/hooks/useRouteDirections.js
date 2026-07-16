import { useState, useEffect, useRef } from "react";
import { fetchShortestRoute } from "../services/routingService";
import { getDistance, estimateDuration } from "../utils/routeHelpers";

/**
 * Custom React Hook to resolve and cache drivable road paths and distance/ETA metrics.
 * @param {number} startLat Starting Latitude
 * @param {number} startLng Starting Longitude
 * @param {number} endLat Destination Latitude
 * @param {number} endLng Destination Longitude
 * @returns {{routeCoords: number[][], distance: number, duration: number, steps: Array, loading: boolean, error: string|null}} Route states
 */
export const useRouteDirections = (startLat, startLng, endLat, endLng) => {
  const [routeCoords, setRouteCoords] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimeoutRef = useRef(null);

  useEffect(() => {
    if (!startLat || !startLng || !endLat || !endLng) {
      setRouteCoords([]);
      setDistance(0);
      setDuration(0);
      setSteps([]);
      return;
    }

    setLoading(true);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Debounce routing API calls by 500ms to avoid spamming public OSRM servers
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const result = await fetchShortestRoute(startLat, startLng, endLat, endLng);
        
        if (result.coordinates && result.coordinates.length > 0) {
          setRouteCoords(result.coordinates);
          setSteps(result.steps || []);
          
          // If OSRM distance details are blank (e.g. failure fallback), estimate mathematically
          if (result.distance === 0) {
            const mathDist = getDistance(startLat, startLng, endLat, endLng);
            setDistance(mathDist);
            setDuration(estimateDuration(mathDist));
          } else {
            setDistance(result.distance);
            setDuration(result.duration);
          }
          setError(null);
        } else {
          throw new Error("No route found connecting points");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch drivable route. Showing straight path instead.");
        // Fallback to straight line coordinate array
        setRouteCoords([
          [startLat, startLng],
          [endLat, endLng]
        ]);
        setSteps([]);
        const mathDist = getDistance(startLat, startLng, endLat, endLng);
        setDistance(mathDist);
        setDuration(estimateDuration(mathDist));
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [startLat, startLng, endLat, endLng]);

  return { routeCoords, distance, duration, steps, loading, error };
};
