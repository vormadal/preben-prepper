'use client';

import { ExpiringItemsWidget } from "@/components/ExpiringItemsWidget";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Settings, AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useInventoryItems } from "@/hooks/useApi";
import { DateOnly } from "@microsoft/kiota-abstractions";

export default function Home() {
  const { data: items } = useInventoryItems();

  const isExpired = (expirationDate: DateOnly | null | undefined) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate.toString());
    const today = new Date();
    return expDate < today;
  };

  const isExpiringSoon = (expirationDate: DateOnly | null | undefined) => {
    if (!expirationDate) return false;
    const expDate = new Date(expirationDate.toString());
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
  };

  const getStats = () => {
    if (!items) return { total: 0, expiring: 0, fresh: 0 };
    
    const total = items.length;
    const expiring = items.filter(item => isExpired(item.expirationDate) || isExpiringSoon(item.expirationDate)).length;
    const fresh = total - expiring;
    
    return { total, expiring, fresh };
  };

  const stats = getStats();
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4 md:py-8 space-y-6 md:space-y-8">
        <header className="text-center space-y-2 md:space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            Preben Prepper
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            Keep track of your items and never let them expire
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <ExpiringItemsWidget />
            
            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-2xl font-bold">{stats.total}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Expiring Soon
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-2xl font-bold">{stats.expiring}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Fresh Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-2xl font-bold">{stats.fresh}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <Link href="/admin">
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link href="/admin#inventory">
                    <Package className="h-4 w-4 mr-2" />
                    Manage Inventory
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
