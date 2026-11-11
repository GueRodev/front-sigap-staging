import { create } from "zustand";

export type UserRole = "super_admin" | "student" | "professor" | "administrative";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const MOCK_USERS: { email: string; password: string; user: User }[] = [
  {
    email: "admin@ucr.ac.cr",
    password: "admin123",
    user: { id: "1", name: "Admin SIGAP", email: "admin@ucr.ac.cr", role: "super_admin" },
  },
  {
    email: "maria@ucr.ac.cr",
    password: "est123",
    user: { id: "2", name: "María Estudiante", email: "maria@ucr.ac.cr", role: "student" },
  },
  {
    email: "carlos.jimenez@ucr.ac.cr",
    password: "prof123",
    user: { id: "3", name: "Carlos Jiménez", email: "carlos.jimenez@ucr.ac.cr", role: "professor" },
  },
  {
    email: "maria.gonzalez@ucr.ac.cr",
    password: "adm123",
    user: { id: "4", name: "María González", email: "maria.gonzalez@ucr.ac.cr", role: "administrative" },
  },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (email, password) => {
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (found) {
      set({ user: found.user, isAuthenticated: true });
      return true;
    }
    return false;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
