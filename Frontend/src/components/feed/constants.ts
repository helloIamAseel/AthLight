import type { Sport, Filters, Athlete } from "./types";

export const SPORTS: Sport[] = ["Football", "Padel", "Swimming", "Running"];

export const FOOTBALL_POSITIONS = [
  { label: "Goalkeeper (GK)", value: "GK" },
  { label: "Right Back (RB)", value: "RB" },
  { label: "Left Back (LB)", value: "LB" },
  { label: "Center Back (CB)", value: "CB" },
  { label: "Sweeper (SW)", value: "SW" },
  { label: "Defensive Midfielder (CDM)", value: "CDM" },
  { label: "Central Midfielder (CM)", value: "CM" },
  { label: "Attacking Midfielder (CAM)", value: "CAM" },
  { label: "Right Winger (RW)", value: "RW" },
  { label: "Left Winger (LW)", value: "LW" },
  { label: "Striker (ST)", value: "ST" },
];

export const PADEL_SIDES = ["Right", "Left"];

export const DEFAULT_FILTERS: Filters = {
  ageRange: [null, null],
  sport: "",
  position: "",
  country: "",
  city: "",
};

export { getSportAgeRange, validateAgeRangeForSport, DEFAULT_AGE_RANGE } from "@/lib/sportAgeConfig";

/** @deprecated Use getSportAgeRange instead */
export const MIN_AGE = 12;
/** @deprecated Use getSportAgeRange instead */
export const MAX_AGE = 60;

export const FALLBACK_AVATAR =
  "https://images.unsplash.com/photo-1521417531039-5fcbfe60a9b4?w=120&h=120&fit=crop&q=80";

export const COUNTRIES = [
  "Saudi Arabia", "United Arab Emirates", "Egypt", "Kuwait",
  "Qatar", "Bahrain", "Oman", "Jordan", "Morocco", "Algeria",
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  "Saudi Arabia": ["Riyadh", "Jeddah", "Makkah", "Madinah", "Dammam", "Khobar", "Dhahran", "Taif", "Abha", "Tabuk", "Hail", "Yanbu", "Najran", "Jazan"],
  "United Arab Emirates": ["Abu Dhabi", "Dubai", "Sharjah", "Ajman", "Ras Al Khaimah", "Fujairah", "Al Ain"],
  Egypt: ["Cairo", "Giza", "Alexandria", "Luxor", "Aswan", "Port Said", "Suez"],
  Kuwait: ["Kuwait City", "Salmiya", "Jahra"],
  Qatar: ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor"],
  Bahrain: ["Manama", "Riffa", "Muharraq"],
  Oman: ["Muscat", "Salalah", "Sohar", "Nizwa"],
  Jordan: ["Amman", "Irbid", "Zarqa", "Aqaba"],
  Morocco: ["Rabat", "Casablanca", "Marrakesh", "Tangier"],
  Algeria: ["Algiers", "Oran", "Constantine", "Annaba"],
};

export const MOCK_ATHLETES: Athlete[] = [
  {
    id: "1",
    name: "Khalid Alharbi",
    avatarUrl: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=120&h=120&fit=crop&q=80",
    tag: "Striker",
    sport: "Football",
    position: "Striker (ST)",
    country: "Saudi Arabia",
    city: "Riyadh",
    age: 22,
    timeAgo: "12 min ago",
    videoDuration: "2:34",
    views: "1.2k",
    stats: { speed: "28 km/h", distance: "4 km", agility: 92 },
  },
  {
    id: "2",
    name: "Fahad Al-Otaibi",
    avatarUrl: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=120&h=120&fit=crop&q=80",
    tag: "Midfielder",
    sport: "Football",
    position: "Striker (ST)",
    country: "Saudi Arabia",
    city: "Jeddah",
    age: 24,
    timeAgo: "1h ago",
    videoDuration: "1:15",
    views: "3k",
    stats: { speed: "22 km/h", distance: "10 km", agility: 85 },
  },
  {
    id: "3",
    name: "Mohammad Al-Otaibi",
    avatarUrl: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=120&h=120&fit=crop&q=80",
    tag: "Goalkeeper",
    sport: "Football",
    position: "Central Midfielder (CM)",
    country: "Saudi Arabia",
    city: "Jeddah",
    age: 24,
    timeAgo: "1h ago",
    videoDuration: "1:15",
    views: "3k",
    stats: { speed: "22 km/h", distance: "10 km", agility: 85 },
  },
];

export function matchesFilters(a: Athlete, filters: Filters, q: string): boolean {
  const query = q.toLowerCase();
  const [minAge, maxAge] = filters.ageRange;
  if (minAge !== null && a.age < minAge) return false;
  if (maxAge !== null && a.age > maxAge) return false;
  if (filters.sport && a.sport !== filters.sport) return false;
  if (filters.position && a.position !== filters.position) return false;
  if (filters.country && a.country !== filters.country) return false;
  if (filters.city && a.city !== filters.city) return false;
  if (q && !a.name.toLowerCase().includes(query)) return false;
  return true;
}
