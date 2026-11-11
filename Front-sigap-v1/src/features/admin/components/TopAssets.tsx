import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const assets = [
  { name: "Proyector Epson X300", category: "Audiovisual", loans: 24, status: "Disponible" },
  { name: "Laptop Dell Lat. 5520", category: "Cómputo", loans: 19, status: "En préstamo" },
  { name: "Kit Arduino Mega", category: "Electrónica", loans: 17, status: "Disponible" },
  { name: "Cámara Canon EOS R50", category: "Audiovisual", loans: 15, status: "Mantenimiento" },
  { name: "Multímetro Fluke 117", category: "Instrumentación", loans: 12, status: "Desechado" },
];

type StatusStyle = {
  dot: string;
  pill: string;
  text: string;
};

const statusStyles: Record<string, StatusStyle> = {
  Disponible: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 border-emerald-100",
    text: "text-emerald-700",
  },
  "En préstamo": {
    dot: "bg-sky-500",
    pill: "bg-sky-50 border-sky-100",
    text: "text-sky-700",
  },
  Mantenimiento: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 border-amber-100",
    text: "text-amber-700",
  },
  Desechado: {
    dot: "bg-rose-500",
    pill: "bg-rose-50 border-rose-100",
    text: "text-rose-700",
  },
};

const StatusPill = ({ status }: { status: string }) => {
  const style = statusStyles[status] ?? statusStyles.Disponible;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        style.pill,
        style.text,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
      {status}
    </span>
  );
};

const TopAssets = () => {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Activos Más Solicitados</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Activo</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead className="text-center">Préstamos</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((a, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs font-semibold">{a.name}</TableCell>
                <TableCell className="text-xs text-muted-foreground font-semibold">{a.category}</TableCell>
                <TableCell className="text-center text-xs font-semibold">{a.loans}</TableCell>
                <TableCell>
                  <StatusPill status={a.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopAssets;
