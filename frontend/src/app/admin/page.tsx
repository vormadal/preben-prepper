import { UserList } from "@/components/UserList";
import { InventoryList } from "@/components/InventoryList";
import { HealthStatus } from "@/components/HealthStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        <header className="text-center space-y-2 md:space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Preben Prepper</h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Management Dashboard
          </p>
        </header>

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 md:gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="users" className="text-sm md:text-base">Users</TabsTrigger>
                <TabsTrigger value="inventory" className="text-sm md:text-base">Inventory</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-4 md:mt-6">
                <UserList />
              </TabsContent>
              <TabsContent value="inventory" className="mt-4 md:mt-6">
                <InventoryList />
              </TabsContent>
            </Tabs>
          </div>
          <div className="order-1 lg:order-2">
            <HealthStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
