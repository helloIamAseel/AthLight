import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Filters } from "@/components/feed/types";
import { DEFAULT_FILTERS, MOCK_ATHLETES, matchesFilters } from "@/components/feed/constants";
import { useFollowing } from "@/contexts/FollowingContext";
import { useRoleNav } from "@/hooks/useRoleNav";
import { useOpenProfile } from "@/lib/profileNavigation";
import TopBar from "@/components/feed/TopBar";
import FilterPanel from "@/components/feed/FilterPanel";
import FeedCard from "@/components/feed/FeedCard";
import BottomNav from "@/components/feed/BottomNav";

export default function ScoutExplorePage() {
  const navigate = useNavigate();
  const { navItems } = useRoleNav({ role: "scout" });
  const openProfile = useOpenProfile("scout");
  const { followingIds, toggleFollow } = useFollowing();
  const [searchQuery, setSearchQuery] = useState("");
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Explore shows only athletes NOT yet followed
  const visibleAthletes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_ATHLETES.filter(a => {
      if (followingIds.has(a.id)) return false;
      return matchesFilters(a, appliedFilters, q);
    });
  }, [searchQuery, appliedFilters, followingIds]);

  const activeFilterCount = [
    appliedFilters.sport, appliedFilters.position, appliedFilters.country,
    appliedFilters.city, appliedFilters.ageRange[0], appliedFilters.ageRange[1],
  ].filter(Boolean).length;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClick={() => navigate("/explore-search?from=/scout-explore")}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(v => !v)}
        activeFilterCount={activeFilterCount}
        avatarInitials="SC"
        role="scout"
      />

      {isFilterOpen && (
        <FilterPanel
          draftFilters={draftFilters}
          onDraftChange={setDraftFilters}
          onApply={(f) => { setAppliedFilters(f); setIsFilterOpen(false); }}
          onReset={() => { setDraftFilters(DEFAULT_FILTERS); setAppliedFilters(DEFAULT_FILTERS); }}
          onClose={() => setIsFilterOpen(false)}
        />
      )}

      <main className="flex-1 px-4 py-4 pb-20">
        <div className="mx-auto max-w-2xl space-y-3">
          {visibleAthletes.length > 0 ? (
            visibleAthletes.map(a => (
              <FeedCard key={a.id} athlete={a} isFollowing={false} onToggleFollow={toggleFollow} onProfileClick={() => openProfile({ targetRole: "athlete", targetId: a.id })} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No new athletes to discover.</p>
              <p className="text-xs text-muted-foreground mt-1">You're following everyone! Check back later.</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
