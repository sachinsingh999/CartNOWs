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

  // Fetch maintenance settings on mount
  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/system/maintenance`);
        if (data.success) {
          setMaintenanceSettings(data.settings);
          try {
            sessionStorage.setItem("cached_maintenance_settings", JSON.stringify(data.settings));
          } catch (e) {}
        }
      } catch (err) {
        console.error("Failed to fetch maintenance settings:", err);
      } finally {
        setLoadingMaintenance(false);
      }
    };
    checkMaintenance();
  }, []);

  const handleSplashComplete = () => {
    setCanDismissSplash(true);
  };

  // Only dismiss splash screen when BOTH the loader animation finishes and maintenance check completes
  useEffect(() => {
    if (canDismissSplash && !loadingMaintenance) {
      setShowSplash(false);
    }
  }, [canDismissSplash, loadingMaintenance]);

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
