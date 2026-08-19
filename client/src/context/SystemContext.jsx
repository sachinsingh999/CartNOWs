import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { backendUrl } from "../config";
import { AnimatePresence } from "framer-motion";
import SplashLoader from "../components/SplashLoader";
import Maintenance from "../pages/Maintenance";

const SystemContext = createContext(null);

export const SystemProvider = ({ children }) => {
  const getInitialMaintenance = () => {
    try {
      const cached = sessionStorage.getItem("cached_maintenance_settings");
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  };

  const initialSettings = getInitialMaintenance();
  const [maintenanceSettings, setMaintenanceSettings] = useState(initialSettings);
  const [loadingMaintenance, setLoadingMaintenance] = useState(!initialSettings);
  const [showSplash, setShowSplash] = useState(true);
  const [canDismissSplash, setCanDismissSplash] = useState(false);

  // Fetch maintenance settings on mount with fast timeout and safety fallback
  useEffect(() => {
    let isMounted = true;

    // Safety fallback: Never let splash wait more than 800ms for maintenance check
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoadingMaintenance(false);
      }
    }, 800);

    const checkMaintenance = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/system/maintenance`, { timeout: 1000 });
        if (data.success && isMounted) {
          setMaintenanceSettings(data.settings);
          try {
            sessionStorage.setItem("cached_maintenance_settings", JSON.stringify(data.settings));
          } catch (e) {}
        }
      } catch (err) {
        // Silently catch network timeouts / sleeping backend
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setLoadingMaintenance(false);
        }
      }
    };

    checkMaintenance();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleSplashComplete = () => {
    setCanDismissSplash(true);
  };

  // Dismiss splash screen promptly when loader completes
  useEffect(() => {
    if (canDismissSplash) {
      setShowSplash(false);
    }
  }, [canDismissSplash]);

  const isMaintenanceActive =
    !loadingMaintenance &&
    maintenanceSettings?.enabled &&
    !maintenanceSettings?.isWhitelisted;

  const systemValue = useMemo(
    () => ({ showSplash, maintenanceSettings }),
    [showSplash, maintenanceSettings]
  );

  return (
    <SystemContext.Provider value={systemValue}>
      <AnimatePresence>
        {showSplash && <SplashLoader onComplete={handleSplashComplete} />}
      </AnimatePresence>

      {isMaintenanceActive ? (
        <Maintenance settings={maintenanceSettings} />
      ) : (
        children
      )}
    </SystemContext.Provider>
  );
};

export const useSystem = () => useContext(SystemContext);
