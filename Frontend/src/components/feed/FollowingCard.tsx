import React from "react";
import { Button } from "@/components/ui/button";
import type { Athlete } from "./types";
import AthleteAvatar from "./AthleteAvatar";

interface FollowingCardProps {
  athlete: Athlete;
  onUnfollow: (id: string) => void;
}

const FollowingCard = React.memo(function FollowingCard({ athlete, onUnfollow }: FollowingCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 spotlight-hover spotlight-border">
      <AthleteAvatar src={athlete.avatarUrl} alt={athlete.name} className="h-11 w-11" />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-card-foreground truncate">{athlete.name}</h3>
        <p className="text-xs text-muted-foreground">{athlete.position}</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => onUnfollow(athlete.id)}>
        Unfollow
      </Button>
    </div>
  );
});

export default FollowingCard;
