'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useRecommendedInventoryItems } from '@/hooks/useApi';
import Link from 'next/link';

export function MinimalRecommendationsNotice() {
  const { data: items, isLoading, error } = useRecommendedInventoryItems();

  // Don't show anything if loading or error
  if (isLoading || error || !items || items.length === 0) {
    return null;
  }

  const essentialItems = items.filter(item => !item.isOptional);
  const totalItems = items.length;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <span className="text-sm font-medium text-amber-800">
          Missing Recommendations
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {essentialItems.length > 0 && (
            <Badge variant="destructive" className="text-xs">
              {essentialItems.length} Essential
            </Badge>
          )}
          {totalItems > essentialItems.length && (
            <Badge variant="secondary" className="text-xs">
              {totalItems - essentialItems.length} Optional
            </Badge>
          )}
        </div>
        
        <Link href="/recommendations">
          <Button variant="outline" size="sm" className="text-xs h-7">
            View All
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
