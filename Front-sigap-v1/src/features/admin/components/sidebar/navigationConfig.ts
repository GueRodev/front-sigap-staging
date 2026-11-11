import {
  BarChart3,
  Monitor,
  ShoppingBag,
  ArrowLeftRight,
  MapPin,
  FileText,
  Users,
  ClipboardList,
  FolderTree,
  ScanBarcode,
  Mail,
  RefreshCw,
  ShieldCheck,
  UserRoundCheck,
  type LucideIcon,
} from "lucide-react";

export type NavChild = {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
};

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  end?: boolean;
  children?: NavChild[];
};

/**
 * Single source of truth for the admin sidebar navigation.
 * UI labels in Spanish, code identifiers in English.
 */
export const adminNavigation: NavItem[] = [
  { title: "Inicio", url: "/admin", icon: BarChart3, end: true },
  {
    title: "Activos",
    url: "/admin/activos",
    icon: Monitor,
    children: [
      { title: "Registro", url: "/admin/activos", icon: ClipboardList, end: true },
      { title: "Categorías", url: "/admin/activos/categorias", icon: FolderTree },
      { title: "Inventario", url: "/admin/activos/inventario", icon: ScanBarcode },
    ],
  },
  { title: "Préstamos", url: "/admin/prestamos", icon: ShoppingBag },
  { title: "Traslados", url: "/admin/traslados", icon: ArrowLeftRight },
  { title: "Áreas", url: "/admin/areas", icon: MapPin },
  { title: "Reportes", url: "/admin/reportes", icon: FileText },
  { title: "Notificaciones", url: "/admin/notificaciones", icon: Mail },
  {
    title: "Usuarios",
    url: "/admin/usuarios",
    icon: Users,
    children: [
      { title: "Registrados", url: "/admin/usuarios", icon: UserRoundCheck, end: true },
      { title: "Lista permitida", url: "/admin/usuarios/lista-permitida", icon: ShieldCheck },
      { title: "Sincronización", url: "/admin/usuarios/sincronizacion", icon: RefreshCw },
    ],
  },
];
