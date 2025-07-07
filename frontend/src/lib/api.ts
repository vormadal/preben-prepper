// Types for API responses
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  expirationDate: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  quantity: number;
  expirationDate: string;
}

export interface UpdateInventoryItemRequest {
  name?: string;
  quantity?: number;
  expirationDate?: string;
}

export interface ApiError {
  error: {
    message: string;
    status: number;
    details?: unknown[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.error.message || 'Something went wrong');
    }

    return response.json();
  }

  // Users API
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserRequest): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    return this.request('/health');
  }

  // Inventory API
  async getInventoryItems(): Promise<InventoryItem[]> {
    return this.request<InventoryItem[]>('/inventory');
  }

  async getInventoryItem(id: number): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}`);
  }

  async createInventoryItem(data: CreateInventoryItemRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: number, data: UpdateInventoryItemRequest): Promise<InventoryItem> {
    return this.request<InventoryItem>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: number): Promise<void> {
    return this.request<void>(`/inventory/${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
