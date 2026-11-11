import { useState } from "react";
import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/shared/NavLink";
import AppLogo from "@/components/layout/AppLogo";
import { useAuthStore } from "@/stores/authStore";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { adminNavigation } from "./sidebar/navigationConfig";
import SidebarNavItem from "./sidebar/SidebarNavItem";

const TRANSITION = "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]";

const AdminSidebar = () => {
  const { state, isMobile } = useSidebar();
  const collapsed = isMobile ? false : state === "collapsed";
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      logout();
      navigate("/");
    }, 1000);
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} message="Cerrando sesión..." />
      <Sidebar collapsible="icon" className="overflow-x-hidden">
        <SidebarHeader className={`flex items-center justify-center px-2 py-4 ${TRANSITION}`}>
          <AppLogo collapsed={collapsed} />
        </SidebarHeader>

        <div className="mx-2 h-px bg-sidebar-border" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel
              className={`text-[12px] font-extrabold uppercase tracking-widest text-sidebar-foreground/50 ${TRANSITION}`}
            >
              <span
                className={`truncate whitespace-nowrap ${TRANSITION}`}
                style={{
                  opacity: collapsed ? 0 : 1,
                  maxWidth: collapsed ? 0 : 100,
                }}
              >
                Menú
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavigation.map((item) => (
                  <SidebarNavItem key={item.title} item={item} collapsed={collapsed} />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className={`border-t border-sidebar-border px-2 py-4 overflow-hidden min-w-0 ${TRANSITION}`}>
          <div
            className={`mb-3 w-full min-w-0 overflow-hidden flex items-center gap-3 px-3 ${TRANSITION}`}
            style={{
              maxHeight: collapsed ? 0 : 48,
              opacity: collapsed ? 0 : 1,
            }}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold text-sidebar-primary uppercase">
              {user?.name?.charAt(0)}
              {user?.name?.split(" ")[1]?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-[11px] font-bold text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
          </div>
          <div
            className={`mb-2 -mx-2 overflow-hidden ${TRANSITION}`}
            style={{
              maxHeight: collapsed ? 0 : 2,
              opacity: collapsed ? 0 : 1,
            }}
          >
            <div className="h-px w-full bg-sidebar-border" />
          </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Configuración">
                <NavLink
                  to="/admin/configuracion"
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-bold text-sidebar-foreground border-l-2 border-transparent ${TRANSITION} hover:bg-sidebar-accent`}
                  activeClassName="bg-sidebar-accent border-sidebar-primary"
                >
                  <Settings className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  <span
                    className={`truncate whitespace-nowrap ${TRANSITION}`}
                    style={{
                      opacity: collapsed ? 0 : 1,
                      maxWidth: collapsed ? 0 : 150,
                    }}
                  >
                    Configuración
                  </span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Cerrar Sesión">
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-bold border-l-2 border-transparent ${TRANSITION} w-full bg-orange-500/15 text-orange-400 hover:bg-orange-500/15 hover:text-orange-400`}
                >
                  <LogOut className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                  <span
                    className={`truncate whitespace-nowrap ${TRANSITION}`}
                    style={{
                      opacity: collapsed ? 0 : 1,
                      maxWidth: collapsed ? 0 : 150,
                    }}
                  >
                    Cerrar Sesión
                  </span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AdminSidebar;
