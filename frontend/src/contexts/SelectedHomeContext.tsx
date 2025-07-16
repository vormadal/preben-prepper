"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSessionData } from '@/hooks/useSession';
import { useHomes } from '@/hooks/useApi';

interface SelectedHomeContextType {
  selectedHomeId: number | undefined;
  setSelectedHomeId: (homeId: number) => void;
  availableHomes: Array<{ id: number; name: string }>;
  isLoading: boolean;
}

const SelectedHomeContext = createContext<SelectedHomeContextType | undefined>(undefined);

export function SelectedHomeProvider({ children }: { children: ReactNode }) {
  const { userId, isAuthenticated } = useSessionData();
  const { data: homes, isLoading: homesLoading } = useHomes(userId || 0);
  const [selectedHomeId, setSelectedHomeIdState] = useState<number | undefined>(undefined);

  // Initialize selected home when user data and homes are available
  useEffect(() => {
    if (isAuthenticated && homes && homes.length > 0 && !selectedHomeId) {
      // Use the first available home
      setSelectedHomeIdState(homes[0].id);
    }
  }, [isAuthenticated, homes, selectedHomeId]);

  const setSelectedHomeId = async (homeId: number) => {
    setSelectedHomeIdState(homeId);
    
    // Update backend asynchronously
    try {
      await fetch('/api/auth/update-selected-home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ homeId })
      });
    } catch (error) {
      console.error('Failed to update selected home:', error);
    }
  };

  const value: SelectedHomeContextType = {
    selectedHomeId,
    setSelectedHomeId,
    availableHomes: homes || [],
    isLoading: homesLoading || !isAuthenticated,
  };

  return (
    <SelectedHomeContext.Provider value={value}>
      {children}
    </SelectedHomeContext.Provider>
  );
}

export function useSelectedHome() {
  const context = useContext(SelectedHomeContext);
  if (context === undefined) {
    throw new Error('useSelectedHome must be used within a SelectedHomeProvider');
  }
  return context;
}
