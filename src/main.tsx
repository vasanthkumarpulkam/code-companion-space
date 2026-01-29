import * as React from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
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

const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  Sentry.init({
    dsn: sentryDsn,
    environment: import.meta.env.MODE,
    release: import.meta.env.VITE_APP_VERSION,
  });
}

// Initialize performance monitoring in development
if (import.meta.env.DEV) {
  performanceMonitor.init();
}

createRoot(document.getElementById("root")!).render(<App />);


