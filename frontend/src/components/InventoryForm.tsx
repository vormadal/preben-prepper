'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateInventoryItem, useUpdateInventoryItem } from '@/hooks/useApi';
import { InventoryItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  quantity: z.number().int().min(0, 'Quantity must be a non-negative integer'),
  expirationDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  }, 'Invalid date format'),
});

type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

interface InventoryFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InventoryForm({ item, onSuccess, onCancel }: InventoryFormProps) {
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  
  const form = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: item?.name || '',
      quantity: item?.quantity || 0,
      expirationDate: item?.expirationDate || '',
    },
  });

  const isEditing = !!item;
  const isLoading = createItem.isPending || updateItem.isPending;

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name,
        quantity: item.quantity,
        expirationDate: item.expirationDate,
      });
    }
  }, [item, form]);

  const onSubmit = async (data: InventoryItemFormData) => {
    try {
      if (isEditing) {
        await updateItem.mutateAsync({ id: item.id, data });
      } else {
        await createItem.mutateAsync(data);
      }
      onSuccess();
      form.reset();
    } catch {
      // Error is handled by the mutation hooks
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter item name (e.g., Rice, Canned Beans)" {...field} />
              </FormControl>
              <FormMessage />
              {!isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: You can add multiple items with the same name for different batches
                </p>
              )}
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0"
                  placeholder="Enter quantity" 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
