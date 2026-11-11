import { useState } from "react";
import { Bell, LogOut, Menu, ShoppingBag, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/shared/NavLink";
import AppLogo from "@/components/layout/AppLogo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/authStore";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import { solicitanteNavigation, type SolicitanteNavLink } from "@/config/solicitanteNav.config";
import { useSolicitanteBadges } from "@/features/catalogo/hooks/useSolicitanteBadges";

const Badge = ({ count }: { count: number }) => {
  if (count <= 0) return null;
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500/90 px-1.5 text-[11px] font-bold text-amber-950">
      {count}
    </span>
  );
};

const SolicitanteNavbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const badges = useSolicitanteBadges();

  const visibleLinks = solicitanteNavigation.filter(
    (link) => !link.allowedRoles || (user && link.allowedRoles.includes(user.role))
  );

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      logout();
      navigate("/");
    }, 1000);
  };

  // Estilos reutilizados del sidebar admin (SidebarNavItem)
  const TRANSITION = "transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]";
  const sidebarBase = `flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-display font-bold text-sidebar-foreground border-l-2 border-transparent ${TRANSITION} hover:bg-sidebar-accent`;
  const sidebarActive = "bg-sidebar-accent border-sidebar-primary";
  const navbarBase = `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-display font-bold text-sidebar-foreground/70 border-b-2 border-transparent ${TRANSITION} hover:bg-sidebar-accent hover:text-sidebar-foreground`;
  const navbarActive = "bg-sidebar-accent border-sidebar-primary text-sidebar-foreground";

  const renderLink = (
    link: SolicitanteNavLink,
    variant: "sidebar" | "navbar" = "navbar",
    onNavigate?: () => void
  ) => (
    <NavLink
      key={link.url}
      to={link.url}
      end={link.end}
      onClick={onNavigate}
      className={variant === "sidebar" ? sidebarBase : navbarBase}
      activeClassName={variant === "sidebar" ? sidebarActive : navbarActive}
    >
      <link.icon className="h-4 w-4 shrink-0" strokeWidth={2.5} />
      <span>{link.title}</span>
      {link.badgeKey && <Badge count={badges[link.badgeKey]} />}
    </NavLink>
  );


  return (
    <>
      <LoadingOverlay isLoading={isLoading} message="Cerrando sesión..." />
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground md:hidden"
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-72 flex-col bg-sidebar p-0 text-sidebar-foreground">
              <div className="flex items-center border-b border-sidebar-border px-4 py-4 pr-14">
                <AppLogo />
              </div>
              <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-4">
                {visibleLinks.map((link) => renderLink(link, "sidebar", () => setMobileOpen(false)))}
              </nav>

              {/* Footer: acciones rápidas + perfil */}
              <div className="border-t border-sidebar-border p-4">
                <div className="flex flex-col gap-1">
                  <NavLink
                    to="/pedido"
                    onClick={() => setMobileOpen(false)}
                    className={sidebarBase}
                    activeClassName={sidebarActive}
                  >
                    <ShoppingBag className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    <span>Mi Pedido</span>
                    <Badge count={badges.cart} />
                  </NavLink>
                  <button
                    type="button"
                    className={`w-full text-left ${sidebarBase}`}
                  >
                    <Bell className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                    <span>Notificaciones</span>
                    <span className="ml-1 h-2 w-2 rounded-full bg-destructive" />
                  </button>
                </div>

                <div className="mt-3 flex items-center gap-3 border-t border-sidebar-border px-3 pt-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary/20 text-xs font-bold uppercase text-sidebar-primary">
                    {user?.name?.charAt(0)}
                    {user?.name?.split(" ")[1]?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-sidebar-foreground">{user?.name}</p>
                    <p className="truncate text-[11px] font-semibold text-sidebar-foreground/50">{user?.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="mt-3 flex w-full items-center gap-2 rounded-md bg-orange-500/15 px-3 py-2 text-sm font-bold text-orange-400 transition-colors hover:bg-orange-500/25"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo: oculto en móvil, completo desde md */}
          <div className="hidden md:block">
            <AppLogo />
          </div>


          {/* Desktop links */}
          <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {visibleLinks.map((link) => renderLink(link, "navbar"))}
          </nav>

          <div className="flex-1 md:hidden" />


          {/* Mi Pedido */}
          <Button
            variant="ghost"
            onClick={() => navigate("/pedido")}
            className="relative gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Mi Pedido</span>
            <Badge count={badges.cart} />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-sidebar-foreground/70 hover:text-sidebar-foreground"
            aria-label="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>


          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-sidebar-foreground/70 hover:text-sidebar-foreground"
                aria-label="Menú de usuario"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
};

export default SolicitanteNavbar;
