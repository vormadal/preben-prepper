"use client";

import { useSessionData } from "@/hooks/useSession";
import { useSelectedHome } from "@/contexts/SelectedHomeContext";

// Hook that combines session data with selected home data
// Use this in components that need both user and home context
export function useSessionWithHome() {
  const sessionData = useSessionData();
  const { selectedHomeId } = useSelectedHome();
  
  return {
    ...sessionData,
    selectedHomeId,
  };
}
