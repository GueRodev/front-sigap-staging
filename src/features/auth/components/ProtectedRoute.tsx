import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore, UserRole } from "@/stores/authStore";
import LoadingOverlay from "@/components/shared/LoadingOverlay";

interface Props {
  children: React.ReactNode;
  allowedRole?: UserRole;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRole, allowedRoles }: Props) => {
  const { status, user, fetchUser } = useAuthStore();

  // Tras recargar la página el store está vacío: se pregunta a Laravel
  // si la cookie de sesión sigue válida antes de expulsar al usuario.
  useEffect(() => {
    if (status === "unknown") void fetchUser();
  }, [status, fetchUser]);

  if (status === "unknown") return <LoadingOverlay isLoading message="Verificando sesión..." />;
  if (status === "guest") return <Navigate to="/" replace />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" replace />;
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
