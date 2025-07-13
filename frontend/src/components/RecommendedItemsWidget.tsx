'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RecommendedInventoryItem } from '@/lib/kiota-api-client';
import { useRecommendedInventoryItems, useCreateInventoryFromRecommendation } from '@/hooks/useApi';
import { Calendar, Package, Plus, ShoppingCart, AlertTriangle, Clock } from 'lucide-react';
import { useState } from 'react';

export function RecommendedItemsWidget() {
  const { data: items, isLoading, error } = useRecommendedInventoryItems();
  const createFromRecommendation = useCreateInventoryFromRecommendation();
  const [showOptional, setShowOptional] = useState(false);

  const filteredItems = items?.filter(item => showOptional || !item.isOptional) || [];
  const essentialItems = items?.filter(item => !item.isOptional) || [];
  const optionalItems = items?.filter(item => item.isOptional) || [];

  const formatDuration = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  const handleAddToInventory = async (item: RecommendedInventoryItem) => {
    if (!item.id) return;
    try {
      await createFromRecommendation.mutateAsync({ id: item.id });
    } catch (error) {
      console.error("Failed to add item to inventory:", error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Recommended Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
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
            <ShoppingCart className="w-5 h-5" />
            Recommended Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Recommended Items
        </CardTitle>
        <div className="flex gap-2 mt-2">
          <Button
            variant={!showOptional ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOptional(false)}
            className="flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            Essential ({essentialItems.length})
          </Button>
          <Button
            variant={showOptional ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOptional(true)}
            className="flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            All Items ({items?.length || 0})
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {filteredItems.length === 0 ? (
          <div className="text-center py-4">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">No recommended items available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.slice(0, 5).map((item) => (
              <div key={item.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{item.name}</h4>
                  <Badge variant={item.isOptional ? "secondary" : "destructive"} className="text-xs">
                    {item.isOptional ? "Optional" : "Essential"}
                  </Badge>
                </div>
                
                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {item.quantity}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDuration(item.expiresIn || 0)}
                    </Badge>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToInventory(item)}
                    disabled={createFromRecommendation.isPending}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </Button>
                </div>
              </div>
            ))}
            
            {filteredItems.length > 5 && (
              <p className="text-center text-sm text-gray-500">
                And {filteredItems.length - 5} more items...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
