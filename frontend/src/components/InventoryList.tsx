'use client';

import { useState } from 'react';
import { useInventoryItems, useDeleteInventoryItem } from '@/hooks/useApi';
import { InventoryItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { InventoryForm } from './InventoryForm';
import { Edit, Trash2, Plus, Package, AlertTriangle, BarChart3 } from 'lucide-react';

export function InventoryList() {
  const { data: items, isLoading, error } = useInventoryItems();
  const deleteItem = useDeleteInventoryItem();
  
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleDelete = async (id: number) => {
    await deleteItem.mutateAsync(id);
    setDeletingItemId(null);
  };

  const isExpiringSoon = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiration <= 30;
  };

  const isExpired = (expirationDate: string) => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    return expDate < today;
  };

  const getExpirationBadge = (expirationDate: string) => {
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
    return items.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = {
          totalQuantity: 0,
          items: [],
          expiredCount: 0,
          expiringSoonCount: 0,
        };
      }
      acc[item.name].totalQuantity += item.quantity;
      acc[item.name].items.push(item);
      if (isExpired(item.expirationDate)) {
        acc[item.name].expiredCount++;
      } else if (isExpiringSoon(item.expirationDate)) {
        acc[item.name].expiringSoonCount++;
      }
      return acc;
    }, {} as Record<string, { totalQuantity: number; items: InventoryItem[]; expiredCount: number; expiringSoonCount: number; }>);
  };

  const itemSummary = getItemSummary();

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
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Inventory</h2>
            {items && (
              <span className="text-sm text-muted-foreground ml-2">
                ({items.length} items)
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSummary(!showSummary)}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            {showSummary ? 'Hide' : 'Show'} Summary
          </Button>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      {showSummary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(itemSummary).map(([name, summary]) => (
            <div key={name} className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">{name}</h3>
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

      <Table>
        <TableCaption>
          Multiple items can have the same name but different quantities and expiration dates.
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Expiration Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items?.map((item) => (
            <TableRow key={item.id} className={isExpired(item.expirationDate) ? 'bg-red-50' : ''}>
              <TableCell className="font-medium">{item.id}</TableCell>
              <TableCell className="flex items-center gap-2">
                {item.name}
                {isExpired(item.expirationDate) && (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>
                {new Date(item.expirationDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {getExpirationBadge(item.expirationDate)}
              </TableCell>
              <TableCell>
                {new Date(item.createdAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingItemId(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Item Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
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
        <DialogContent>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this inventory item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingItemId(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingItemId && handleDelete(deletingItemId)}
              disabled={deleteItem.isPending}
            >
              {deleteItem.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
