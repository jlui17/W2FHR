import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  
  return {
    plugins: [react()],
    define: {
      global: {},
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // https://ui.shadcn.com/docs/installation/vite
      },
    },
    server: {
      // If needed, add CORS configuration when using local API
      proxy: isProd ? {} : {
        // Add proxy configuration here if needed
      }
    }
  };
});
