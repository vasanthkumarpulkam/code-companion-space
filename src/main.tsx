import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { performanceMonitor } from "./utils/performance";

// Minimal React runtime diagnostics (helps detect duplicate React instances)
if (import.meta.env.DEV) {
  try {
    console.log("[ReactDiag] React.version:", React.version);
  } catch {
    // ignore
  }
}

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  performanceMonitor.init();
}

createRoot(document.getElementById("root")!).render(<App />);


