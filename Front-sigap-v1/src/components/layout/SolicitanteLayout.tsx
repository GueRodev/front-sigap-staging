import { Outlet, useLocation } from "react-router-dom";
import SolicitanteNavbar from "./SolicitanteNavbar";

/** Layout del solicitante: navbar superior + contenido. */
const SolicitanteLayout = () => {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <SolicitanteNavbar />
      {/* key por ruta: re-monta el contenido para que la animación de entrada se repita al navegar */}
      <main key={pathname} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default SolicitanteLayout;
