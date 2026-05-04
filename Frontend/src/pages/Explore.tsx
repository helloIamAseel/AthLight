import React, { useMemo, useState, useEffect, useRef } from "react";
import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import type { Filters } from "@/components/feed/types";
import { DEFAULT_FILTERS, MOCK_ATHLETES, matchesFilters } from "@/components/feed/constants";
import { useFollowing } from "@/contexts/FollowingContext";
import { useRoleNav } from "@/hooks/useRoleNav";
import { useOpenProfile } from "@/lib/profileNavigation";
import TopBar from "@/components/feed/TopBar";
import FilterPanel from "@/components/feed/FilterPanel";
import FeedCard from "@/components/feed/FeedCard";
import BottomNav from "@/components/feed/BottomNav";
import SelectionOverlay from "@/components/upload/SelectionOverlay";
import InstructionModal from "@/components/upload/InstructionModal";
import AnalysisLoader from "@/components/upload/AnalysisLoader";
import PlayerGrid from "@/components/upload/PlayerGrid";

export default function ExplorePage() {
  const { followingIds, toggleFollow } = useFollowing();
  const [searchQuery, setSearchQuery] = useState("");
  const [draftFilters, setDraftFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const navigate = useNavigate();
  const { navItems } = useRoleNav({ role: "athlete", onUploadClick: () => setUploadStep("selection") });
  const openProfile = useOpenProfile("athlete");

  type UploadStep = "idle" | "selection" | "instruction" | "analyzing" | "playerGrid";
  type SessionType = "training" | "match";
  const [uploadStep, setUploadStep] = useState<UploadStep>("idle");
  const [sessionType, setSessionType] = useState<SessionType>("training");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<number[]>([]);
  const [showAccuracyAlert, setShowAccuracyAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (uploadStep !== "analyzing") return;
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) { clearInterval(interval); setUploadStep("playerGrid"); return 100; }
        return prev + 2;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [uploadStep]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) { setShowAccuracyAlert(false); setUploadStep("analyzing"); }
  };
  const handleUploadSelect = (type: "training" | "match") => { setSessionType(type); setUploadStep("instruction"); };
  const handleInstructionConfirm = () => { fileInputRef.current?.click(); };
  const handlePlayerToggle = (id: number) => {
    setSelectedPlayerIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };
  const handlePlayerConfirm = () => { alert(`Tracking Started for IDs: ${selectedPlayerIds}`); setUploadStep("idle"); setSelectedPlayerIds([]); setShowAccuracyAlert(false); };
  const handlePlayerRetry = () => { setAnalysisProgress(0); setSelectedPlayerIds([]); setShowAccuracyAlert(true); setUploadStep("analyzing"); };
  const resetUpload = () => { setUploadStep("idle"); setSelectedPlayerIds([]); setAnalysisProgress(0); setShowAccuracyAlert(false); };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar
        role="athlete"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClick={() => navigate("/explore-search?from=/explore")}
        isFilterOpen={isFilterOpen}
        onToggleFilter={() => setIsFilterOpen(v => !v)}
        activeFilterCount={activeFilterCount}
        avatarInitials="YO"
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

      <input type="file" ref={fileInputRef} hidden onChange={handleFileChange} accept="video/*" />

      <AnimatePresence>
        {uploadStep === "selection" && <SelectionOverlay onSelect={handleUploadSelect} onClose={resetUpload} />}
        {uploadStep === "instruction" && <InstructionModal sessionType={sessionType} onConfirm={handleInstructionConfirm} onClose={() => setUploadStep("selection")} />}
      </AnimatePresence>

      {uploadStep === "analyzing" && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
          <AnalysisLoader progress={analysisProgress} />
        </div>
      )}
      {uploadStep === "playerGrid" && (
        <div className="fixed inset-0 z-50 bg-background">
          <PlayerGrid selectedIds={selectedPlayerIds} onToggle={handlePlayerToggle} onRetry={handlePlayerRetry} onConfirm={handlePlayerConfirm} lowConfidence={showAccuracyAlert} onDismissAlert={() => setShowAccuracyAlert(false)} />
        </div>
      )}
    </div>
  );
}
