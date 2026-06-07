import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    // "::" can make localhost unreachable on some Windows setups; 0.0.0.0 is reliable for IPv4 + LAN.
    host: "0.0.0.0",
    port: 8000,
    // If 8000 is taken, try the next free port instead of exiting (see terminal for URL).
    strictPort: false,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@therapist-portal": path.resolve(__dirname, "apps/speakable-web/src/components/therapist-portal"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime"],
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@tanstack/react-query"],
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (id.includes("@react-three/fiber")) {
            return "r3f-vendor";
          }

          if (id.includes("@react-three/drei") || id.includes("three-stdlib") || id.includes("troika-")) {
            return "drei-vendor";
          }

          if (id.includes("/three/examples/")) {
            return "three-examples-vendor";
          }

          if (id.includes("/three/")) {
            return "three-core-vendor";
          }

          if (id.includes("react-router") || id.includes("@remix-run")) {
            return "router-vendor";
          }

          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("scheduler")) {
            return "react-core-vendor";
          }

          if (id.includes("@supabase") || id.includes("@marsidev/react-turnstile")) {
            return "auth-vendor";
          }

          if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("tailwind") || id.includes("class-variance-authority")) {
            return "ui-vendor";
          }

          if (id.includes("recharts") || id.includes("d3-")) {
            return "charts-vendor";
          }
        },
      },
    },
  },
}));
