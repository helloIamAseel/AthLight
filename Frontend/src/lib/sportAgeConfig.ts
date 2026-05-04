import type { Sport } from "@/components/feed/types";

export interface SportAgeRange {
  min: number;
  max: number;
  label: string;
}

const SPORT_AGE_RANGES: Record<string, SportAgeRange> = {
  Football: { min: 16, max: 35, label: "football players" },
  Swimming: { min: 12, max: 40, label: "swimmers" },
  Padel:    { min: 16, max: 60, label: "padel players" },
  Running:  { min: 15, max: 40, label: "runners" },
};

/** Fallback range when no sport is selected */
export const DEFAULT_AGE_RANGE: SportAgeRange = { min: 12, max: 60, label: "athletes" };

/**
 * Get the allowed age range for a given sport.
 * Case-insensitive lookup; returns DEFAULT_AGE_RANGE if sport is empty/unknown.
 */
export function getSportAgeRange(sport: string): SportAgeRange {
  if (!sport) return DEFAULT_AGE_RANGE;
  // Normalize: capitalize first letter
  const key = sport.charAt(0).toUpperCase() + sport.slice(1).toLowerCase();
  return SPORT_AGE_RANGES[key] ?? DEFAULT_AGE_RANGE;
}

/**
 * Validate an age value against a sport's allowed range.
 * Returns an error message string or null if valid.
 */
export function validateAgeForSport(age: number | null, sport: string): string | null {
  if (age === null) return null;
  const range = getSportAgeRange(sport);
  if (age < range.min || age > range.max) {
    return `Age must be between ${range.min} and ${range.max} for ${range.label}.`;
  }
  return null;
}

/**
 * Validate a min/max age range pair against a sport.
 * Returns error string or null.
 */
export function validateAgeRangeForSport(
  minAge: number | null,
  maxAge: number | null,
  sport: string
): string | null {
  const range = getSportAgeRange(sport);
  if (minAge !== null && (minAge < range.min || minAge > range.max))
    return `Age must be between ${range.min} and ${range.max} for ${range.label}.`;
  if (maxAge !== null && (maxAge < range.min || maxAge > range.max))
    return `Age must be between ${range.min} and ${range.max} for ${range.label}.`;
  if (minAge !== null && maxAge !== null && minAge > maxAge)
    return "Min age must be ≤ max age";
  return null;
}
