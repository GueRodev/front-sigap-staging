import {
  LayoutGrid,
  Heart,
  ClipboardList,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "@/stores/authStore";

export type SolicitanteNavLink = {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
  /** Roles que pueden ver el link. Si se omite, lo ven todos los solicitantes. */
  allowedRoles?: UserRole[];
  /** Clave de badge (conteo) a mostrar sobre el link. */
  badgeKey?: "activeLoans" | "cart" | "favorites";
};

/**
 * Navegación del solicitante (navbar superior).
 * UI en español, identificadores en inglés.
 */
export const solicitanteNavigation: SolicitanteNavLink[] = [
  { title: "Catálogo", url: "/catalogo", icon: LayoutGrid, end: true },
  { title: "Favoritos", url: "/favoritos", icon: Heart, badgeKey: "favorites" },
  { title: "Mis Préstamos", url: "/mis-prestamos", icon: ClipboardList, badgeKey: "activeLoans" },
  {
    title: "Mis Equipos",
    url: "/mis-equipos",
    icon: Monitor,
    allowedRoles: ["professor", "administrative"],
  },
];
