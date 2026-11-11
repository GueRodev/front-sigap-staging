import { defineTool } from "@lovable.dev/mcp-js";

export default defineTool({
  name: "sigap_system_info",
  title: "SIGAP system info",
  description:
    "Return high-level information about the SIGAP (Sistema Integral de Gestión de Activos y Préstamos) system, including available modules.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const info = {
      name: "SIGAP",
      fullName: "Sistema Integral de Gestión de Activos y Préstamos",
      description:
        "Sistema para la gestión de activos institucionales, préstamos, traslados y usuarios de la UCR.",
      modules: [
        "Activos (registro, categorías, inventario)",
        "Préstamos",
        "Traslados",
        "Áreas",
        "Reportes",
        "Notificaciones",
        "Usuarios (registrados, lista permitida, sincronización)",
      ],
      roles: ["super_admin", "student", "professor", "administrative"],
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
      structuredContent: info,
    };
  },
});
