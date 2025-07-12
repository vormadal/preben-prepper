"use client";

import { useInventoryItems } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, RefreshCw, Plus } from "lucide-react";
import Link from "next/link";
import { DateOnly } from "@microsoft/kiota-abstractions";
import { InventoryItem } from "@/generated/models";

export function ExpiringItemsWidget() {
  const { data: items, isLoading, error, refetch } = useInventoryItems();

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
    const daysUntilExpiration = Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiration <= 30 && daysUntilExpiration >= 0;
  };

  const getDaysUntilExpiration = (
    expirationDate: DateOnly | null | undefined
  ) => {
    if (!expirationDate) return 0;
    const expDate = new Date(expirationDate.toString());
    const today = new Date();
    return Math.ceil(
      (expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const getExpirationBadge = (expirationDate: DateOnly | null | undefined) => {
    if (isExpired(expirationDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isExpiringSoon(expirationDate)) {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          Expires Soon
        </Badge>
      );
    }
    return (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Fresh
      </Badge>
    );
  };

  const getExpiringItems = () => {
    if (!items) return [];
    return items
      .filter(
        (item) =>
          isExpired(item.expirationDate) || isExpiringSoon(item.expirationDate)
      )
      .sort((a, b) => {
        const daysA = getDaysUntilExpiration(a.expirationDate);
        const daysB = getDaysUntilExpiration(b.expirationDate);
        return daysA - daysB;
      });
  };

  const expiringItems = getExpiringItems();

  const ExpiringItemCard = ({ item }: { item: InventoryItem }) => {
    const daysUntilExpiration = getDaysUntilExpiration(item.expirationDate);
    const expired = isExpired(item.expirationDate);

    return (
      <Card
        className={`${
          expired
            ? "bg-red-50 border-red-200"
            : "bg-yellow-50 border-yellow-200"
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-base">{item.name}</h3>
                {expired && (
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                <div>
                  <span className="font-medium">Quantity:</span> {item.quantity}
                </div>
                <div>
                  <span className="font-medium">Expires:</span>{" "}
                  {item.expirationDate
                    ? new Date(
                        item.expirationDate.toString()
                      ).toLocaleDateString()
                    : "N/A"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getExpirationBadge(item.expirationDate)}
                <span className="text-sm text-muted-foreground">
                  {expired
                    ? `Expired ${Math.abs(daysUntilExpiration)} days ago`
                    : `${daysUntilExpiration} days remaining`}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Items Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Items Expiring Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-red-600">
              Error loading inventory: {error.message}
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Items Expiring Soon
            {expiringItems.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({expiringItems.length} items)
              </span>
            )}
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {expiringItems.length === 0 ? (
          <div className="text-center py-8 space-y-4">
            <Package className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-lg font-medium">All items are fresh!</p>
              <p className="text-sm text-muted-foreground">
                No items are expiring in the next 30 days
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/inventory">
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {expiringItems.map((item) => (
              <ExpiringItemCard key={item.id} item={item} />
            ))}
            <div className="pt-4 border-t">
              <Button asChild variant="outline" className="w-full">
                <Link href="/inventory">View All Items</Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
