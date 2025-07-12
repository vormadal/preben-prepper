import { InventoryList } from "@/components/InventoryList";

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <InventoryList />
          </div>
        </div>
      </div>
    </div>
  );
}
