import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { performanceMonitor } from "./utils/performance";

// --- React runtime diagnostics (helps detect duplicate React instances) ---
// These logs will appear in the browser console.
try {
  const hook = (globalThis as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  const rendererCount = hook?.renderers ? hook.renderers.size : undefined;

  // If rendererCount > 1, it can indicate multiple React renderers/instances.
  console.log("[ReactDiag] React.version:", React.version);
  console.log("[ReactDiag] DevTools renderers:", rendererCount);
} catch (e) {
  console.log("[ReactDiag] diagnostics failed", e);
}

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  performanceMonitor.init();
}

// Note: StrictMode disabled to prevent React hook issues with certain deps
createRoot(document.getElementById("root")!).render(<App />);

