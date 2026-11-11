import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

const data = [
  { day: "Lun", prestamos: 8, traslados: 3 },
  { day: "Mar", prestamos: 12, traslados: 5 },
  { day: "Mié", prestamos: 6, traslados: 2 },
  { day: "Jue", prestamos: 15, traslados: 7 },
  { day: "Vie", prestamos: 10, traslados: 4 },
  { day: "Sáb", prestamos: 3, traslados: 1 },
  { day: "Dom", prestamos: 1, traslados: 0 },
];

const chartConfig: ChartConfig = {
  prestamos: { label: "Préstamos", color: "hsl(var(--sigap-sky))" },
  traslados: { label: "Traslados", color: "hsl(var(--sigap-blue))" },
};

const ActivityChart = () => {
  return (
    <Card className="transition-shadow duration-200 hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Actividad Semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="prestamos"
              stackId="1"
              stroke="var(--color-prestamos)"
              fill="var(--color-prestamos)"
              fillOpacity={0.3}
            />
            <Area
              type="monotone"
              dataKey="traslados"
              stackId="1"
              stroke="var(--color-traslados)"
              fill="var(--color-traslados)"
              fillOpacity={0.2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
