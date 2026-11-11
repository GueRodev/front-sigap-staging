import { Navigate } from "react-router-dom";
import { useAuthStore, UserRole } from "@/stores/authStore";

interface Props {
  children: React.ReactNode;
  allowedRole?: UserRole;
  allowedRoles?: UserRole[];
}

const ProtectedRoute = ({ children, allowedRole, allowedRoles }: Props) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (allowedRole && user?.role !== allowedRole) return <Navigate to="/" replace />;
  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
