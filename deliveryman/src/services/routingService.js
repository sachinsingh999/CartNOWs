import axios from "axios";

// Cache directory mapping coordinate grids to loaded path arrays
const routeCache = new Map();

/**
 * Resolves the street routing path connecting two coordinates via the OSRM Driving Engine.
 * @param {number} startLat Start point Latitude
 * @param {number} startLng Start point Longitude
 * @param {number} endLat End point Latitude
 * @param {number} endLng End point Longitude
 * @returns {Promise<{coordinates: number[][], distance: number, duration: number, steps: Array}>} Route properties
 */
export const fetchShortestRoute = async (startLat, startLng, endLat, endLng) => {
  if (!startLat || !startLng || !endLat || !endLng) {
    return { coordinates: [], distance: 0, duration: 0, steps: [] };
  }

  // Round to 4 decimal points (approx. 11 meters) to cache nearby locations and filter jitter
  const cacheKey = `${startLat.toFixed(4)},${startLng.toFixed(4)};${endLat.toFixed(4)},${endLng.toFixed(4)}`;

  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey);
  }

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
    const response = await axios.get(url);

    if (
      response.data &&
      response.data.routes &&
      response.data.routes.length > 0
    ) {
      const route = response.data.routes[0];
      const geojsonCoords = route.geometry.coordinates; // Returns [lng, lat]
      const distance = parseFloat((route.distance / 1000).toFixed(1)); // Convert meters to km
      const duration = Math.max(1, Math.round(route.duration / 60)); // Convert seconds to minutes

      // Parse turn-by-turn directions instructions
      const steps = route.legs?.[0]?.steps?.map((step) => ({
        instruction: step.maneuver?.instruction || "Proceed straight",
        distance: Math.round(step.distance) // in meters
      })) || [];

      // Leaflet expects [lat, lng] format
      const coordinates = geojsonCoords.map((coord) => [coord[1], coord[0]]);

      const result = { coordinates, distance, duration, steps };
      routeCache.set(cacheKey, result);
      return result;
    }
  } catch (error) {
    console.error("OSRM Route API failed:", error);
  }

  // Fallback to straight line coordinate array on failure
  return {
    coordinates: [
      [startLat, startLng],
      [endLat, endLng]
    ],
    distance: 0,
    duration: 0,
    steps: []
  };
};
