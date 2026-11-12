# SIGAP · Front (React + Vite) — imagen para Dokploy
# Etapa 1: Bun instala y compila a /app/dist.
# Etapa 2: nginx sirve solo los archivos estáticos.
# Sin variables de entorno: el front llama a "/api" (relativa)
# y Traefik envía /api al contenedor de Laravel.

# ---------- Etapa 1: build ----------
FROM oven/bun:1.3-alpine AS build
WORKDIR /app

# Primero solo los manifiestos: Docker reutiliza esta capa
# mientras no cambien las dependencias (builds más rápidos).
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ---------- Etapa 2: runtime ----------
FROM nginx:stable-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
