"use client";

import { Header } from "@/components/Header";
import { InventoryForm } from "@/components/InventoryForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useCreateInventoryFromRecommendation,
    useInventoryItems,
    useRecommendedInventoryItems,
} from "@/hooks/useApi";
import { InventoryItem, RecommendedInventoryItem } from "@/lib/kiota-api-client";
import { DateOnly } from "@microsoft/kiota-abstractions";
import {
    AlertCircle,
    CheckCircle,
    Clock,
    Package,
    Plus,
    XCircle
} from "lucide-react";
import { useState } from "react";
import { useSessionWithHome } from "@/hooks/useSessionWithHome";

export default function RecommendationsPage() {
  const { userId, selectedHomeId } = useSessionWithHome();
  
  const { data: inventoryItems } = useInventoryItems(selectedHomeId!, userId);
  const { data: recommendedItems, isLoading } = useRecommendedInventoryItems();
  const createFromRecommendation = useCreateInventoryFromRecommendation();
  const [activeTab, setActiveTab] = useState("unfollowed");
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<RecommendedInventoryItem | null>(null);

  const getRecommendationStatus = () => {
    if (!inventoryItems || !recommendedItems) {
      return { unfollowed: [], followed: [] };
    }

    // Create a set of inventory item names for quick lookup (case-insensitive)
    const inventoryNames = new Set(
      inventoryItems
        .map((item) => item.name?.toLowerCase().trim())
        .filter(Boolean)
    );

    const unfollowed: RecommendedInventoryItem[] = [];
    const followed: RecommendedInventoryItem[] = [];

    recommendedItems.forEach((recommended) => {
      const recommendedName = recommended.name?.toLowerCase().trim();
      if (recommendedName && inventoryNames.has(recommendedName)) {
        followed.push(recommended);
      } else {
        unfollowed.push(recommended);
      }
    });

    return { unfollowed, followed };
  };

  const { unfollowed, followed } = getRecommendationStatus();

  const formatDuration = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  const handleAddToInventory = async (item: RecommendedInventoryItem) => {
    if (!item.id) return;
    setSelectedRecommendation(item);
    setIsFormDialogOpen(true);
  };

  // Convert recommendation to inventory item for form pre-population
  const createInventoryItemFromRecommendation = (recommendation: RecommendedInventoryItem): InventoryItem => {
    // Calculate expiration date based on expiresIn days
    let expirationDate: DateOnly | null = null;
    if (recommendation.expiresIn) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + recommendation.expiresIn);
      expirationDate = new DateOnly({
        year: futureDate.getFullYear(),
        month: futureDate.getMonth() + 1,
        day: futureDate.getDate(),
      });
    }

    return {
      name: recommendation.name || "",
      quantity: recommendation.quantity || 1,
      expirationDate: expirationDate,
      additionalData: {},
    };
  };

  const RecommendationCard = ({
    item,
    isFollowed = false,
  }: {
    item: RecommendedInventoryItem;
    isFollowed?: boolean;
  }) => (
    <Card key={item.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            {isFollowed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-orange-500" />
            )}
            {item.name}
          </CardTitle>
          <div className="flex items-center gap-2">
            {item.isOptional && (
              <Badge variant="secondary" className="text-xs">
                Optional
              </Badge>
            )}
            <Badge
              variant={isFollowed ? "default" : "destructive"}
              className="text-xs"
            >
              {isFollowed ? "Following" : "Not Following"}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {item.description && (
          <p className="text-muted-foreground text-sm">{item.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <span>Qty: {item.quantity || "N/A"}</span>
          </div>
          {item.expiresIn && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Expires: {formatDuration(item.expiresIn)}</span>
            </div>
          )}
        </div>

        {!isFollowed && (
          <Button
            onClick={() => handleAddToInventory(item)}
            disabled={createFromRecommendation.isPending}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            {createFromRecommendation.isPending
              ? "Adding..."
              : "Add to Inventory"}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Recommendations Status</h1>
              <p className="text-muted-foreground">
                Track which recommended items you have in your inventory
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 md:grid-cols-3 gap-1">
            <Card>
              <CardContent className="pt-1">
                <Package className="h-8 w-8 text-blue-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {recommendedItems?.length || 0}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-1">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {followed.length}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Following
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-1">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-orange-600">
                      {unfollowed.length}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground">
                      Not Following
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="unfollowed"
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Not Following ({unfollowed.length})
              </TabsTrigger>
              <TabsTrigger value="followed" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Following ({followed.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="unfollowed" className="space-y-4">
              {unfollowed.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">All Caught Up!</h3>
                    <p className="text-muted-foreground">
                      You're following all the recommended items.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unfollowed.map((item) => (
                    <RecommendationCard
                      key={item.id}
                      item={item}
                      isFollowed={false}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="followed" className="space-y-4">
              {followed.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">
                      No Items Following
                    </h3>
                    <p className="text-muted-foreground">
                      Start following recommended items by adding them to your
                      inventory.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followed.map((item) => (
                    <RecommendationCard
                      key={item.id}
                      item={item}
                      isFollowed={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add to Inventory Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Add to Inventory</DialogTitle>
            <DialogDescription>
              Add this recommended item to your inventory. You can adjust the details before saving.
            </DialogDescription>
          </DialogHeader>
          {selectedRecommendation && (
            <InventoryForm
              item={createInventoryItemFromRecommendation(selectedRecommendation)}
              onSuccess={() => {
                setIsFormDialogOpen(false);
                setSelectedRecommendation(null);
              }}
              onCancel={() => {
                setIsFormDialogOpen(false);
                setSelectedRecommendation(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
