import axios from "axios";

/**
 * Cliente HTTP único hacia la API de SIGAP (Laravel).
 *
 * - baseURL "/api": mismo dominio que el front (topología A).
 *   En local, Vite reenvía /api a Laravel (ver vite.config.ts);
 *   en staging/producción lo hace Traefik.
 * - withCredentials: envía y recibe las cookies de sesión.
 * - withXSRFToken: copia la cookie XSRF-TOKEN en la cabecera
 *   X-XSRF-TOKEN en cada petición (protección CSRF de Laravel).
 */
export const http = axios.create({
  baseURL: "/api",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});
