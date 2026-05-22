import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const rawPort = process.env.PORT ?? "4173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const rawApiProxyTarget = process.env.VITE_API_PROXY_TARGET ?? process.env.VITE_API_URL?.replace(/\/api\/?$/, "");
const apiProxyTarget = rawApiProxyTarget?.startsWith("http") ? rawApiProxyTarget : "http://localhost:3000";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "..", "..", "attached_assets"),
      "@workspace/api-client-react": path.resolve(__dirname, "src/lib/workspace-stub.ts"),
    },
    dedupe: ["react", "react-dom"],
  },
  esbuild: {
    logLevel: 'error',
  },
  root: path.resolve(__dirname),
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("framer-motion") || id.includes("lucide-react")) return "ui";
          if (id.includes("react") || id.includes("react-dom") || id.includes("@tanstack")) return "vendor";
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    proxy: {
      "/api": {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
