"use client";

import { useSession as useNextAuthSession } from "next-auth/react";

export function useSessionData() {
  const { data: session, status } = useNextAuthSession();
  
  const userId = session?.user?.id ? parseInt(session.user.id) : undefined;
  
  return {
    session,
    status,
    userId,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated" && !!userId,
  };
}
