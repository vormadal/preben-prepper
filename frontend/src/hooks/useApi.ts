import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  handleApiError,
  User,
  InventoryItem,
  CreateUserRequest,
} from "@/lib/kiota-api-client";
import { toast } from "sonner";
import { UsersPutRequestBody } from "@/generated/api/users/item";
import { InventoryPostRequestBody } from "@/generated/api/inventory";
import { InventoryPutRequestBody } from "@/generated/api/inventory/item";

// Query keys
export const queryKeys = {
  users: ["users"] as const,
  user: (id: number) => ["users", id] as const,
  inventory: ["inventory"] as const,
  inventoryItem: (id: number) => ["inventory", id] as const,
  health: ["health"] as const,
};

// Users queries
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiClient.getUsers(),
  });
};

export const useUser = (id: number) => {
  return useQuery({
    queryKey: queryKeys.user(id),
    queryFn: () => apiClient.getUser(id),
    enabled: !!id,
  });
};

// Users mutations
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => apiClient.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success("User created successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to create user");
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UsersPutRequestBody }) =>
      apiClient.updateUser(id, data),
    onSuccess: (updatedUser: User) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      queryClient.setQueryData(
        queryKeys.user(updatedUser.id ?? -1),
        updatedUser
      );
      toast.success("User updated successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to update user");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success("User deleted successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to delete user");
    },
  });
};

// Health check query
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.healthCheck(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Inventory queries
export const useInventoryItems = () => {
  return useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => apiClient.getInventoryItems(),
  });
};

export const useInventoryItem = (id: number) => {
  return useQuery({
    queryKey: queryKeys.inventoryItem(id),
    queryFn: () => apiClient.getInventoryItem(id),
    enabled: !!id,
  });
};

// Inventory mutations
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InventoryPostRequestBody) =>
      apiClient.createInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      toast.success("Inventory item created successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to create inventory item");
    },
  });
};

export const useUpdateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InventoryPutRequestBody }) =>
      apiClient.updateInventoryItem(id, data),
    onSuccess: (updatedItem: InventoryItem) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      queryClient.setQueryData(
        queryKeys.inventoryItem(updatedItem.id ?? -1),
        updatedItem
      );
      toast.success("Inventory item updated successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to update inventory item");
    },
  });
};

export const useDeleteInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      toast.success("Inventory item deleted successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to delete inventory item");
    },
  });
};
