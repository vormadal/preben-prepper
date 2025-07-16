'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { InventoryItem } from '@/generated/models';
import { useDeleteInventoryItem, useInventoryItems } from '@/hooks/useApi';
import {
  formatExpirationDate,
  getItemId,
  getItemName,
  getItemQuantity,
  isExpired,
  isExpiringSoon,
  isValidInventoryItem
} from '@/lib/inventory-utils';
import { AlertTriangle, ChevronDown, ChevronRight, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSessionWithHome } from '@/hooks/useSessionWithHome';
import { InventoryForm } from './InventoryForm';

export function InventoryList() {
  const { userId, selectedHomeId, isLoading: sessionLoading, isAuthenticated } = useSessionWithHome();
  
  const { data: items, isLoading, error } = useInventoryItems(userId, selectedHomeId);
  const deleteItem = useDeleteInventoryItem();
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSummaryItems, setExpandedSummaryItems] = useState<Set<string>>(new Set());

  const handleDelete = async (id: number) => {
    await deleteItem.mutateAsync(id);
    setDeletingItemId(null);
  };

  const toggleSummaryItem = (itemName: string) => {
    const newExpanded = new Set(expandedSummaryItems);
    if (newExpanded.has(itemName)) {
      newExpanded.delete(itemName);
    } else {
      newExpanded.add(itemName);
    }
    setExpandedSummaryItems(newExpanded);
  };

  // Group items by name for summary
  const getItemSummary = () => {
    if (!items) return {};
    
    const validItems = items.filter(isValidInventoryItem);
    
    return validItems.reduce((acc, item) => {
      const itemName = getItemName(item);
      
      if (!acc[itemName]) {
        acc[itemName] = {
          totalQuantity: 0,
          items: [],
          expiredCount: 0,
          expiringSoonCount: 0,
        };
      }
      
      acc[itemName].totalQuantity += getItemQuantity(item);
      acc[itemName].items.push(item);
      
      if (isExpired(item.expirationDate)) {
        acc[itemName].expiredCount++;
      } else if (isExpiringSoon(item.expirationDate)) {
        acc[itemName].expiringSoonCount++;
      }
      
      return acc;
    }, {} as Record<string, { totalQuantity: number; items: InventoryItem[]; expiredCount: number; expiringSoonCount: number; }>);
  };

  const itemSummary = getItemSummary();

  // Filter items based on search query
  const filteredSummary = Object.entries(itemSummary).filter(([name]) => 
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading || sessionLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading inventory: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
            <h2 className="text-xl md:text-2xl font-bold">Inventory</h2>
            {items && (
              <span className="text-sm text-muted-foreground">
                ({filteredSummary.length}{searchQuery ? ` of ${Object.keys(itemSummary).length}` : ''} item types)
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search items by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSummary.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            {searchQuery ? (
              <>
                <p>No items found matching "{searchQuery}"</p>
                <p className="text-sm">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <p>No inventory items found</p>
                <p className="text-sm">Get started by adding your first item</p>
              </>
            )}
          </div>
        ) : (
          filteredSummary.map(([name, summary]) => {
            const hasExpired = summary.expiredCount > 0;
            const hasExpiringSoon = summary.expiringSoonCount > 0;
            const isExpanded = expandedSummaryItems.has(name);
            
            return (
              <Card key={name} className={`${hasExpired ? 'bg-red-50 border-red-200' : ''}`}>
                <CardHeader 
                  className="pb-0 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleSummaryItem(name)}
                >
                  <CardTitle className="flex items-center justify-between text-base">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate" title={name}>{name}</span>
                      <div className="ml-2">
                        {hasExpired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : hasExpiringSoon ? (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expires Soon</Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-100 text-green-800">Fresh</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      <span className="font-medium">{summary.totalQuantity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{summary.items.length} batches</span>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="mt-3 space-y-2 border-t pt-3">
                      {summary.items.map((item) => (
                        <div 
                          key={getItemId(item)} 
                          className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItem(item);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-3 w-3" />
                            <span className="font-medium">{getItemQuantity(item)}</span>
                            {isExpired(item.expirationDate) && (
                              <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {formatExpirationDate(item.expirationDate)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingItemId(getItemId(item));
                              }}
                              className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Create New Inventory Item</DialogTitle>
            <DialogDescription>
              Add a new item to your inventory. Multiple items can have the same name 
              (e.g., different batches with different expiration dates).
            </DialogDescription>
          </DialogHeader>
          <InventoryForm
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Edit Inventory Item</DialogTitle>
            <DialogDescription>
              Update the item information. You can modify the name, quantity, and expiration date.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <InventoryForm
              item={editingItem}
              onSuccess={() => setEditingItem(null)}
              onCancel={() => setEditingItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItemId} onOpenChange={() => setDeletingItemId(null)}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeletingItemId(null)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingItemId && handleDelete(deletingItemId)}
              disabled={deleteItem.isPending}
              className="w-full sm:w-auto"
            >
              {deleteItem.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
