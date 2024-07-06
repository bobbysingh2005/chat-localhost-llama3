import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
//eslint-disable-next-line
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    // host: "127.0.0.1",
    port: 3000,
    // hot: true,
    // open: true,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
