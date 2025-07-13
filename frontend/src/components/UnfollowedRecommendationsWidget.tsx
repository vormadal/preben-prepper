'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useInventoryItems, useRecommendedInventoryItems } from '@/hooks/useApi';

export function UnfollowedRecommendationsWidget() {
  const { data: inventoryItems } = useInventoryItems();
  const { data: recommendedItems, isLoading } = useRecommendedInventoryItems();

  const getUnfollowedRecommendations = () => {
    if (!inventoryItems || !recommendedItems) return [];

    // Create a set of inventory item names for quick lookup (case-insensitive)
    const inventoryNames = new Set(
      inventoryItems.map(item => item.name?.toLowerCase().trim()).filter(Boolean)
    );

    // Filter recommended items that don't have a corresponding inventory item
    return recommendedItems.filter(recommended => {
      const recommendedName = recommended.name?.toLowerCase().trim();
      return recommendedName && !inventoryNames.has(recommendedName);
    });
  };

  const unfollowedRecommendations = getUnfollowedRecommendations();
  const unfollowedCount = unfollowedRecommendations.length;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unfollowed Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <Link href="/recommendations" className="block">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Unfollowed Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className={`h-4 w-4 ${unfollowedCount > 0 ? 'text-orange-500' : 'text-green-500'}`} />
              <span className="text-2xl font-bold">{unfollowedCount}</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
          {unfollowedCount > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Click to see details
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
