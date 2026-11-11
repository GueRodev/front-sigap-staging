import { http } from "@/lib/http";
import type { ApiUser } from "../types/auth.types";

/**
 * Llamadas de autenticación contra Laravel (Fortify + Sanctum SPA).
 * Flujo por cookies: primero la cookie CSRF, luego login.
 */
export const authService = {
  /** Entrega la cookie XSRF-TOKEN. Debe llamarse antes del login. */
  csrf: () => http.get("/sanctum/csrf-cookie"),

  login: async (email: string, password: string): Promise<void> => {
    await authService.csrf();
    await http.post("/login", { email, password });
  },

  logout: async (): Promise<void> => {
    await http.post("/logout");
  },

  /** ¿Quién soy? 401 si no hay sesión. */
  me: async (): Promise<ApiUser> => {
    const { data } = await http.get<ApiUser>("/user");
    return data;
  },
};
