import type { AllowedUser } from "../types/user.types";

export const mockWhitelist: AllowedUser[] = [
  { id: 1, email: "maria.gonzalez@ucr.ac.cr", baseRole: "administrative", addedById: 1, addedByName: "Admin SIGAP", registeredAt: "2026-01-15T08:00:00Z", createdAt: "2026-01-10T08:00:00Z" },
  { id: 2, email: "carlos.jimenez@ucr.ac.cr", baseRole: "professor", addedById: 1, addedByName: "Admin SIGAP", registeredAt: "2026-01-20T08:00:00Z", createdAt: "2026-01-10T08:00:00Z" },
  { id: 3, email: "ana.solano@ucr.ac.cr", baseRole: "student", addedById: 1, addedByName: "Admin SIGAP", registeredAt: null, createdAt: "2026-02-01T08:00:00Z" },
  { id: 4, email: "pedro.rojas@ucr.ac.cr", baseRole: "administrative", addedById: 1, addedByName: "Admin SIGAP", registeredAt: "2026-02-10T08:00:00Z", createdAt: "2026-02-05T08:00:00Z" },
  { id: 5, email: "julia.mora@ucr.ac.cr", baseRole: "administrative", addedById: 1, addedByName: "Admin SIGAP", registeredAt: null, createdAt: "2026-03-01T08:00:00Z" },
  { id: 6, email: "andres.vargas@ucr.ac.cr", baseRole: "student", addedById: 1, addedByName: "Admin SIGAP", registeredAt: "2026-03-15T08:00:00Z", createdAt: "2026-03-10T08:00:00Z" },
  { id: 7, email: "laura.campos@ucr.ac.cr", baseRole: "professor", addedById: 1, addedByName: "Admin SIGAP", registeredAt: null, createdAt: "2026-04-01T08:00:00Z" },
  { id: 8, email: "esteban.mendez@ucr.ac.cr", baseRole: "administrative", addedById: 1, addedByName: "Admin SIGAP", registeredAt: "2026-04-12T08:00:00Z", createdAt: "2026-04-05T08:00:00Z" },
  { id: 9, email: "sofia.araya@ucr.ac.cr", baseRole: "student", addedById: 1, addedByName: "Admin SIGAP", registeredAt: null, createdAt: "2026-05-03T08:00:00Z" },
  { id: 10, email: "ricardo.nunez@ucr.ac.cr", baseRole: "professor", addedById: 1, addedByName: "Admin SIGAP", registeredAt: "2026-05-20T08:00:00Z", createdAt: "2026-05-12T08:00:00Z" },
];