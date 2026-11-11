import { defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import systemInfoTool from "./tools/system-info";

export default defineMcp({
  name: "sigap-mcp",
  title: "SIGAP MCP",
  version: "0.1.0",
  instructions:
    "Tools for SIGAP (Sistema Integral de Gestión de Activos y Préstamos). Use `echo` to verify connectivity and `sigap_system_info` to describe the system's modules.",
  tools: [echoTool, systemInfoTool],
});
