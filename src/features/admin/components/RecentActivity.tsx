import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const activities = [
  { date: "15/04/2026", type: "Préstamo", asset: "Proyector Epson X300", user: "Carlos Méndez", status: "Activo" },
  { date: "14/04/2026", type: "Traslado", asset: "Laptop Dell Lat. 5520", user: "Ana Rojas", status: "Completado" },
  { date: "14/04/2026", type: "Préstamo", asset: "Kit Arduino Mega", user: "Luis Herrera", status: "Pendiente" },
  { date: "13/04/2026", type: "Devolución", asset: "Monitor LG 27\"", user: "María Solano", status: "Completado" },
  { date: "13/04/2026", type: "Préstamo", asset: "Cámara Canon EOS", user: "Pedro Vega", status: "Activo" },
];

const statusClasses = (status: string) => {
  switch (status) {
    case "Activo":
      return "border-sky-100 bg-sky-50 text-sky-700 hover:bg-sky-50";
    case "Completado":
      return "border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50";
    case "Pendiente":
      return "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-50";
    default:
      return "";
  }
};

const RecentActivity = () => {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((a, i) => (
              <TableRow key={i}>
                <TableCell className="text-xs text-muted-foreground">{a.date}</TableCell>
                <TableCell className="text-xs font-medium">{a.type}</TableCell>
                <TableCell className="text-xs">{a.asset}</TableCell>
                <TableCell className="text-xs">{a.user}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("text-[10px] font-medium", statusClasses(a.status))}>
                    {a.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
