import DashboardStats from "@/features/admin/components/DashboardStats";
import ActivityChart from "@/features/admin/components/ActivityChart";
import TopAssets from "@/features/admin/components/TopAssets";
import RecentActivity from "@/features/admin/components/RecentActivity";

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Resumen general del sistema de activos</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityChart />
        <TopAssets />
      </div>

      <RecentActivity />
    </div>
  );
};

export default AdminDashboardPage;
