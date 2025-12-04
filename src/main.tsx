import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { performanceMonitor } from "./utils/performance";

// Initialize performance monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.init();
}

createRoot(document.getElementById("root")!).render(<App />);
