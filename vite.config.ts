import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // 5173: puerto estándar de Vite. Debe coincidir con
    // SANCTUM_STATEFUL_DOMAINS=localhost:5173 en el .env del backend.
    // (El 8080 queda libre para el túnel SSH al panel de Dokploy.)
    host: "localhost",
    port: 5173,
    strictPort: true,
    hmr: {
      overlay: false,
    },
    // Proxy de desarrollo: replica la topología A (un solo dominio).
    // El navegador solo ve localhost:5173; Vite reenvía /api a Laravel.
    // En staging/producción este papel lo cumple Traefik.
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
