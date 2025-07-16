# Home Management API

This document describes the new home management endpoints that have been added to the Preben Prepper API.

## Overview

The home management system allows users to organize their inventory items by homes. Each home has an owner and can have multiple users with different access levels. Inventory items now belong to specific homes, and users can only access inventory for homes they have permissions to view.

## Key Concepts

### Home
- A home represents a household or living space
- Each home has configuration for the number of adults, children, and pets
- This configuration can be used to tailor recommendations to each home
- Each home has one owner who has full administrative rights
- Each home can have multiple inventory items

### Home Access
- Users can be granted access to homes they don't own
- Two access levels: `ADMIN` and `MEMBER`
- `ADMIN`: Can manage the home settings and grant/revoke access to other users
- `MEMBER`: Can view and manage inventory items for the home
- Home owners automatically have full access (don't need explicit access records)

## Database Schema

### Home Model
```typescript
{
  id: number;
  name: string;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfPets: number;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### HomeAccess Model
```typescript
{
  id: number;
  userId: number;
  homeId: number;
  role: 'ADMIN' | 'MEMBER';
  createdAt: Date;
  updatedAt: Date;
}
```

### Updated InventoryItem Model
```typescript
{
  id: number;
  name: string;
  quantity: number;
  expirationDate: Date;
  homeId: number; // NEW: Links item to a home
  createdAt: Date;
  updatedAt: Date;
}
```

## API Endpoints

### Home Management

#### GET /api/homes
Get all homes where the user has access (as owner or granted access).

**Query Parameters:**
- `userId` (required): ID of the user requesting homes

**Response:** Array of homes with owner details, access list, and inventory count.

#### GET /api/homes/{id}
Get a specific home by ID (if user has access).

**Parameters:**
- `id`: Home ID
- `userId` (query): ID of the user requesting access

**Response:** Home details with owner, access list, and inventory count.

#### POST /api/homes
Create a new home.

**Request Body:**
```json
{
  "name": "My Home",
  "ownerId": 1,
  "numberOfAdults": 2,
  "numberOfChildren": 1,
  "numberOfPets": 0
}
```

#### PUT /api/homes/{id}
Update home details (owner or admin only).

**Parameters:**
- `id`: Home ID
- `userId` (query): ID of the user making the request

**Request Body:**
```json
{
  "name": "Updated Home Name",
  "numberOfAdults": 3,
  "numberOfChildren": 2,
  "numberOfPets": 1
}
```

#### DELETE /api/homes/{id}
Delete a home (owner only).

**Parameters:**
- `id`: Home ID
- `userId` (query): ID of the user making the request

### Home Access Management

#### POST /api/homes/{id}/access
Grant access to a user for a home (owner or admin only).

**Parameters:**
- `id`: Home ID
- `requesterId` (query): ID of the user making the request

**Request Body:**
```json
{
  "userId": 2,
  "role": "MEMBER"
}
```

#### PUT /api/homes/{homeId}/access/{userId}
Update a user's access role (owner or admin only).

**Parameters:**
- `homeId`: Home ID
- `userId`: ID of the user whose access to update
- `requesterId` (query): ID of the user making the request

**Request Body:**
```json
{
  "role": "ADMIN"
}
```

#### DELETE /api/homes/{homeId}/access/{userId}
Remove user access from a home (owner or admin only).

**Parameters:**
- `homeId`: Home ID
- `userId`: ID of the user whose access to remove
- `requesterId` (query): ID of the user making the request

### Updated Inventory Endpoints

#### GET /api/inventory
Get inventory items for homes the user has access to.

**Query Parameters:**
- `userId` (required): ID of the user requesting inventory
- `homeId` (optional): Filter by specific home ID

#### POST /api/inventory
Create a new inventory item.

**Query Parameters:**
- `userId` (required): ID of the user creating the item

**Request Body:**
```json
{
  "name": "Canned Beans",
  "quantity": 5,
  "expirationDate": "2025-12-31",
  "homeId": 1
}
```

#### GET /api/inventory/{id}
Get inventory item by ID (if user has access to the home).

**Parameters:**
- `id`: Inventory item ID
- `userId` (query): ID of the user requesting access

## Access Control Rules

1. **Home Owners**: Have full access to their homes and can perform all operations
2. **Home Admins**: Can manage home settings and grant/revoke access to other users
3. **Home Members**: Can view and manage inventory items for the home
4. **Non-members**: Cannot access home data or inventory

## Usage Examples

### Creating a Home
```bash
POST /api/homes
{
  "name": "The Smith Family Home",
  "ownerId": 1,
  "numberOfAdults": 2,
  "numberOfChildren": 3,
  "numberOfPets": 1
}
```

### Granting Access
```bash
POST /api/homes/1/access?requesterId=1
{
  "userId": 2,
  "role": "ADMIN"
}
```

### Adding Inventory to a Home
```bash
POST /api/inventory?userId=1
{
  "name": "Emergency Water",
  "quantity": 24,
  "expirationDate": "2026-01-01",
  "homeId": 1
}
```

### Getting Inventory for All Accessible Homes
```bash
GET /api/inventory?userId=1
```

### Getting Inventory for a Specific Home
```bash
GET /api/inventory?userId=1&homeId=1
```

## Migration Notes

- The database has been updated to include the new `homes` and `home_accesses` tables
- Existing inventory items have been migrated to belong to a default home
- All API endpoints now require proper authentication and authorization
- The seed script creates sample homes and access relationships for testing

## Future Enhancements

- Home-specific recommendations based on household configuration
- Shared shopping lists between home members
- Notification system for home access changes
- Home invitation system via email
- Bulk inventory operations for homes
