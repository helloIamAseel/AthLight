import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Zap, Ruler, Activity } from "lucide-react";
import type { Athlete } from "./types";
import AthleteAvatar from "./AthleteAvatar";
import StatPill from "./StatPill";

interface FeedCardProps {
  athlete: Athlete;
  isFollowing: boolean;
  onToggleFollow: (id: string) => void;
  onSendFeedback?: (athlete: Athlete) => void;
  onProfileClick?: (athlete: Athlete) => void;
}

const FeedCard = React.memo(function FeedCard({
  athlete,
  isFollowing,
  onToggleFollow,
  onSendFeedback,
  onProfileClick,
}: FeedCardProps) {
  return (
    <article className="rounded-xl border border-border/50 bg-card p-4 shadow-sm spotlight-hover spotlight-border transition-all duration-300">
      {/* Header */}
      <header className="flex items-center gap-3 mb-3">
        <button type="button" className="shrink-0" onClick={() => onProfileClick?.(athlete)} aria-label={`View ${athlete.name}'s profile`}>
          <AthleteAvatar src={athlete.avatarUrl} alt={athlete.name} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <button type="button" className="font-bold text-foreground truncate hover:text-secondary transition-colors text-left" onClick={() => onProfileClick?.(athlete)}>{athlete.name}</button>
            <Badge variant="secondary" className="text-[10px] shrink-0 font-semibold bg-secondary/12 text-secondary border-0">{athlete.position}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{athlete.timeAgo}</p>
        </div>

        <Button
          variant={isFollowing ? "outline" : "default"}
          size="sm"
          onClick={() => onToggleFollow(athlete.id)}
          className="shrink-0"
        >
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      </header>

      {/* Video placeholder */}
      <section className="relative mb-3 rounded-xl bg-gradient-to-br from-primary/6 via-secondary/4 to-accent/3 aspect-video flex items-center justify-center overflow-hidden border border-border/30">
        <button
          type="button"
          aria-label="Play"
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-glow hover:shadow-xl hover:scale-110 transition-all duration-300"
        >
          <Play className="h-6 w-6 ml-0.5" />
        </button>
        <span className="absolute bottom-2 right-2 rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-semibold text-background backdrop-blur-sm">
          {athlete.videoDuration}
        </span>
      </section>

      {/* Send Feedback (coach only) */}
      {onSendFeedback && (
        <section className="mb-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-secondary/25 text-secondary hover:bg-secondary/5 hover:border-secondary/40"
            onClick={() => onSendFeedback(athlete)}
          >
            Send Feedback
          </Button>
        </section>
      )}

      {/* Stats */}
      <section className="grid grid-cols-3 gap-2">
        <StatPill icon={<Zap className="h-3.5 w-3.5 text-primary" />} label="Speed" value={athlete.stats.speed} />
        <StatPill icon={<Ruler className="h-3.5 w-3.5 text-secondary" />} label="Distance" value={athlete.stats.distance} />
        <StatPill icon={<Activity className="h-3.5 w-3.5 text-accent-foreground" />} label="Agility" value={String(athlete.stats.agility)} />
      </section>
    </article>
  );
});

export default FeedCard;
