import { HealthStatus } from "@/components/HealthStatus";
import { RecommendedInventoryList } from "@/components/RecommendedInventoryList";

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage recommended inventory items and monitor system health
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-6">
          {/* Health Status - Right Column on Desktop */}
          <div className="order-1 lg:order-2">
            <HealthStatus />
          </div>

          {/* Recommended Inventory Management - Left Column on Desktop */}
          <div className="order-2 lg:order-1 lg:col-span-3">
            <RecommendedInventoryList />
          </div>
        </div>
      </div>
    </div>
  );
}
