"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateInventoryItem, useUpdateInventoryItem, useHomes } from "@/hooks/useApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { InventoryItem } from "@/generated/models";
import { DateOnly } from "@microsoft/kiota-abstractions";
import { useSessionWithHome } from "@/hooks/useSessionWithHome";

const inventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().int().min(0, "Quantity must be a non-negative integer"),
  expirationDate: z.string().min(1, "Expiration date is required"),
});

type InventoryItemFormData = z.infer<typeof inventoryItemSchema>;

// Helper function to convert string date to DateOnly
const convertToDateOnly = (dateString: string): DateOnly => {
  const date = new Date(dateString);
  return new DateOnly({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
};

// Helper function to convert DateOnly to string for form input
const convertDateOnlyToString = (dateOnly?: DateOnly | null): string => {
  if (!dateOnly) return "";
  const year = dateOnly.year.toString();
  const month = dateOnly.month.toString().padStart(2, "0");
  const day = dateOnly.day.toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

interface InventoryFormProps {
  item?: InventoryItem;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InventoryForm({
  item,
  onSuccess,
  onCancel,
}: InventoryFormProps) {
  const { userId, selectedHomeId, isAuthenticated } = useSessionWithHome();
  
  const createItem = useCreateInventoryItem();
  const updateItem = useUpdateInventoryItem();
  const { data: homes } = useHomes(userId || 0);

  const form = useForm<InventoryItemFormData>({
    resolver: zodResolver(inventoryItemSchema),
    defaultValues: {
      name: item?.name || "",
      quantity: item?.quantity || 0,
      expirationDate: convertDateOnlyToString(item?.expirationDate),
    },
  });

  const isEditing = !!item?.id;
  const isLoading = createItem.isPending || updateItem.isPending;

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name || "",
        quantity: item.quantity || 0,
        expirationDate: convertDateOnlyToString(item.expirationDate),
      });
    }
  }, [item, form]);

  // Show loading if session or homes are not loaded
  if (!isAuthenticated || !userId) {
    return <div>Loading...</div>;
  }

  // If we have a selected home, use it; otherwise fall back to the first home
  const targetHomeId = selectedHomeId || homes?.[0]?.id;

  const onSubmit = async (data: InventoryItemFormData) => {
    try {
      if (!userId || !targetHomeId) {
        throw new Error("User or home not available");
      }

      // Convert form data to API format
      const apiData = {
        name: data.name,
        quantity: data.quantity,
        expirationDate: convertToDateOnly(data.expirationDate),
        userId,
      };

      if (isEditing && item?.id) {
        await updateItem.mutateAsync({ 
          homeId: targetHomeId, 
          id: item.id, 
          userId, 
          data: apiData 
        });
      } else {
        await createItem.mutateAsync({ 
          homeId: targetHomeId, 
          data: apiData 
        });
      }
      onSuccess();
      form.reset();
    } catch {
      // Error is handled by the mutation hooks
    }
  };

  if (!targetHomeId) {
    return (
      <div className="text-center py-4">
        <p className="text-red-600 mb-2">No homes found.</p>
        <p className="text-sm text-muted-foreground">
          Please create a home first to add inventory items.
        </p>
      </div>
    );
  }

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
                <Input
                  placeholder="Enter item name (e.g., Rice, Canned Beans)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              {!isEditing && (
                <p className="text-xs text-muted-foreground mt-1">
                  Tip: You can add multiple items with the same name for
                  different batches
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
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || 0)
                  }
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
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Item"
              : "Create Item"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
