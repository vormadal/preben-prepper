"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateRecommendedInventoryItem, useUpdateRecommendedInventoryItem } from "@/hooks/useApi";
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
import { RecommendedInventoryItem } from "@/lib/kiota-api-client";

const recommendedInventoryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  expiresIn: z.number().int().min(1, "Expires in must be at least 1 day"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  isOptional: z.boolean(),
  description: z.string().min(1, "Description is required").max(1000, "Description must be less than 1000 characters"),
});

type RecommendedInventoryItemFormData = z.infer<typeof recommendedInventoryItemSchema>;

interface RecommendedInventoryFormProps {
  item?: RecommendedInventoryItem;
  onSuccess: () => void;
}

export function RecommendedInventoryForm({ item, onSuccess }: RecommendedInventoryFormProps) {
  const createItem = useCreateRecommendedInventoryItem();
  const updateItem = useUpdateRecommendedInventoryItem();
  
  const form = useForm<RecommendedInventoryItemFormData>({
    resolver: zodResolver(recommendedInventoryItemSchema),
    defaultValues: {
      name: "",
      expiresIn: 365,
      quantity: 1,
      isOptional: false,
      description: "",
    },
  });

  const isEditing = !!item;

  useEffect(() => {
    if (item) {
      form.reset({
        name: item.name || "",
        expiresIn: item.expiresIn || 365,
        quantity: item.quantity || 1,
        isOptional: item.isOptional || false,
        description: item.description || "",
      });
    }
  }, [item, form]);

  const onSubmit = async (data: RecommendedInventoryItemFormData) => {
    try {
      if (isEditing && item?.id) {
        await updateItem.mutateAsync({ id: item.id, data });
      } else {
        await createItem.mutateAsync(data);
      }
      onSuccess();
      if (!isEditing) {
        form.reset();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const isLoading = createItem.isPending || updateItem.isPending;

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
                  placeholder="e.g., Water (per person)"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="expiresIn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expires In (days)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="365"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recommended Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isOptional"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </FormControl>
              <FormLabel className="font-normal">
                This item is optional (not essential for all preppers)
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  placeholder="Detailed description of the item and why it's recommended..."
                  {...field}
                  disabled={isLoading}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Saving..." : isEditing ? "Update Item" : "Create Item"}
        </Button>
      </form>
    </Form>
  );
}
