import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { performanceMonitor } from "./utils/performance";

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.init();
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
