import { isAxiosError } from "axios";

/** Traduce la respuesta de error de Laravel a un mensaje para el usuario. */
export const getAuthErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) return "Ocurrió un error inesperado.";

  const status = error.response?.status;
  if (!error.response) return "No se pudo conectar con el servidor.";
  if (status === 422) return "Credenciales inválidas.";
  if (status === 429) return "Demasiados intentos. Espera un minuto e inténtalo de nuevo.";
  if (status === 419) return "La sesión expiró. Recarga la página e inténtalo de nuevo.";
  return "No se pudo iniciar sesión. Inténtalo de nuevo.";
};
