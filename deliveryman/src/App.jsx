import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Context providers
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Components
import Login from "./components/Login";
import SignUp from "./pages/SignUp";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import { Sun, Moon } from "lucide-react";

const AppContent = () => {
  const { theme, toggleTheme } = useTheme();
  const { token, setToken, setDriver } = useAuth();

  return (
    <div className="bg-[#F8FAFC] dark:bg-[#090D16] min-h-screen flex flex-col antialiased text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <ToastContainer position="top-right" autoClose={3000} theme={theme} />

      {!token ? (
        <div className="relative flex-1 flex flex-col justify-center">
          <Routes>
            <Route path="/" element={<Landing theme={theme} setTheme={toggleTheme} />} />
            <Route path="/login" element={
              <>
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-sm bg-white border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition shadow-xs cursor-pointer"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                </div>
                <Login setToken={setToken} setDriver={setDriver} />
              </>
            } />
            <Route path="/signup" element={
              <>
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-sm bg-white border border-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:text-white transition shadow-xs cursor-pointer"
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  >
                    {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
                  </button>
                </div>
                <SignUp />
              </>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      ) : (
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/returns" element={<Dashboard />} />
            <Route path="/pool" element={<Dashboard />} />
            <Route path="/complaints" element={<Dashboard />} />
            <Route path="/profile" element={<Dashboard />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
