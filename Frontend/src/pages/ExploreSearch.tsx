import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, SlidersHorizontal, X, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getSportAgeRange, validateAgeRangeForSport } from "@/lib/sportAgeConfig";
import { buildProfilePath, type ProfileRole } from "@/lib/profileNavigation";

/* ===================== Types ===================== */

type Sport = "football" | "swimming" | "running" | "padel" | "";
type Role = "athlete" | "coach" | "scout";
type Side = "left" | "right" | "";

type User = {
  id: number;
  name: string;
  sport: Sport;
  role: Role;
  age?: number;
  country: string;
  city: string;
  position?: string;
  preferredSide?: Side;
};

/* ===================== Data ===================== */

const USERS: User[] = [
  { id: 1, name: "Khalid Abdulaziz", sport: "football", role: "athlete", age: 23, country: "Saudi Arabia", city: "Riyadh", position: "Striker (ST)" },
  { id: 2, name: "Fahad Alharbi", sport: "football", role: "coach", country: "Saudi Arabia", city: "Jeddah" },
  { id: 3, name: "Kareem Khalid", sport: "running", role: "scout", country: "Egypt", city: "Cairo" },
  { id: 4, name: "Saleh Mohammed", sport: "swimming", role: "athlete", age: 21, country: "Egypt", city: "Alexandria" },
  { id: 5, name: "Saif Abdullah", sport: "padel", role: "athlete", age: 24, country: "Kuwait", city: "Kuwait City" },
];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "Saudi Arabia": ["Riyadh","Jeddah","Makkah","Madinah","Dammam","Khobar","Dhahran","Taif","Abha","Tabuk","Hail","Yanbu","Najran","Jazan"],
  "United Arab Emirates": ["Abu Dhabi","Dubai","Sharjah","Ajman","Ras Al Khaimah","Fujairah","Al Ain"],
  Egypt: ["Cairo","Giza","Alexandria","Luxor","Aswan","Port Said","Suez"],
  Kuwait: ["Kuwait City","Salmiya","Jahra"],
  Qatar: ["Doha","Al Rayyan","Al Wakrah","Al Khor"],
  Bahrain: ["Manama","Riffa","Muharraq"],
  Oman: ["Muscat","Salalah","Sohar","Nizwa"],
  Jordan: ["Amman","Irbid","Zarqa","Aqaba"],
  Morocco: ["Rabat","Casablanca","Marrakesh","Tangier"],
  Algeria: ["Algiers","Oran","Constantine","Annaba"],
};

const FOOTBALL_POSITIONS = [
  "Goalkeeper (GK)", "Right Back (RB)", "Left Back (LB)", "Center Back (CB)",
  "Defensive Midfielder (CDM)", "Central Midfielder (CM)", "Attacking Midfielder (CAM)",
  "Right Winger (RW)", "Left Winger (LW)", "Striker (ST)",
];

/* ===================== Filters ===================== */

type Filters = {
  sport: Sport;
  role: Role | "";
  position: string;
  preferredSide: Side;
  minAge: string;
  maxAge: string;
  country: string;
  city: string;
};

const DEFAULT_FILTERS: Filters = {
  sport: "",
  role: "",
  position: "",
  preferredSide: "",
  minAge: "",
  maxAge: "",
  country: "",
  city: "",
};

/* ===================== Helpers ===================== */

function roleColor(role: Role) {
  switch (role) {
    case "athlete": return "bg-primary/15 text-primary";
    case "coach": return "bg-secondary/15 text-secondary";
    case "scout": return "bg-accent/20 text-accent-foreground";
  }
}

function roleInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ===================== Component ===================== */

export default function ExploreSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("from") || "/explore";
  // Derive viewer role from the page that sent us here so opened profiles render correctly.
  const viewerRole: ProfileRole = returnTo.startsWith("/coach")
    ? "coach"
    : returnTo.startsWith("/scout")
    ? "scout"
    : "athlete";

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const sportRange = getSportAgeRange(filters.sport);

  const ageError = useMemo(() => {
    if (filters.role !== "athlete") return null;
    const minVal = filters.minAge !== "" ? Number(filters.minAge) : null;
    const maxVal = filters.maxAge !== "" ? Number(filters.maxAge) : null;
    return validateAgeRangeForSport(minVal, maxVal, filters.sport);
  }, [filters.minAge, filters.maxAge, filters.role, filters.sport]);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter((v) => v !== "").length;
  }, [filters]);

  const filterUsers = useCallback((searchQuery: string, appliedFilters: Filters): User[] => {
    const q = searchQuery.toLowerCase();
    return USERS.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(q) ||
        user.sport.toLowerCase().includes(q) ||
        (user.position?.toLowerCase().includes(q) ?? false) ||
        user.city.toLowerCase().includes(q) ||
        user.country.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q);
      if (q && !matchesSearch) return false;
      if (appliedFilters.sport && user.sport !== appliedFilters.sport) return false;
      if (appliedFilters.role && user.role !== appliedFilters.role) return false;
      if (appliedFilters.position && user.position !== appliedFilters.position) return false;
      if (appliedFilters.preferredSide && user.preferredSide !== appliedFilters.preferredSide) return false;
      if (appliedFilters.country && user.country !== appliedFilters.country) return false;
      if (appliedFilters.city && user.city !== appliedFilters.city) return false;
      // Apply age filtering only for athletes
      if (appliedFilters.role === "athlete") {
        const min = Number(appliedFilters.minAge);
        const max = Number(appliedFilters.maxAge);
        if (min && (user.age === undefined || user.age < min)) return false;
        if (max && (user.age === undefined || user.age > max)) return false;
      }
      return true;
    });
  }, []);

  const results = useMemo(() => {
    const noFiltersApplied = !query && Object.values(filters).every((v) => !v);
    if (noFiltersApplied) return [];
    return filterUsers(query, filters);
  }, [query, filters, filterUsers]);

  const applyFilters = () => {
    if (ageError) return;
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  
  };

  const showPosition = filters.role === "athlete" && filters.sport === "football";
  const showSide = filters.role === "athlete" && filters.sport === "padel";
  const showAge = filters.role === "athlete";
  const showCity = !!filters.country;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-card/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <button
            onClick={() => navigate(returnTo)}
            className="shrink-0 flex items-center justify-center h-9 w-9 rounded-xl bg-muted/50 text-foreground/60 hover:bg-secondary/10 hover:text-secondary transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search athlete, coach, scout, city or sport..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="relative shrink-0"
            onClick={() => setShowFilters((v) => !v)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full gradient-teal-green text-[10px] font-bold text-accent-foreground shadow-sm">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <section className="border-b border-border bg-card px-4 py-4">
          <div className="mx-auto max-w-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-card-foreground">Filters</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sport */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Sport</Label>
              <Select
                value={filters.sport || "_all"}
                onValueChange={(v) => {
                  const newSport = (v === "_all" ? "" : v) as Sport;
                  setFilters((prev) => ({ ...prev, sport: newSport, position: "", preferredSide: "", minAge: "", maxAge: "" }));
                  
                }}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Sports" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Sports</SelectItem>
                  <SelectItem value="football">Football</SelectItem>
                  <SelectItem value="swimming">Swimming</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="padel">Padel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Role</Label>
              <Select
                value={filters.role || "_all"}
                onValueChange={(v) => {
                  const newRole = (v === "_all" ? "" : v) as Role | "";
                  setFilters((prev) => ({
                    ...prev,
                    role: newRole,
                    position: "",
                    preferredSide: "",
                    minAge: "",
                    maxAge: "",
                  }));
                }}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Roles</SelectItem>
                  <SelectItem value="athlete">Athlete</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="scout">Scout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Position (football + athlete) */}
            {showPosition && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                <Select
                  value={filters.position || "_all"}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, position: v === "_all" ? "" : v }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Positions" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Positions</SelectItem>
                    {FOOTBALL_POSITIONS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preferred side (padel + athlete) */}
            {showSide && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Preferred Side</Label>
                <Select
                  value={filters.preferredSide || "_all"}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, preferredSide: (v === "_all" ? "" : v) as Side }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="All Sides" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Sides</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Age (all roles) */}
            {showAge && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Age Range</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    placeholder={`Min (${sportRange.min})`}
                    min={sportRange.min}
                    max={sportRange.max}
                    value={filters.minAge}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, minAge: e.target.value }));
                    }}
                    className={`h-9 ${ageError ? "border-destructive" : ""}`}
                  />
                  <Input
                    type="number"
                    placeholder={`Max (${sportRange.max})`}
                    min={sportRange.min}
                    max={sportRange.max}
                    value={filters.maxAge}
                    onChange={(e) => {
                      setFilters((prev) => ({ ...prev, maxAge: e.target.value }));
                    }}
                    className={`h-9 ${ageError ? "border-destructive" : ""}`}
                  />
                </div>
                {ageError && <p className="text-xs text-destructive">{ageError}</p>}
                <p className="text-[10px] text-muted-foreground">Age requirements depend on the selected sport.</p>
              </div>
            )}

            {/* Country */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Country</Label>
              <Select
                value={filters.country || "_all"}
                onValueChange={(v) => setFilters((prev) => ({ ...prev, country: v === "_all" ? "" : v, city: "" }))}
              >
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Countries</SelectItem>
                  {Object.keys(CITIES_BY_COUNTRY).map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* City */}
            {showCity && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">City</Label>
                <Select
                  value={filters.city || "_all"}
                  onValueChange={(v) => setFilters((prev) => ({ ...prev, city: v === "_all" ? "" : v }))}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="City" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Cities</SelectItem>
                    {CITIES_BY_COUNTRY[filters.country]?.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              <Button size="sm" className="flex-1 text-xs" disabled={!!ageError} onClick={applyFilters}>
                Apply Filters
              </Button>
              <Button variant="outline" size="sm" className="text-xs" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      <main className="flex-1 px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {results.length > 0 ? (
            <>
              <p className="text-xs text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
              </p>
              {results.map((user) => (
                <article
                  key={user.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(buildProfilePath({ targetRole: user.role, viewerRole, targetId: user.id }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(buildProfilePath({ targetRole: user.role, viewerRole, targetId: user.id }));
                    }
                  }}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-secondary/40 transition-all duration-200">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-bold">
                      {roleInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate text-sm">{user.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 ${roleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                      {user.sport && (
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {user.sport.charAt(0).toUpperCase() + user.sport.slice(1)}
                        </Badge>
                      )}
                      {user.position && (
                        <span className="text-[10px] text-muted-foreground">{user.position}</span>
                      )}
                      {user.age && (
                        <span className="text-[10px] text-muted-foreground">Age {user.age}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{user.city}, {user.country}</p>
                  </div>
                </article>
              ))}
            </>
          ) : (
            (query || Object.values(filters).some((v) => v)) ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Users className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">No results found</p>
                <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground font-medium">Search for people</p>
                <p className="text-xs text-muted-foreground mt-1">Find athletes, coaches, and scouts by name, sport, or location.</p>
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}
