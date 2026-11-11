# Sidebar Animado con shadcn/ui — Guía Reutilizable

## Prompt Reutilizable

> Copia y pega este bloque como instrucción en cualquier proyecto Lovable con shadcn/ui para replicar este sidebar:

```
Implementa un sidebar administrativo colapsable usando shadcn/ui <Sidebar collapsible="icon">.

REGLAS DE ANIMACIÓN:
1. Usa esta constante en todos los elementos del sidebar:
   const TRANSITION = "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]";

2. NUNCA uses renderizado condicional ({collapsed && <span>}) para mostrar/ocultar texto.
   En su lugar, mantén el elemento en el DOM y anímalo con style props:
   <span style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200 }}>Texto</span>

3. Para el borde activo de navegación, SIEMPRE renderiza el borde con color transparente
   por defecto (border-l-2 border-transparent) y cambia solo el color en el estado activo
   (activeClassName="... border-sidebar-primary"). Esto evita el "flash blanco" que ocurre
   cuando transition-all anima un borde que aparece/desaparece.

4. En móvil, fuerza collapsed = false para que el Sheet muestre todo el contenido:
   const collapsed = isMobile ? false : state === "collapsed";

5. El logo debe tener el ícono como shrink-0 y el texto con opacity/maxWidth animados.

6. Usa <SidebarMenuButton tooltip={item.title}> para tooltips nativos en modo colapsado.
   NO uses wrappers manuales de Tooltip/TooltipProvider.

7. El SidebarHeader debe usar px-2 py-4 (no p-4) para que el ícono del logo quepa
   en los 48px del ancho colapsado (SIDEBAR_WIDTH_ICON = 3rem).
```

---

## Arquitectura

| Archivo | Rol |
|---------|-----|
| `AdminLayout.tsx` | Layout raíz: `SidebarProvider` + `Sidebar` + `<Outlet />` |
| `AdminSidebar.tsx` | Sidebar completo: menú, footer, perfil, logout, animaciones |
| `AppLogo.tsx` | Logo "SIGAP" con ícono fijo y texto animado |
| `NavLink.tsx` | Wrapper de `react-router-dom NavLink` con `activeClassName` |

---

## Constante de Transición

```ts
const TRANSITION = "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]";
```

Se aplica a **todos** los elementos del sidebar: texto de navegación, footer, perfil, botones y logo. Usar `transition-all` es crítico — listas parciales de propiedades como `transition-[opacity,max-width]` pueden romper la animación de colapso en Tailwind.

---

## Técnica de Animación: Style Props vs Renderizado Condicional

### ❌ Incorrecto (sin animación)
```tsx
{!collapsed && <span>{item.title}</span>}
```

### ✅ Correcto (animación suave)
```tsx
<span
  className={`truncate whitespace-nowrap ${TRANSITION}`}
  style={{
    opacity: collapsed ? 0 : 1,
    maxWidth: collapsed ? 0 : 200,
  }}
>
  {item.title}
</span>
```

El elemento permanece en el DOM. CSS se encarga de la transición. `maxWidth` colapsa el espacio horizontal y `opacity` desvanece el texto.

Para elementos verticales (perfil, separadores), usa `maxHeight` en lugar de `maxWidth`:

```tsx
<div
  className={`overflow-hidden ${TRANSITION}`}
  style={{
    maxHeight: collapsed ? 0 : 48,
    opacity: collapsed ? 0 : 1,
  }}
>
  {/* contenido del perfil */}
</div>
```

---

## Borde Activo sin Flash

### Problema
Con `transition-all`, un borde que **aparece/desaparece** (`border-l-2` solo en activo) genera un "flash blanco" de 500ms al cambiar de ruta.

### Solución
Renderizar el borde **siempre** con color transparente, y cambiar solo el color en el estado activo:

```tsx
// Base: borde siempre presente, invisible
className="... border-l-2 border-transparent ..."

// Activo: solo cambia el color
activeClassName="bg-sidebar-accent text-sidebar-foreground border-sidebar-primary"
```

`transition-all` ahora anima `border-color` (transparente → azul), que es instantáneo visualmente. No hay layout shift porque el borde siempre ocupa espacio.

---

## Código de Referencia Completo

### AdminLayout.tsx

```tsx
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "@/features/admin/components/AdminSidebar";
import AppHeader from "@/components/layout/AppHeader";

const AdminLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex flex-1 flex-col bg-background p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;
```

### AdminSidebar.tsx

```tsx
import { useState } from "react";
import {
  LayoutDashboard, Package, HandHelping, ArrowLeftRight,
  BarChart3, Users, Settings, LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import AppLogo from "@/components/layout/AppLogo";
import { useAuthStore } from "@/stores/authStore";
import LoadingOverlay from "@/components/shared/LoadingOverlay";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup,
  SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Inicio", url: "/admin", icon: LayoutDashboard, end: true },
  { title: "Activos", url: "/admin/activos", icon: Package },
  { title: "Préstamos", url: "/admin/prestamos", icon: HandHelping },
  { title: "Traslados", url: "/admin/traslados", icon: ArrowLeftRight },
  { title: "Reportes", url: "/admin/reportes", icon: BarChart3 },
  { title: "Usuarios", url: "/admin/usuarios", icon: Users },
];

const TRANSITION = "transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]";

const AdminSidebar = () => {
  const { state, isMobile } = useSidebar();
  const collapsed = isMobile ? false : state === "collapsed";
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => { logout(); navigate("/"); }, 1000);
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} message="Cerrando sesión..." />
      <Sidebar collapsible="icon">
        <SidebarHeader className={`px-2 py-4 ${TRANSITION}`}>
          <AppLogo collapsed={collapsed} />
        </SidebarHeader>

        <div className="mx-2 h-px bg-sidebar-border" />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={`text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 ${TRANSITION}`}>
              <span
                className={`truncate whitespace-nowrap ${TRANSITION}`}
                style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 100 }}
              >
                Menú
              </span>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <NavLink
                        to={item.url}
                        end={item.end}
                        className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 border-l-2 border-transparent ${TRANSITION} hover:bg-sidebar-accent hover:text-sidebar-foreground`}
                        activeClassName="bg-sidebar-accent text-sidebar-foreground border-sidebar-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span
                          className={`truncate whitespace-nowrap ${TRANSITION}`}
                          style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 200 }}
                        >
                          {item.title}
                        </span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className={`border-t border-sidebar-border px-2 py-4 ${TRANSITION}`}>
          {/* Perfil de usuario — usa maxHeight para colapso vertical */}
          <div
            className={`mb-3 overflow-hidden flex items-center gap-3 px-3 ${TRANSITION}`}
            style={{ maxHeight: collapsed ? 0 : 48, opacity: collapsed ? 0 : 1 }}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground uppercase">
              {user?.name?.charAt(0)}{user?.name?.split(" ")[1]?.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Separador animado */}
          <div
            className={`mb-2 -mx-2 overflow-hidden ${TRANSITION}`}
            style={{ maxHeight: collapsed ? 0 : 2, opacity: collapsed ? 0 : 1 }}
          >
            <div className="h-px w-full bg-sidebar-border" />
          </div>

          {/* Configuración y Cerrar Sesión */}
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Configuración">
                <NavLink
                  to="/admin/configuracion"
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 border-l-2 border-transparent ${TRANSITION} hover:bg-sidebar-accent hover:text-sidebar-foreground`}
                  activeClassName="bg-sidebar-accent text-sidebar-foreground border-sidebar-primary"
                >
                  <Settings className="h-4 w-4 shrink-0" />
                  <span
                    className={`truncate whitespace-nowrap ${TRANSITION}`}
                    style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 150 }}
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
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 border-l-2 border-transparent ${TRANSITION} hover:bg-sidebar-accent hover:text-sidebar-foreground w-full`}
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span
                    className={`truncate whitespace-nowrap ${TRANSITION}`}
                    style={{ opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 150 }}
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
```

### AppLogo.tsx

```tsx
import { Shield } from "lucide-react";

interface AppLogoProps {
  collapsed?: boolean;
}

const AppLogo = ({ collapsed = false }: AppLogoProps) => {
  return (
    <div className="flex items-center gap-2.5 overflow-hidden">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <Shield className="h-5 w-5 text-sidebar-primary-foreground" />
      </div>
      <div
        className="flex flex-col overflow-hidden whitespace-nowrap transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          opacity: collapsed ? 0 : 1,
          maxWidth: collapsed ? 0 : 150,
          marginLeft: collapsed ? 0 : undefined,
        }}
      >
        <span className="text-sm font-bold tracking-wide text-sidebar-foreground">SIGAP</span>
        <span className="text-[10px] font-medium text-sidebar-foreground/60">Gestión de Activos</span>
      </div>
    </div>
  );
};

export default AppLogo;
```

### NavLink.tsx

```tsx
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";
export { NavLink };
```

---

## Bugs Resueltos

### 1. Tooltips Sticky

**Problema**: Tooltips permanecían visibles permanentemente al contraer el sidebar.
**Causa**: Wrappers manuales de `Tooltip`/`TooltipProvider` con `{collapsed && <TooltipContent>}`.
**Solución**: Usar la prop nativa `tooltip` de `SidebarMenuButton`:
```tsx
<SidebarMenuButton asChild tooltip={item.title}>
```

### 2. Logo Recortado al Contraer

**Problema**: El ícono Shield se recortaba cuando el sidebar estaba contraído (48px disponibles).
**Causa**: `p-4` (32px padding) + `h-9 w-9` (36px ícono) = 68px > 48px.
**Solución**: Reducir padding a `px-2 py-4` e ícono a `h-8 w-8`: 8+32+8 = 48px ✓

### 3. Error `DialogTitle` en Móvil

**Problema**: Warning de accesibilidad en el Sheet móvil del sidebar.
**Solución**: Agregar `<SheetTitle className="sr-only">` y `aria-describedby={undefined}` al `SheetContent`.

### 4. Footer Invisible en Móvil

**Problema**: Perfil y botón "Cerrar Sesión" no aparecían en móvil.
**Causa dual**: SheetContent sin altura fija + estado `collapsed=true` desde desktop.
**Solución**:
- `SheetContent`: `flex h-svh max-h-svh flex-col overflow-hidden`
- Lógica: `const collapsed = isMobile ? false : state === "collapsed"`

### 5. Flash Blanco del Borde Activo

**Problema**: Al navegar entre items, el borde `border-l-2` del item anterior se desvanecía lentamente (500ms) creando un flash blanco.
**Causa**: `transition-all` animaba el borde que aparecía/desaparecía (solo presente en `activeClassName`).
**Solución**: Renderizar `border-l-2 border-transparent` siempre en el className base. El `activeClassName` solo cambia el color a `border-sidebar-primary`. La transición ahora es de color (transparente→azul), visualmente instantánea.

### 6. Animación de Colapso Rota

**Problema**: Al cambiar `TRANSITION` de `transition-all` a `transition-[opacity,max-width,...]`, la animación de colapso de texto se volvió abrupta.
**Causa**: La lista parcial de propiedades en la sintaxis arbitraria de Tailwind no generaba CSS válido para todas las propiedades necesarias.
**Solución**: Revertir a `transition-all` y resolver el flash del borde con la técnica `border-transparent` (Bug #5).

---

## Ajustes en sidebar.tsx (shadcn/ui)

Para el soporte móvil correcto, el `SheetContent` del sidebar necesita estos cambios:

```tsx
<SheetContent
  aria-describedby={undefined}
  className="flex h-svh max-h-svh flex-col overflow-hidden w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
  ...
>
  <SheetTitle className="sr-only">Navigation</SheetTitle>
  {children}
</SheetContent>
```
