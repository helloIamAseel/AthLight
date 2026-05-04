import React, { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface FollowingContextType {
  followingIds: Set<string>;
  toggleFollow: (id: string) => void;
  isFollowing: (id: string) => boolean;
}

const FollowingContext = createContext<FollowingContextType | null>(null);

export function FollowingProvider({ children }: { children: ReactNode }) {
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  const toggleFollow = useCallback((id: string) => {
    setFollowingIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const isFollowing = useCallback((id: string) => followingIds.has(id), [followingIds]);

  return (
    <FollowingContext.Provider value={{ followingIds, toggleFollow, isFollowing }}>
      {children}
    </FollowingContext.Provider>
  );
}

export function useFollowing() {
  const ctx = useContext(FollowingContext);
  if (!ctx) throw new Error("useFollowing must be used within FollowingProvider");
  return ctx;
}
