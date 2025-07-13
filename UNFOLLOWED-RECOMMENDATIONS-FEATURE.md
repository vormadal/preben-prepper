# Unfollowed Recommendations Feature

## Overview
This feature helps users track which recommended inventory items they haven't yet added to their actual inventory. It provides a visual indicator on the dashboard and a detailed view of all recommendations.

## Components

### 1. UnfollowedRecommendationsWidget
- **Location**: `frontend/src/components/UnfollowedRecommendationsWidget.tsx`
- **Purpose**: Shows a count of unfollowed recommendations on the dashboard
- **Features**:
  - Displays count of recommendations not yet followed
  - Clickable widget that redirects to detailed view
  - Color-coded icon (orange for unfollowed items, green when all are followed)
  - Loading state with skeleton animation

### 2. Recommendations Page
- **Location**: `frontend/src/app/recommendations/page.tsx`
- **Route**: `/recommendations`
- **Purpose**: Detailed view of all recommendations with their status
- **Features**:
  - Summary cards showing total, following, and not following counts
  - Tabbed interface separating followed vs unfollowed recommendations
  - Individual recommendation cards with:
    - Name and description
    - Quantity and expiration information
    - Optional/Essential badges
    - Following status badges
    - "Add to Inventory" button for unfollowed items
  - Responsive grid layout (1-3 columns based on screen size)
  - Loading states and empty states

## Logic

### Recommendation Matching
The system determines if a recommendation is "followed" by comparing the names of recommended items with existing inventory items:

1. **Case-insensitive comparison**: Both names are converted to lowercase for matching
2. **Whitespace trimming**: Leading and trailing spaces are removed
3. **Exact name match**: A recommendation is considered "followed" if an inventory item exists with the exact same name

### Data Flow
1. Fetch inventory items via `useInventoryItems()` hook
2. Fetch recommended items via `useRecommendedInventoryItems()` hook
3. Create a Set of inventory item names for efficient lookup
4. Filter recommended items based on whether their names exist in the inventory Set
5. Display counts and details based on the filtering results

## Integration

### Dashboard Integration
The `UnfollowedRecommendationsWidget` is added to the home page dashboard:
- Grid layout updated from 3 columns to 4 columns (2 on mobile, 4 on desktop)
- Positioned alongside existing stats (Total Items, Expiring Soon, Fresh Items)

### Navigation
- Widget click redirects to `/recommendations` page
- Recommendations page includes "Back to Dashboard" button
- Maintains consistent Header component usage

## Usage

1. **View unfollowed count**: Check the dashboard widget for a quick count
2. **Access details**: Click the widget to navigate to the recommendations page
3. **Review recommendations**: Use the tabs to switch between followed/unfollowed items
4. **Add items**: Click "Add to Inventory" button on unfollowed items
5. **Track progress**: Watch as items move from "Not Following" to "Following" tabs

## Benefits

- **Quick Overview**: Dashboard widget provides immediate insight into recommendation compliance
- **Detailed Analysis**: Dedicated page allows thorough review of all recommendations
- **Actionable Interface**: Direct integration with inventory creation from recommendations
- **Progress Tracking**: Visual feedback on recommendation following progress
- **Mobile Optimized**: Responsive design works well on all screen sizes
