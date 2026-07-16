import { useEffect, useRef } from "react";

/**
 * Renders a customer address pin marker on the Leaflet map instance.
 * @param {{map: Object, position: number[]}} props Component properties
 */
export const CustomerMarker = ({ map, position }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.L || !position || position[0] === 0) return;

    const destIcon = window.L.divIcon({
      className: "custom-dest-icon",
      html: `<div class="h-6 w-6 rounded-full bg-rose-600 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 24]
    });

    if (!markerRef.current) {
      markerRef.current = window.L.marker(position, { icon: destIcon })
        .addTo(map)
        .bindPopup("Delivery Destination");
    } else {
      markerRef.current.setLatLng(position);
    }

    return () => {
      if (markerRef.current && map) {
        map.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    };
  }, [map, position]);

  return null;
};

export default CustomerMarker;
