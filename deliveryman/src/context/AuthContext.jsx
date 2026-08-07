import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("deliveryman_token") || ""
  );
  const [driver, setDriver] = useState(
    JSON.parse(localStorage.getItem("deliveryman_info")) || null
  );

  useEffect(() => {
    localStorage.setItem("deliveryman_token", token);
    if (driver) {
      localStorage.setItem("deliveryman_info", JSON.stringify(driver));
    } else {
      localStorage.removeItem("deliveryman_info");
    }
  }, [token, driver]);

  const logout = () => {
    setToken("");
    setDriver(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, driver, setDriver, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
