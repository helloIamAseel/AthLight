import React from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, SlidersHorizontal, Bell } from "lucide-react";
import athlightLogo from "@/assets/athlight_logo_v2.png";

interface TopBarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onSearchClick?: () => void;
  isFilterOpen: boolean;
  onToggleFilter: () => void;
  activeFilterCount: number;
  avatarInitials: string;
  headerText?: string;
  headerContent?: React.ReactNode;
  role?: "athlete" | "coach" | "scout";
}

export default function TopBar({
  searchQuery,
  onSearchChange,
  onSearchClick,
  isFilterOpen,
  onToggleFilter,
  activeFilterCount,
  avatarInitials,
  headerText,
  headerContent,
  role,
}: TopBarProps) {
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    if (role === "athlete") {
      navigate("/athlete-profile");
    } else if (role === "coach") {
      navigate("/coach-profile");
    } else if (role === "scout") {
      navigate("/scout-profile");
    }
  };
  return (
    <header className="sticky top-0 z-30 border-b border-border/40 bg-card/90 backdrop-blur-md px-4 py-3">
      <div className="mx-auto flex max-w-2xl items-center gap-3">
        <img src={athlightLogo} alt="AthLight" className="h-10 w-10 object-contain shrink-0 logo-glow" />

        {headerContent ? (
          <div className="flex-1 min-w-0">{headerContent}</div>
        ) : headerText ? (
          <p className="flex-1 text-sm font-semibold text-foreground leading-snug">{headerText}</p>
        ) : (
          <div className="relative flex-1" onClick={onSearchClick} onKeyDown={onSearchClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSearchClick(); } : undefined}>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search athletes..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-9"
              readOnly={!!onSearchClick}
              style={onSearchClick ? { cursor: "pointer" } : undefined}
            />
          </div>
        )}

        <Button
          variant={isFilterOpen ? "default" : "outline"}
          size="icon"
          className="relative shrink-0"
          onClick={onToggleFilter}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full gradient-teal-green text-[10px] font-bold text-accent-foreground shadow-sm">
              {activeFilterCount}
            </span>
          )}
        </Button>

        <Button variant="ghost" size="icon" className="shrink-0">
          <Bell className="h-5 w-5" />
        </Button>

        <Avatar
          className={`h-9 w-9 shrink-0 ring-2 ring-secondary/25 ${role ? "cursor-pointer transition-transform hover:scale-110" : ""}`}
          onClick={handleAvatarClick}
        >
          <AvatarFallback className="gradient-brand text-primary-foreground text-xs font-bold">
            {avatarInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
