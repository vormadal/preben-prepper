import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  apiClient,
  handleApiError,
  User,
  InventoryItem,
  CreateUserRequest,
  Home,
  CreateHomeRequest,
} from "@/lib/kiota-api-client";
import { toast } from "sonner";
import { UsersPutRequestBody } from "@/generated/api/users/item";
import { InventoryPostRequestBody } from "@/generated/api/inventory";
import { InventoryPutRequestBody } from "@/generated/api/inventory/item";

// Query keys
export const queryKeys = {
  users: ["users"] as const,
  user: (id: number) => ["users", id] as const,
  homes: (userId: number) => ["homes", userId] as const,
  home: (id: number, userId: number) => ["homes", id, userId] as const,
  inventory: (homeId: number) => ["inventory", homeId] as const,
  inventoryItem: (homeId: number, id: number) => ["inventory", homeId, id] as const,
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
export const useInventoryItems = (homeId: number, userId?: number) => {
  return useQuery({
    queryKey: [...queryKeys.inventory(homeId), userId],
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return apiClient.getInventoryItems(homeId, userId);
    },
    enabled: !!userId && !!homeId,
  });
};

export const useInventoryItem = (homeId: number, id: number, userId?: number) => {
  return useQuery({
    queryKey: queryKeys.inventoryItem(homeId, id),
    queryFn: () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return apiClient.getInventoryItem(homeId, id, userId);
    },
    enabled: !!id && !!homeId && !!userId,
  });
};

// Inventory mutations
export const useCreateInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ homeId, data }: { homeId: number; data: InventoryPostRequestBody & { userId: number } }) =>
      apiClient.createInventoryItem(homeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory(variables.homeId) });
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
    mutationFn: ({ homeId, id, userId, data }: { homeId: number; id: number; userId: number; data: InventoryPutRequestBody }) =>
      apiClient.updateInventoryItem(homeId, id, userId, data),
    onSuccess: (updatedItem: InventoryItem, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory(variables.homeId) });
      queryClient.setQueryData(
        queryKeys.inventoryItem(variables.homeId, updatedItem.id ?? -1),
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
    mutationFn: ({ homeId, id, userId }: { homeId: number; id: number; userId: number }) => 
      apiClient.deleteInventoryItem(homeId, id, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory(variables.homeId) });
      toast.success("Inventory item deleted successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to delete inventory item");
    },
  });
};

// Recommended Inventory queries (User-facing)
export const useRecommendedInventoryItems = () => {
  return useQuery({
    queryKey: ["recommendedInventory"],
    queryFn: () => apiClient.getRecommendedInventoryItems(),
  });
};

export const useRecommendedInventoryItem = (id: number) => {
  return useQuery({
    queryKey: ["recommendedInventory", id],
    queryFn: () => apiClient.getRecommendedInventoryItem(id),
    enabled: !!id,
  });
};

export const useCreateInventoryFromRecommendation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: { quantity?: number; customExpirationDate?: string } }) =>
      apiClient.createInventoryFromRecommendation(id, data),
    onSuccess: (_, variables) => {
      // Since we don't know which home this was created for, invalidate all inventory queries
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast.success("Inventory item created from recommendation!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to create inventory item from recommendation");
    },
  });
};

// Admin Recommended Inventory queries
export const useAdminRecommendedInventoryItems = () => {
  return useQuery({
    queryKey: ["adminRecommendedInventory"],
    queryFn: () => apiClient.getAdminRecommendedInventoryItems(),
  });
};

export const useAdminRecommendedInventoryItem = (id: number) => {
  return useQuery({
    queryKey: ["adminRecommendedInventory", id],
    queryFn: () => apiClient.getAdminRecommendedInventoryItem(id),
    enabled: !!id,
  });
};

export const useCreateRecommendedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => apiClient.createRecommendedInventoryItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRecommendedInventory"] });
      toast.success("Recommended inventory item created successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to create recommended inventory item");
    },
  });
};

export const useUpdateRecommendedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiClient.updateRecommendedInventoryItem(id, data),
    onSuccess: (updatedItem: any) => {
      queryClient.invalidateQueries({ queryKey: ["adminRecommendedInventory"] });
      queryClient.setQueryData(
        ["adminRecommendedInventory", updatedItem.id],
        updatedItem
      );
      toast.success("Recommended inventory item updated successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to update recommended inventory item");
    },
  });
};

export const useDeleteRecommendedInventoryItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteRecommendedInventoryItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminRecommendedInventory"] });
      toast.success("Recommended inventory item deleted successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to delete recommended inventory item");
    },
  });
};

// Homes queries
export const useHomes = (userId: number) => {
  return useQuery({
    queryKey: queryKeys.homes(userId),
    queryFn: () => apiClient.getHomes(userId),
    enabled: !!userId,
  });
};

export const useHome = (id: number, userId: number) => {
  return useQuery({
    queryKey: queryKeys.home(id, userId),
    queryFn: () => apiClient.getHome(id, userId),
    enabled: !!id && !!userId,
  });
};

// Homes mutations
export const useCreateHome = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHomeRequest) => apiClient.createHome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homes"] });
      toast.success("Home created successfully!");
    },
    onError: (error: Error) => {
      handleApiError(error);
      toast.error(error.message || "Failed to create home");
    },
  });
};
