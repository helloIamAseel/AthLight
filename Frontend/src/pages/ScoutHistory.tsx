import React, { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Clock } from "lucide-react";
import PageHeader from "@/components/feed/PageHeader";
import BottomNav from "@/components/feed/BottomNav";
import { useRoleNav } from "@/hooks/useRoleNav";
import { useOpenProfile, type ProfileRole } from "@/lib/profileNavigation";

const PROFILE_LABEL_TO_ROLE: Record<"Athlete Profile" | "Coach Profile" | "Scout Profile", ProfileRole> = {
  "Athlete Profile": "athlete",
  "Coach Profile": "coach",
  "Scout Profile": "scout",
};

type ProfileType = "Athlete Profile" | "Coach Profile" | "Scout Profile";
type SportType = "Football" | "Swimming" | "Running" | "Padel";

type HistoryItem = {
  id: number;
  name: string;
  roleLabel: ProfileType;
  subtitle: string;
  viewedAtLabel: string;
  initials: string;
  sportType: SportType;
  viewedHoursAgo: number;
};

const HISTORY_ITEMS: HistoryItem[] = [
  { id: 1, name: "Mohammed Al-Harbi", roleLabel: "Athlete Profile", subtitle: "Forward • Al Hilal", viewedAtLabel: "Viewed 2 hours ago", initials: "MA", sportType: "Football", viewedHoursAgo: 2 },
  { id: 2, name: "Ahmed Ali", roleLabel: "Athlete Profile", subtitle: "Midfielder • Al Ittihad", viewedAtLabel: "Viewed yesterday", initials: "AA", sportType: "Football", viewedHoursAgo: 24 },
  { id: 3, name: "Saad Al-Sharif", roleLabel: "Coach Profile", subtitle: "Coach • Al Hilal Academy", viewedAtLabel: "Viewed 2 days ago", initials: "SA", sportType: "Football", viewedHoursAgo: 48 },
  { id: 4, name: "Sara Noor", roleLabel: "Athlete Profile", subtitle: "Defender • Al Ahli", viewedAtLabel: "Viewed 3 days ago", initials: "SN", sportType: "Football", viewedHoursAgo: 72 },
  { id: 5, name: "Lina Hassan", roleLabel: "Athlete Profile", subtitle: "Padel Player • Jeddah Club", viewedAtLabel: "Viewed 5 days ago", initials: "LH", sportType: "Padel", viewedHoursAgo: 120 },
  { id: 6, name: "Yousef Salem", roleLabel: "Scout Profile", subtitle: "Scout • Vision Sports", viewedAtLabel: "Viewed 8 days ago", initials: "YS", sportType: "Football", viewedHoursAgo: 192 },
];

function roleBadgeClasses(role: ProfileType) {
  if (role === "Athlete Profile") return "bg-secondary/10 text-secondary";
  if (role === "Coach Profile") return "bg-primary/10 text-primary";
  return "bg-accent/15 text-accent-foreground";
}

export default function ScoutHistory() {
  const { navItems } = useRoleNav({ role: "scout" });
  const openProfile = useOpenProfile("scout");
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedTime, setSelectedTime] = useState("All time");
  const [selectedSort, setSelectedSort] = useState("Most recent");

  const filteredItems = useMemo(() => {
    let result = [...HISTORY_ITEMS];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.roleLabel.toLowerCase().includes(q) ||
          item.subtitle.toLowerCase().includes(q)
      );
    }
    if (selectedRole !== "All") result = result.filter((i) => i.roleLabel === selectedRole);
    if (selectedSport !== "All") result = result.filter((i) => i.sportType === selectedSport);
    if (selectedTime !== "All time") {
      result = result.filter((i) => {
        if (selectedTime === "Last 24 hours") return i.viewedHoursAgo <= 24;
        if (selectedTime === "Last 3 days") return i.viewedHoursAgo <= 72;
        if (selectedTime === "Last week") return i.viewedHoursAgo <= 168;
        if (selectedTime === "Last month") return i.viewedHoursAgo <= 720;
        return true;
      });
    }
    if (selectedSort === "Most recent") result.sort((a, b) => a.viewedHoursAgo - b.viewedHoursAgo);
    else if (selectedSort === "Oldest") result.sort((a, b) => b.viewedHoursAgo - a.viewedHoursAgo);
    else if (selectedSort === "A–Z") result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [search, selectedRole, selectedSport, selectedTime, selectedSort]);

  const resetFilters = () => {
    setSearch("");
    setSelectedRole("All");
    setSelectedSport("All");
    setSelectedTime("All time");
    setSelectedSort("Most recent");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pb-20">
      <PageHeader
        title="Scouting History"
        subtitle="Profiles you've recently viewed"
        backTo="/scout-profile"
        rightContent={
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold text-white gradient-brand shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        }
      />

      <div className="mx-auto max-w-3xl px-5 pt-3 pb-5">
        {/* Filters Card */}
        <div className="rounded-xl border border-border/30 bg-card p-4 shadow-sm mb-3">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              type="search"
              placeholder="Search by name, role, club…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm rounded-lg border-border/40 focus:border-secondary/50 bg-muted/20"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="h-9 text-xs rounded-lg border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All roles</SelectItem>
                  <SelectItem value="Athlete Profile">Athlete</SelectItem>
                  <SelectItem value="Coach Profile">Coach</SelectItem>
                  <SelectItem value="Scout Profile">Scout</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sport</Label>
              <Select value={selectedSport} onValueChange={setSelectedSport}>
                <SelectTrigger className="h-9 text-xs rounded-lg border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All sports</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Swimming">Swimming</SelectItem>
                  <SelectItem value="Running">Running</SelectItem>
                  <SelectItem value="Padel">Padel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger className="h-9 text-xs rounded-lg border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All time">All time</SelectItem>
                  <SelectItem value="Last 24 hours">Last 24 hours</SelectItem>
                  <SelectItem value="Last 3 days">Last 3 days</SelectItem>
                  <SelectItem value="Last week">Last week</SelectItem>
                  <SelectItem value="Last month">Last month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sort by</Label>
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger className="h-9 text-xs rounded-lg border-border/40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Most recent">Most recent</SelectItem>
                  <SelectItem value="Oldest">Oldest</SelectItem>
                  <SelectItem value="A–Z">A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
          {filteredItems.length} result{filteredItems.length === 1 ? "" : "s"}
        </div>

        {/* Cards */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => openProfile({ targetRole: PROFILE_LABEL_TO_ROLE[item.roleLabel], targetId: item.id })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openProfile({ targetRole: PROFILE_LABEL_TO_ROLE[item.roleLabel], targetId: item.id });
                  }
                }}
                className="rounded-xl border border-border/30 bg-card p-3.5 shadow-sm flex items-center gap-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-secondary/40 transition-all duration-200"
              >
                <div
                  className="w-12 h-12 rounded-full text-white font-extrabold text-sm flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(195 56% 38%), hsl(152 52% 46%))" }}
                >
                  {item.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground truncate">{item.name}</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadgeClasses(item.roleLabel)}`}>
                      {item.roleLabel}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">{item.subtitle}</div>
                  <div className="text-[10px] text-muted-foreground/70 mt-1 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {item.viewedAtLabel}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border/40 bg-card/50 p-10 text-center text-sm text-muted-foreground">
            No matching history found.
          </div>
        )}
      </div>

      <BottomNav items={navItems} />
    </div>
  );
}
