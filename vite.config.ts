import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// Force a single React instance by hard-aliasing React entrypoints.
// This prevents "hooks dispatcher is null" errors (useState/useRef null)
// that occur when different parts of the bundle resolve React from different paths.
const REACT_PATH = path.resolve(__dirname, "node_modules/react");
const REACT_DOM_PATH = path.resolve(__dirname, "node_modules/react-dom");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const enableSentry =
    !!process.env.SENTRY_AUTH_TOKEN &&
    !!process.env.SENTRY_ORG &&
    !!process.env.SENTRY_PROJECT;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      sourcemap: enableSentry,
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      enableSentry &&
        sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          release: process.env.SENTRY_RELEASE,
          sourcemaps: {
            assets: "./dist/**",
          },
        }),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        react: REACT_PATH,
        "react-dom": REACT_DOM_PATH,
        "react/jsx-runtime": path.resolve(REACT_PATH, "jsx-runtime"),
        "react/jsx-dev-runtime": path.resolve(REACT_PATH, "jsx-dev-runtime"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    optimizeDeps: {
      // Rebundle deps to clear any stale pre-bundled chunks
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      force: true,
    },
  };
});


