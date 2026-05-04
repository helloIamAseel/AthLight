import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, RotateCcw } from "lucide-react";
import type { Filters, Sport } from "./types";
import {
  SPORTS,
  FOOTBALL_POSITIONS,
  PADEL_SIDES,
  COUNTRIES,
  CITIES_BY_COUNTRY,
  DEFAULT_FILTERS,
} from "./constants";
import { getSportAgeRange, validateAgeRangeForSport } from "@/lib/sportAgeConfig";

interface FilterPanelProps {
  draftFilters: Filters;
  onDraftChange: (filters: Filters) => void;
  onApply: (filters: Filters) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function FilterPanel({
  draftFilters,
  onDraftChange,
  onApply,
  onReset,
  onClose,
}: FilterPanelProps) {
  const availableCities = useMemo(
    () => (draftFilters.country ? CITIES_BY_COUNTRY[draftFilters.country] ?? [] : []),
    [draftFilters.country]
  );

  const sportRange = getSportAgeRange(draftFilters.sport);

  const handleAgeChange = (index: 0 | 1, value: string) => {
    const newAgeRange: [number | null, number | null] = [...draftFilters.ageRange] as [number | null, number | null];
    newAgeRange[index] = value === "" ? null : Number(value);
    onDraftChange({ ...draftFilters, ageRange: newAgeRange });
  };

  const ageError = validateAgeRangeForSport(draftFilters.ageRange[0], draftFilters.ageRange[1], draftFilters.sport);

  return (
    <section className="border-b border-border bg-card px-4 py-4 animate-in slide-in-from-top-2 duration-200">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-card-foreground">Filters</h3>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* Min Age */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Min Age</Label>
            <Input
              type="number"
              min={sportRange.min}
              max={sportRange.max}
              placeholder={String(sportRange.min)}
              value={draftFilters.ageRange[0] ?? ""}
              onChange={(e) => handleAgeChange(0, e.target.value)}
              className={`h-9 ${ageError ? "border-destructive" : ""}`}
            />
          </div>

          {/* Max Age */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Max Age</Label>
            <Input
              type="number"
              min={sportRange.min}
              max={sportRange.max}
              placeholder={String(sportRange.max)}
              value={draftFilters.ageRange[1] ?? ""}
              onChange={(e) => handleAgeChange(1, e.target.value)}
              className={`h-9 ${ageError ? "border-destructive" : ""}`}
            />
          </div>

          {/* Sport */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Sport</Label>
            <Select
              value={draftFilters.sport}
              onValueChange={(v) => onDraftChange({ ...draftFilters, sport: v as Sport, position: "" })}
            >
              <SelectTrigger className="h-9"><SelectValue placeholder="All Sports" /></SelectTrigger>
              <SelectContent>
                {SPORTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Position - Football */}
          {draftFilters.sport === "Football" && (
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Position</Label>
              <Select
                value={draftFilters.position}
                onValueChange={(v) => onDraftChange({ ...draftFilters, position: v })}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="All Positions" /></SelectTrigger>
                <SelectContent>
                  {FOOTBALL_POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preferred Side - Padel */}
          {draftFilters.sport === "Padel" && (
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">Preferred Side</Label>
              <Select
                value={draftFilters.position}
                onValueChange={(v) => onDraftChange({ ...draftFilters, position: v })}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="All Sides" /></SelectTrigger>
                <SelectContent>
                  {PADEL_SIDES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Country */}
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Country</Label>
            <Select
              value={draftFilters.country}
              onValueChange={(v) => onDraftChange({ ...draftFilters, country: v, city: "" })}
            >
              <SelectTrigger className="h-9"><SelectValue placeholder="All Countries" /></SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
          {availableCities.length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">City</Label>
              <Select
                value={draftFilters.city}
                onValueChange={(v) => onDraftChange({ ...draftFilters, city: v })}
              >
                <SelectTrigger className="h-9"><SelectValue placeholder="All Cities" /></SelectTrigger>
                <SelectContent>
                  {availableCities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {ageError && <p className="text-xs text-destructive">{ageError}</p>}
        <p className="text-[10px] text-muted-foreground">Age requirements depend on the selected sport.</p>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" disabled={!!ageError} onClick={() => onApply(draftFilters)}>
            Apply Filters
          </Button>
        </div>
      </div>
    </section>
  );
}
