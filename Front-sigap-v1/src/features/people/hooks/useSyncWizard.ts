import { useMemo, useState } from "react";

import type { BaseRole } from "../types/user.types";

export interface SyncPreviewRow {
  id: number;
  email: string;
  baseRole: BaseRole;
  action: "create" | "update" | "skip";
}

const sampleRows: SyncPreviewRow[] = [
  { id: 1, email: "nuevo.estudiante@ucr.ac.cr", baseRole: "student", action: "create" },
  { id: 2, email: "carlos.jimenez@ucr.ac.cr", baseRole: "professor", action: "skip" },
  { id: 3, email: "coordinacion.alajuela@ucr.ac.cr", baseRole: "administrative", action: "update" },
];

export const useSyncWizard = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [completed, setCompleted] = useState(false);

  const stats = useMemo(
    () => ({
      create: sampleRows.filter((row) => row.action === "create").length,
      update: sampleRows.filter((row) => row.action === "update").length,
      skip: sampleRows.filter((row) => row.action === "skip").length,
    }),
    [],
  );

  const uploadFile = async (file: File) => {
    // TODO: conectar API para cargar archivo de padrón semestral y generar previsualización.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    setFileName(file.name);
    setIsPending(false);
    setStep(2);
  };

  const confirmSync = async () => {
    // TODO: conectar API para confirmar sincronización semestral de personas.
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 350));
    setCompleted(true);
    setIsPending(false);
    setStep(3);
  };

  const reset = () => {
    setStep(1);
    setFileName(null);
    setCompleted(false);
  };

  return { step, fileName, rows: sampleRows, stats, isPending, completed, uploadFile, confirmSync, reset, setStep };
};