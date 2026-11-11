import { create } from "zustand";
import { authService } from "@/features/auth/services/authService";
import type { ApiUser } from "@/features/auth/types/auth.types";

export type UserRole = "super_admin" | "student" | "professor" | "administrative";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * unknown: aún no se consultó /api/user (p. ej. justo tras recargar la página).
 * authenticated / guest: resultado conocido.
 */
export type AuthStatus = "unknown" | "authenticated" | "guest";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

/**
 * TEMPORAL (ensayo de staging, decisión D3-A):
 * el backend aún no tiene roles (llegan con Spatie en el Spec de AUTH).
 * Todo usuario autenticado se trata como super_admin para entrar a /admin.
 * Reemplazar por el rol real que devuelva la API.
 */
const TEMP_ROLE: UserRole = "super_admin";

const toUser = (apiUser: ApiUser): User => ({
  id: String(apiUser.id),
  name: apiUser.name,
  email: apiUser.email,
  role: TEMP_ROLE,
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "unknown",
  isAuthenticated: false,

  /** Lanza el error de axios si falla; el formulario muestra el mensaje. */
  login: async (email, password) => {
    await authService.login(email, password);
    const user = toUser(await authService.me());
    set({ user, status: "authenticated", isAuthenticated: true });
    return user;
  },

  logout: async () => {
    try {
      await authService.logout();
    } finally {
      // Aunque falle la llamada, el front deja de considerar la sesión activa.
      set({ user: null, status: "guest", isAuthenticated: false });
    }
  },

  /** Restaura la sesión tras recargar la página (cookie aún válida). */
  fetchUser: async () => {
    try {
      const user = toUser(await authService.me());
      set({ user, status: "authenticated", isAuthenticated: true });
    } catch {
      set({ user: null, status: "guest", isAuthenticated: false });
    }
  },
}));
