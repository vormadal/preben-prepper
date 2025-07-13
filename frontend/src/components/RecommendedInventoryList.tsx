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
import { RecommendedInventoryItem } from '@/lib/kiota-api-client';
import { useAdminRecommendedInventoryItems, useDeleteRecommendedInventoryItem } from '@/hooks/useApi';
import { AlertTriangle, Calendar, Clock, Package, Plus, Search, Trash2, Edit } from 'lucide-react';
import { useState } from 'react';
import { RecommendedInventoryForm } from './RecommendedInventoryForm';

export function RecommendedInventoryList() {
  const { data: items, isLoading, error } = useAdminRecommendedInventoryItems();
  const deleteItem = useDeleteRecommendedInventoryItem();
  
  const [editingItem, setEditingItem] = useState<RecommendedInventoryItem | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = async (id: number) => {
    await deleteItem.mutateAsync(id);
    setDeletingItemId(null);
  };

  const filteredItems = items?.filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const essentialItems = filteredItems.filter(item => !item.isOptional);
  const optionalItems = filteredItems.filter(item => item.isOptional);

  const formatDuration = (days: number) => {
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.round(days / 30)} months`;
    return `${Math.round(days / 365)} years`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Loading recommended items...</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-red-600">Error loading recommended items</h2>
        </div>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">Failed to load recommended inventory items</p>
            <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Recommended Inventory Items</h2>
          <p className="text-sm text-muted-foreground">
            Manage the recommended items that help users build their prepper stash
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Recommended Item
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search recommended items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{items?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{essentialItems.length}</div>
            <div className="text-sm text-muted-foreground">Essential Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{optionalItems.length}</div>
            <div className="text-sm text-muted-foreground">Optional Items</div>
          </CardContent>
        </Card>
      </div>

      {/* Essential Items */}
      {essentialItems.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Essential Items ({essentialItems.length})
          </h3>
          <div className="grid gap-4">
            {essentialItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-lg">{item.name}</h4>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingItemId(item.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Qty: {item.quantity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDuration(item.expiresIn || 0)}
                        </Badge>
                        <Badge variant="destructive">Essential</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Optional Items */}
      {optionalItems.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-500" />
            Optional Items ({optionalItems.length})
          </h3>
          <div className="grid gap-4">
            {optionalItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-lg">{item.name}</h4>
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeletingItemId(item.id!)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Qty: {item.quantity}
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDuration(item.expiresIn || 0)}
                        </Badge>
                        <Badge variant="secondary">Optional</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No recommended items found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? "No items match your search criteria"
                : "Start by adding some recommended inventory items"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Add First Recommended Item
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Recommended Inventory Item</DialogTitle>
            <DialogDescription>
              Create a new recommended item that will help users build their prepper stash.
            </DialogDescription>
          </DialogHeader>
          <RecommendedInventoryForm 
            onSuccess={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Recommended Inventory Item</DialogTitle>
            <DialogDescription>
              Update the details of this recommended item.
            </DialogDescription>
          </DialogHeader>
          <RecommendedInventoryForm 
            item={editingItem || undefined}
            onSuccess={() => setEditingItem(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deletingItemId} onOpenChange={() => setDeletingItemId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Recommended Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this recommended inventory item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItemId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingItemId && handleDelete(deletingItemId)}
              disabled={deleteItem.isPending}
            >
              {deleteItem.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
