import { useEffect, useRef } from "react";

/**
 * Draws the routing lines representing drivable street routes on the Leaflet map.
 * @param {{map: Object, positions: number[][], color: string}} props Component properties
 */
export const RoutePolyline = ({ map, positions, color = "#3b82f6", weight = 4, dashArray = "8, 8" }) => {
  const polylineRef = useRef(null);

  useEffect(() => {
    if (!map || !window.L || !positions || positions.length === 0) return;

    if (!polylineRef.current) {
      polylineRef.current = window.L.polyline(positions, {
        color,
        weight,
        dashArray,
        opacity: 0.8
      }).addTo(map);
    } else {
      polylineRef.current.setLatLngs(positions);
      polylineRef.current.setStyle({ color, weight, dashArray });
    }

    return () => {
      if (polylineRef.current && map) {
        map.removeLayer(polylineRef.current);
        polylineRef.current = null;
      }
    };
  }, [map, positions, color, weight, dashArray]);

  return null;
};

export default RoutePolyline;
