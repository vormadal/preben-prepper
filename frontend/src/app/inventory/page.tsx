import { InventoryList } from "@/components/InventoryList";
import { MinimalRecommendationsNotice } from "@/components/MinimalRecommendationsNotice";

export default function Inventory() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your emergency supplies and add recommended items to your stash
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-6">
          {/* Main Inventory List */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <InventoryList />
          </div>
          
          {/* Minimal Recommendations Notice */}
          <div className="order-1 lg:order-2">
            <MinimalRecommendationsNotice />
          </div>
        </div>
      </div>
    </div>
  );
}
