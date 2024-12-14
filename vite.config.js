import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
//eslint-disable-next-line
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 8080,
    hmr: { host: 'localhost' },
    hot: true,
    open: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
