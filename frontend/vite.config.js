import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
// import { minify } from "terser";
import path from "path";
//eslint-disable-next-line
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
  port: 8080,
    hmr: { host: "localhost" },
    hot: true,
    open: true,
  },
  plugins: [react()],
  /*
  build: {
    // Change the build destination folder (default is 'dist')
    // outDir: "/var/www/prochat", // Specify your custom folder name here
    outDir: "dist",

    // Option to change the output folder for assets like JS, CSS, etc.
    // assetsDir: "assets", // Folder for static assets

    // Minify the build (default is 'esbuild')
    // minify: "terser", // You can use 'esbuild' or 'terser' for better optimization

    // Terser options (optional, you can tweak them based on your needs)
    // terserOptions: {
    // compress: {
    // drop_console: true, // Option to remove `console` statements
    // },
    // mangle: true, // Option to mangle variable names
    // }, //endterser options

    // Enable source maps for easier debugging in production
    // sourcemap: true, // You can set this to 'false' to remove source maps from the build

    // You can also define the target environment (default is 'modules')
    target: "esnext", // Ensure better modern browser support

    // Rollup options, which Vite uses under the hood for bundling
    // rollupOptions: {
    //   output: {
    //     // Define custom chunking behavior for better optimization
    //     manualChunks: {
    //       vendor: [
    //         // "react", "react-dom"
    //         "@fortawesome/fontawesome-svg-core",
    //         "@fortawesome/free-brands-svg-icons",
    //         "@fortawesome/free-regular-svg-icons",
    //         "@fortawesome/free-solid-svg-icons",
    //         "@fortawesome/react-fontawesome",
    //         "bootstrap",
    //         "dayjs",
    //         // "font-awesome",
    //         "react",
    //         "react-dom",
    //         "react-fontawesome",
    //         "react-markdown",
    //         "remark-gfm",
    //       ], // Split common dependencies into a separate chunk
    //     },
    //   },
    // },
  }, //endBuild
  */
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
