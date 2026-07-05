import { backendUrl } from "./config";

window.onerror = function (message, source, lineno, colno, error) {
  const errInfo = {
    message: `${message} at ${source}:${lineno}:${colno}`,
    stack: error ? error.stack : ""
  };
  fetch(`${backendUrl}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(errInfo)
  }).catch(() => {});
};

window.onunhandledrejection = function (event) {
  const errInfo = {
    message: `Unhandled rejection: ${event.reason}`,
    stack: event.reason && event.reason.stack ? event.reason.stack : ""
  };
  fetch(`${backendUrl}/api/log`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(errInfo)
  }).catch(() => {});
};

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import { ComparisonProvider } from "./context/ComparisonContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LanguageProvider>
      <ComparisonProvider>
        <App />
      </ComparisonProvider>
    </LanguageProvider>
  </BrowserRouter>
);
