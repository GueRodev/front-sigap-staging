import { Package, HandHelping, ArrowLeftRight, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Total Activos", value: "1,247", change: "+3.2%", icon: Package, positive: true },
  { label: "Préstamos Activos", value: "38", change: "+12%", icon: HandHelping, positive: true },
  { label: "Traslados del Mes", value: "12", change: "-5%", icon: ArrowLeftRight, positive: false },
  { label: "Solicitudes Pendientes", value: "5", change: "+2", icon: ClipboardList, positive: true },
];

const DashboardStats = () => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="transition-shadow duration-200 hover:shadow-md">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent">
              <stat.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-muted-foreground font-semibold">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className={`text-xs font-medium ${stat.positive ? "text-emerald-500" : "text-destructive"}`}>
                {stat.change}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
