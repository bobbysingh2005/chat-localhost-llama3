import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    host: "0.0.0.0",
    port: 5001,
    hot: true,
    open: true,
  },
  plugins: [react()],
})