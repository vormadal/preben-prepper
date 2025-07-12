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
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InventoryItem } from '@/generated/models';
import { useDeleteInventoryItem, useInventoryItems } from '@/hooks/useApi';
import {
  formatCreatedAt,
  formatExpirationDate,
  getItemId,
  getItemName,
  getItemQuantity,
  isExpired,
  isExpiringSoon,
  isValidInventoryItem
} from '@/lib/inventory-utils';
import { DateOnly } from '@microsoft/kiota-abstractions';
import { AlertTriangle, BarChart3, Edit, Package, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { InventoryForm } from './InventoryForm';

export function InventoryList() {
  const { data: items, isLoading, error } = useInventoryItems();
  const deleteItem = useDeleteInventoryItem();
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: number) => {
    await deleteItem.mutateAsync(id);
    setDeletingItemId(null);
  };

  const getExpirationBadge = (expirationDate: DateOnly | null | undefined) => {
    if (isExpired(expirationDate)) {
      return <Badge variant="destructive">Expired</Badge>;
    } else if (isExpiringSoon(expirationDate)) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Expires Soon</Badge>;
    }
    return <Badge variant="default" className="bg-green-100 text-green-800">Fresh</Badge>;
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

  // Filter items based on search query
  const filteredItems = items?.filter(item => 
    getItemName(item).toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const itemSummary = getItemSummary();

  // Mobile card component for inventory items
  const MobileInventoryCard = ({ item }: { item: InventoryItem }) => (
    <Card 
      className={`${isExpired(item.expirationDate) ? 'bg-red-50 border-red-200' : ''} cursor-pointer hover:shadow-md transition-shadow`}
      onClick={() => setEditingItem(item)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="truncate">{getItemName(item)}</span>
            <div className="ml-2">
              {getExpirationBadge(item.expirationDate)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="lg"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingItemId(getItemId(item));
            }}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium">Quantity</p>
            <p className="text-lg font-semibold">{getItemQuantity(item)}</p>
          </div>
          <div>
            <p className="font-medium">Expiration Date</p>
            <p className="text-muted-foreground">
              {formatExpirationDate(item.expirationDate)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
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
                ({filteredItems.length}{searchQuery ? ` of ${items.length}` : ''} items)
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(!showSummary)}
            className="w-full sm:w-auto"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showSummary ? 'Hide' : 'Show'} Summary
          </Button>
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

      {showSummary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(itemSummary).map(([name, summary]) => (
            <div key={name} className="p-4 border rounded-lg">
              <h3 className="font-semibold text-base md:text-lg mb-2 truncate" title={name}>
                {name}
              </h3>
              <div className="space-y-1 text-sm">
                <p>Total Quantity: <span className="font-medium">{summary.totalQuantity}</span></p>
                <p>Batches: <span className="font-medium">{summary.items.length}</span></p>
                {summary.expiredCount > 0 && (
                  <p className="text-red-600">
                    Expired: <span className="font-medium">{summary.expiredCount}</span>
                  </p>
                )}
                {summary.expiringSoonCount > 0 && (
                  <p className="text-yellow-600">
                    Expiring Soon: <span className="font-medium">{summary.expiringSoonCount}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Multiple items can have the same name but different quantities and expiration dates.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead className="min-w-[120px]">Name</TableHead>
                <TableHead className="min-w-[80px]">Quantity</TableHead>
                <TableHead className="min-w-[120px]">Expiration Date</TableHead>
                <TableHead className="min-w-[100px]">Status</TableHead>
                <TableHead className="min-w-[120px]">Created At</TableHead>
                <TableHead className="text-right min-w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems?.map((item) => (
                <TableRow key={getItemId(item)} className={isExpired(item.expirationDate) ? 'bg-red-50' : ''}>
                  <TableCell className="font-medium">{getItemId(item)}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="truncate max-w-[100px]" title={getItemName(item)}>
                        {getItemName(item)}
                      </span>
                      {isExpired(item.expirationDate) && (
                        <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{getItemQuantity(item)}</TableCell>
                  <TableCell className="text-sm">
                    {formatExpirationDate(item.expirationDate)}
                  </TableCell>
                  <TableCell>
                    {getExpirationBadge(item.expirationDate)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatCreatedAt(item.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingItem(item)}
                        className="h-9 w-9 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingItemId(getItemId(item))}
                        className="h-9 w-9 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredItems?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
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
          filteredItems?.map((item) => (
            <MobileInventoryCard key={getItemId(item)} item={item} />
          ))
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
