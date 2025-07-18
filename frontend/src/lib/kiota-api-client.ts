import { FetchRequestAdapter } from "@microsoft/kiota-http-fetchlibrary";
import { AnonymousAuthenticationProvider } from "@microsoft/kiota-abstractions";
import { createApiClient } from "../generated/apiClient";
import {
  User as GeneratedUser,
  InventoryItem as GeneratedInventoryItem,
  RecommendedInventoryItem as GeneratedRecommendedInventoryItem,
} from "../generated/models";
import { UsersPostRequestBody } from "../generated/api/users";
import { InventoryPostRequestBody } from "../generated/api/inventory";
import { InventoryPutRequestBody } from "../generated/api/inventory/item";
import { RecommendedInventoryPostRequestBody } from "../generated/api/admin/recommendedInventory";
import { CreateInventoryPostRequestBody } from "../generated/api/recommendedInventory/item/createInventory";
import { HealthGetResponse } from "@/generated/api/health";

// Define Home interface since it may not be generated properly
export interface Home {
  id: number;
  name: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfPets?: number;
  ownerId: number;
  owner?: {
    id: number;
    name: string;
    email: string;
  };
  homeAccesses?: HomeAccess[];
  _count?: {
    inventoryItems: number;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface HomeAccess {
  id: number;
  userId: number;
  homeId: number;
  role: "ADMIN" | "MEMBER";
  user?: {
    id: number;
    name: string;
    email: string;
  };
  home?: {
    id: number;
    name: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateHomeRequest {
  name: string;
  numberOfAdults?: number;
  numberOfChildren?: number;
  numberOfPets?: number;
  ownerId: number;
}

// Create the request adapter with anonymous authentication
const authProvider = new AnonymousAuthenticationProvider();
const requestAdapter = new FetchRequestAdapter(authProvider);

// Set the base URL for the API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
requestAdapter.baseUrl = API_BASE_URL;

// Create the API client
const generatedClient = createApiClient(requestAdapter);

// Create a wrapper class that provides the same interface as the previous manual client
class ApiClientWrapper {
  private client = generatedClient;

  // Health check
  async healthCheck(): Promise<HealthGetResponse> {
    const response = await this.client.api.health.get();
    // Convert Date to string for timestamp
    return {
      status: response?.status || "unknown",
      timestamp: response?.timestamp || new Date(),
      uptime: response?.uptime || 0,
    };
  }

  // Users API
  async getUsers(): Promise<GeneratedUser[]> {
    const response = await this.client.api.users.get();
    return response || [];
  }

  async getUser(id: number): Promise<GeneratedUser> {
    const response = await this.client.api.users.byId(id).get();
    if (!response) {
      throw new Error("User not found");
    }
    return response;
  }

  async createUser(data: UsersPostRequestBody): Promise<GeneratedUser> {
    const response = await this.client.api.users.post(data);
    if (!response) {
      throw new Error("Failed to create user");
    }
    return response;
  }

  async updateUser(
    id: number,
    data: Partial<GeneratedUser>
  ): Promise<GeneratedUser> {
    const response = await this.client.api.users.byId(id).put(data);
    if (!response) {
      throw new Error("Failed to update user");
    }
    return response;
  }

  async deleteUser(id: number): Promise<void> {
    await this.client.api.users.byId(id).delete();
  }

  // Inventory API
  async getInventoryItems(homeId: number, userId: number): Promise<GeneratedInventoryItem[]> {
    const response = await fetch(`${API_BASE_URL}/api/home/${homeId}/inventory?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory items: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async getInventoryItem(homeId: number, id: number, userId: number): Promise<GeneratedInventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/home/${homeId}/inventory/${id}?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch inventory item: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async createInventoryItem(
    homeId: number,
    data: Partial<GeneratedInventoryItem> & { userId: number }
  ): Promise<GeneratedInventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/home/${homeId}/inventory`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create inventory item: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async updateInventoryItem(
    homeId: number,
    id: number,
    userId: number,
    data: Partial<GeneratedInventoryItem>
  ): Promise<GeneratedInventoryItem> {
    const response = await fetch(`${API_BASE_URL}/api/home/${homeId}/inventory/${id}?userId=${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update inventory item: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async deleteInventoryItem(homeId: number, id: number, userId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/home/${homeId}/inventory/${id}?userId=${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete inventory item: ${response.statusText}`);
    }
  }

  // Recommended Inventory API (User-facing)
  async getRecommendedInventoryItems(): Promise<GeneratedRecommendedInventoryItem[]> {
    const response = await this.client.api.recommendedInventory.get();
    return response || [];
  }

  async getRecommendedInventoryItem(id: number): Promise<GeneratedRecommendedInventoryItem> {
    const response = await this.client.api.recommendedInventory.byId(id).get();
    if (!response) {
      throw new Error("Recommended inventory item not found");
    }
    return response;
  }

  async createInventoryFromRecommendation(id: number, data?: { quantity?: number; customExpirationDate?: string }): Promise<GeneratedInventoryItem> {
    const requestData: any = data ? {
      quantity: data.quantity,
      customExpirationDate: data.customExpirationDate ? new Date(data.customExpirationDate) : undefined
    } : {};
    
    const response = await this.client.api.recommendedInventory.byId(id).createInventory.post(requestData);
    if (!response) {
      throw new Error("Failed to create inventory item from recommendation");
    }
    return response;
  }

  // Admin Recommended Inventory API
  async getAdminRecommendedInventoryItems(): Promise<GeneratedRecommendedInventoryItem[]> {
    const response = await this.client.api.admin.recommendedInventory.get();
    return response || [];
  }

  async getAdminRecommendedInventoryItem(id: number): Promise<GeneratedRecommendedInventoryItem> {
    const response = await this.client.api.admin.recommendedInventory.byId(id).get();
    if (!response) {
      throw new Error("Recommended inventory item not found");
    }
    return response;
  }

  async createRecommendedInventoryItem(data: RecommendedInventoryPostRequestBody): Promise<GeneratedRecommendedInventoryItem> {
    const response = await this.client.api.admin.recommendedInventory.post(data);
    if (!response) {
      throw new Error("Failed to create recommended inventory item");
    }
    return response;
  }

  async updateRecommendedInventoryItem(id: number, data: RecommendedInventoryPostRequestBody): Promise<GeneratedRecommendedInventoryItem> {
    const response = await this.client.api.admin.recommendedInventory.byId(id).put(data);
    if (!response) {
      throw new Error("Failed to update recommended inventory item");
    }
    return response;
  }

  async deleteRecommendedInventoryItem(id: number): Promise<void> {
    await this.client.api.admin.recommendedInventory.byId(id).delete();
  }
  
  // Homes API
  async getHomes(userId: number): Promise<Home[]> {
    try {
      const url = `${API_BASE_URL}/api/homes?userId=${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch homes: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch homes: ${error}`);
    }
  }

  async getHome(id: number, userId: number): Promise<Home> {
    try {
      const url = `${API_BASE_URL}/api/homes/${id}?userId=${userId}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch home: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch home: ${error}`);
    }
  }

  async createHome(data: CreateHomeRequest): Promise<Home> {
    try {
      const url = `${API_BASE_URL}/api/homes`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create home: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to create home: ${error}`);
    }
  }
}

// Export the wrapper for backward compatibility
export const apiClient = new ApiClientWrapper();

// Export the generated client directly
export { generatedClient };

// Re-export types from generated models for convenience
export type {
  GeneratedUser as User,
  GeneratedInventoryItem as InventoryItem,
  GeneratedRecommendedInventoryItem as RecommendedInventoryItem,
};
export type { UsersPostRequestBody as CreateUserRequest };
export type { InventoryPostRequestBody, InventoryPutRequestBody };
export type { RecommendedInventoryPostRequestBody, CreateInventoryPostRequestBody };

// Export all types from generated models
export * from "../generated/models";

// Utility function to handle API errors
export const handleApiError = (error: unknown) => {
  console.error("API Error:", error);

  if (error && typeof error === "object" && "response" in error) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const response = (
      error as { response: { data?: { error?: { message?: string } } } }
    ).response;
    const errorMessage = response?.data?.error?.message || "An error occurred";
    throw new Error(errorMessage);
  } else if (error && typeof error === "object" && "request" in error) {
    // The request was made but no response was received
    throw new Error("No response received from server");
  } else {
    // Something happened in setting up the request that triggered an Error
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    throw new Error(message);
  }
};
