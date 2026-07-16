import { useEffect, useRef } from "react";

/**
 * Renders a driver vehicle icon at the specified position on the Leaflet map.
 * @param {{map: Object, position: number[]}} props Component properties
 */
export const DriverMarker = ({ map, position }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.L || !position || position[0] === 0) return;

    const driverIcon = window.L.divIcon({
      className: "custom-driver-icon",
      html: `<div class="h-6 w-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg animate-pulse">
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
             </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    if (!markerRef.current) {
      markerRef.current = window.L.marker(position, { icon: driverIcon })
        .addTo(map)
        .bindPopup("Your Location");
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

export default DriverMarker;
