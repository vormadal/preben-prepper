import { UserList } from "@/components/UserList";
import { InventoryList } from "@/components/InventoryList";
import { HealthStatus } from "@/components/HealthStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Preben Prepper</h1>
          <p className="text-xl text-muted-foreground">
            Management Dashboard
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Tabs defaultValue="users" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
              </TabsList>
              <TabsContent value="users" className="mt-6">
                <UserList />
              </TabsContent>
              <TabsContent value="inventory" className="mt-6">
                <InventoryList />
              </TabsContent>
            </Tabs>
          </div>
          <div>
            <HealthStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
