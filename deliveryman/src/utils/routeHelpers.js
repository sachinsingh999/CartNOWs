/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers, formatted to 1 decimal place
 */
export const getDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return parseFloat(d.toFixed(1));
};

/**
 * Estimates delivery ETA based on distance assuming city traffic speeds (avg 20 km/h)
 * @param {number} distanceKm Distance in kilometers
 * @returns {number} Estimated duration in minutes
 */
export const estimateDuration = (distanceKm) => {
  if (!distanceKm || distanceKm <= 0) return 0;
  // Assumes average speed of 20 km/h with traffic buffer
  const speedKmh = 18;
  const hours = distanceKm / speedKmh;
  const minutes = Math.round(hours * 60);
  return Math.max(3, minutes); // Minimum ETA is 3 minutes
};
