import { ChangeEvent } from "react";
import { CheckCircle2, FileSpreadsheet, RefreshCw, UploadCloud } from "lucide-react";

import PageHeader from "@/components/shared/PageHeader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

import BaseRoleBadge from "../components/BaseRoleBadge";
import { useSyncWizard } from "../hooks/useSyncWizard";

const actionLabel = {
  create: "Crear",
  update: "Actualizar",
  skip: "Omitir",
};

const PeopleSemesterSyncPage = () => {
  const wizard = useSyncWizard();
  const progress = wizard.step === 1 ? 33 : wizard.step === 2 ? 66 : 100;

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void wizard.uploadFile(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sincronización semestral"
        description="Prototipo para cargar padrones institucionales y previsualizar cambios antes de aplicarlos."
        icon={RefreshCw}
      />

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Progreso</CardTitle>
          <CardDescription>Carga, revisión y confirmación de datos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={progress} />
          <div className="grid gap-2 text-sm font-semibold text-muted-foreground md:grid-cols-3">
            <span className={wizard.step >= 1 ? "text-sidebar" : undefined}>1. Cargar archivo</span>
            <span className={wizard.step >= 2 ? "text-sidebar" : undefined}>2. Revisar previsualización</span>
            <span className={wizard.step >= 3 ? "text-sidebar" : undefined}>3. Confirmar sincronización</span>
          </div>
        </CardContent>
      </Card>

      {wizard.step === 1 && (
        <Card className="border-dashed border-slate-300 bg-[hsl(var(--sigap-sky)/0.18)]">
          <CardContent className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background text-primary shadow-sm"><UploadCloud className="h-7 w-7" /></div>
            <div>
              <h2 className="font-display text-xl font-semibold text-sidebar">Cargar padrón semestral</h2>
              <p className="mt-1 text-sm text-muted-foreground">Selecciona un archivo CSV o XLSX exportado desde el sistema institucional.</p>
            </div>
            <label className="inline-flex cursor-pointer items-center rounded-md bg-sidebar px-4 py-2 text-sm font-semibold text-sidebar-foreground transition-colors hover:bg-sidebar/90">
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Seleccionar archivo
              <input type="file" accept=".csv,.xlsx" className="sr-only" onChange={handleFile} disabled={wizard.isPending} />
            </label>
          </CardContent>
        </Card>
      )}

      {wizard.step === 2 && (
        <div className="space-y-4">
          <Alert className="border-sigap-sky/30 bg-sigap-sky/10">
            <FileSpreadsheet className="h-4 w-4" />
            <AlertTitle>Archivo analizado: {wizard.fileName}</AlertTitle>
            <AlertDescription>Esta es una previsualización mock. La API deberá validar estructura, duplicados y permisos reales.</AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200"><CardContent className="p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Crear</p><p className="mt-2 font-display text-2xl font-bold text-emerald-700">{wizard.stats.create}</p></CardContent></Card>
            <Card className="border-slate-200"><CardContent className="p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Actualizar</p><p className="mt-2 font-display text-2xl font-bold text-primary">{wizard.stats.update}</p></CardContent></Card>
            <Card className="border-slate-200"><CardContent className="p-4"><p className="text-xs font-semibold uppercase text-muted-foreground">Omitir</p><p className="mt-2 font-display text-2xl font-bold text-muted-foreground">{wizard.stats.skip}</p></CardContent></Card>
          </div>

          <Card className="overflow-hidden border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-[hsl(var(--sigap-sky)/0.18)] hover:bg-[hsl(var(--sigap-sky)/0.18)]">
                  <TableHead>Email</TableHead><TableHead>Rol base</TableHead><TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wizard.rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-[hsl(var(--sigap-sky)/0.18)]">
                    <TableCell className="font-semibold">{row.email}</TableCell>
                    <TableCell><BaseRoleBadge role={row.baseRole} /></TableCell>
                    <TableCell><Badge variant={row.action === "skip" ? "secondary" : "outline"}>{actionLabel[row.action]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="border-slate-300" onClick={wizard.reset}>Cancelar</Button>
            <Button className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90" onClick={() => void wizard.confirmSync().then(() => toast({ title: "Sincronización completada", description: "Los cambios mock fueron aplicados correctamente." }))} disabled={wizard.isPending}>Confirmar sincronización</Button>
          </div>
        </div>
      )}

      {wizard.step === 3 && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="flex items-start gap-4 p-6">
            <CheckCircle2 className="mt-1 h-6 w-6 text-emerald-600" />
            <div>
              <h2 className="font-display text-xl font-semibold text-emerald-800">Sincronización finalizada</h2>
              <p className="mt-1 text-sm text-emerald-700">El flujo quedó listo para conectarse con endpoints reales de importación semestral.</p>
              <Button className="mt-4 bg-sidebar text-sidebar-foreground hover:bg-sidebar/90" onClick={wizard.reset}>Nueva sincronización</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PeopleSemesterSyncPage;