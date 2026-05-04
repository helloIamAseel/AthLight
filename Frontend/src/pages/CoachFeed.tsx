import React, { useMemo, useState } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Athlete, Filters } from "@/components/feed/types";
import { DEFAULT_FILTERS, MOCK_ATHLETES, matchesFilters } from "@/components/feed/constants";
import { useFollowing } from "@/contexts/FollowingContext";
import { useRoleNav } from "@/hooks/useRoleNav";
import { useOpenProfile } from "@/lib/profileNavigation";
import TopBar from "@/components/feed/TopBar";
import FilterPanel from "@/components/feed/FilterPanel";
import FeedCard from "@/components/feed/FeedCard";
import BottomNav from "@/components/feed/BottomNav";
import SendFeedbackModal from "@/components/SendFeedbackModal";

export default function CoachFeedPage() {
  const navigate = useNavigate();
  const { navItems } = useRoleNav({ role: "coach" });
  const openProfile = useOpenProfile("coach");
  const { followingIds, toggleFollow } = useFollowing();
  const [searchQuery] = useState("");
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<Athlete | null>(null);

  // Feed only shows followed athletes
  const visibleAthletes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_ATHLETES.filter(a => {
      if (!followingIds.has(a.id)) return false;
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
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(v => !v)}
        activeFilterCount={activeFilterCount}
        avatarInitials="CO"
        role="coach"
        headerContent={
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Discover{" "}
            <span className="text-gradient-brand">
              Athlete Updates
            </span>
          </h1>
        }
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
          {followingIds.size === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No content available</p>
              <p className="text-xs text-muted-foreground mt-1">You are not following any athletes yet. Discover athletes in Explore.</p>
            </div>
          ) : visibleAthletes.length > 0 ? (
            visibleAthletes.map(a => (
              <FeedCard key={a.id} athlete={a} isFollowing={true} onToggleFollow={toggleFollow} onSendFeedback={(athlete) => setFeedbackTarget(athlete)} onProfileClick={() => openProfile({ targetRole: "athlete", targetId: a.id })} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <p className="text-muted-foreground font-medium">No athletes found.</p>
              <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav items={navItems} />

      {feedbackTarget && (
        <SendFeedbackModal
          playerId={feedbackTarget.id}
          playerName={feedbackTarget.name}
          onClose={() => setFeedbackTarget(null)}
          onSubmit={(payload) => { console.log("Feedback submitted:", payload); setFeedbackTarget(null); }}
        />
      )}
    </div>
  );
}
