import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import AdminLayout from "./features/admin/layouts/AdminLayout";
import AdminDashboardPage from "./features/admin/pages/AdminDashboardPage";
import AdminEquipmentPage from "./features/admin/pages/AdminEquipmentPage";
import AdminCategoriesPage from "./features/admin/pages/AdminCategoriesPage";
import InventoriesListPage from "./features/inventory/pages/InventoriesListPage";
import InventoryDetailPage from "./features/inventory/pages/InventoryDetailPage";
import InventoryAreaReviewPage from "./features/inventory/pages/InventoryAreaReviewPage";
import InventorySessionPage from "./features/inventory/pages/InventorySessionPage";
import AdminLoansPage from "./features/admin/pages/AdminLoansPage";
import AdminTransfersPage from "./features/admin/pages/AdminTransfersPage";
import PendingTransfersPage from "./features/transfers/pages/PendingTransfersPage";
import AreasPage from "./features/areas/pages/AreasPage";
import AdminReportsPage from "./features/admin/pages/AdminReportsPage";
import AdminNotificationsPage from "./features/admin/pages/AdminNotificationsPage";
import AdminSettingsPage from "./features/admin/pages/AdminSettingsPage";
import SolicitanteLayout from "./components/layout/SolicitanteLayout";
import { ClipboardList, Monitor, ShoppingBag } from "lucide-react";
import PlaceholderPage from "./components/shared/PlaceholderPage";
import CatalogoPage from "./features/catalogo/pages/CatalogoPage";
import FavoritosPage from "./features/catalogo/pages/FavoritosPage";
import PeopleSemesterSyncPage from "./features/people/pages/PeopleSemesterSyncPage";
import PeopleUserDetailPage from "./features/people/pages/PeopleUserDetailPage";
import PeopleUsersPage from "./features/people/pages/PeopleUsersPage";
import PeopleWhitelistPage from "./features/people/pages/PeopleWhitelistPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="super_admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="activos" element={<AdminEquipmentPage />} />
            <Route path="activos/categorias" element={<AdminCategoriesPage />} />
            <Route path="activos/inventario" element={<InventoriesListPage />} />
            <Route path="activos/inventario/:id" element={<InventoryDetailPage />} />
            <Route path="activos/inventario/:id/session" element={<InventorySessionPage />} />
            <Route path="activos/inventario/:id/areas/:areaId/review" element={<InventoryAreaReviewPage />} />
            <Route path="prestamos" element={<AdminLoansPage />} />
            <Route path="traslados" element={<AdminTransfersPage />} />
            <Route path="traslados/pendientes" element={<PendingTransfersPage />} />
            <Route path="areas" element={<AreasPage />} />
            <Route path="reportes" element={<AdminReportsPage />} />
            <Route path="notificaciones" element={<AdminNotificationsPage />} />
            <Route path="usuarios" element={<PeopleUsersPage />} />
            <Route path="usuarios/lista-permitida" element={<PeopleWhitelistPage />} />
            <Route path="usuarios/sincronizacion" element={<PeopleSemesterSyncPage />} />
            <Route path="usuarios/:id" element={<PeopleUserDetailPage />} />
            <Route path="usuarios/*" element={<Navigate to="/admin/usuarios" replace />} />
            <Route path="configuracion" element={<AdminSettingsPage />} />
          </Route>
          <Route
            element={
              <ProtectedRoute allowedRoles={["student", "professor", "administrative"]}>
                <SolicitanteLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/catalogo" element={<CatalogoPage />} />
            <Route path="/favoritos" element={<FavoritosPage />} />
            <Route path="/mis-prestamos" element={<PlaceholderPage title="Mis Préstamos" icon={ClipboardList} description="Seguimiento de tus préstamos activos e históricos." />} />
            <Route
              path="/mis-equipos"
              element={
                <ProtectedRoute allowedRoles={["professor", "administrative"]}>
                  <PlaceholderPage title="Mis Equipos" icon={Monitor} description="Equipos asignados a tu nombre." />
                </ProtectedRoute>
              }
            />
            <Route path="/pedido" element={<PlaceholderPage title="Mi Pedido" icon={ShoppingBag} description="Aquí podrás revisar tu pedido y elegir las fechas del préstamo." />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
