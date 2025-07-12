import { DateOnly } from '@microsoft/kiota-abstractions';
import { InventoryItem } from '@/generated/models';

// Type guard to ensure item has required properties
export const isValidInventoryItem = (item: InventoryItem): item is InventoryItem & {
  id: number;
  name: string;
  quantity: number;
  expirationDate: DateOnly;
  createdAt: Date;
} => {
  return !!(
    item.id != null &&
    item.name != null &&
    item.quantity != null &&
    item.expirationDate != null &&
    item.createdAt != null
  );
};

// Safe property accessors with fallbacks
export const getItemName = (item: InventoryItem): string => item.name ?? 'Unknown Item';
export const getItemQuantity = (item: InventoryItem): number => item.quantity ?? 0;
export const getItemId = (item: InventoryItem): number => item.id ?? 0;

export const getItemExpirationDate = (item: InventoryItem): Date => {
  return item.expirationDate ? new Date(item.expirationDate.toString()) : new Date();
};

export const getItemCreatedAt = (item: InventoryItem): Date => {
  return item.createdAt ?? new Date();
};

// Date utility functions
export const isExpiringSoon = (expirationDate: DateOnly | null | undefined): boolean => {
  if (!expirationDate) return false;
  const expDate = new Date(expirationDate.toString());
  const today = new Date();
  const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return daysUntilExpiration <= 30;
};

export const isExpired = (expirationDate: DateOnly | null | undefined): boolean => {
  if (!expirationDate) return false;
  const expDate = new Date(expirationDate.toString());
  const today = new Date();
  return expDate < today;
};

// Safe date formatting
export const formatExpirationDate = (expirationDate: DateOnly | null | undefined): string => {
  if (!expirationDate) return 'No date';
  return new Date(expirationDate.toString()).toLocaleDateString();
};

export const formatCreatedAt = (createdAt: Date | null | undefined): string => {
  if (!createdAt) return 'Unknown';
  return createdAt.toLocaleDateString();
};
