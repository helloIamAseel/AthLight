export type Sport = "Football" | "Padel" | "Swimming" | "Running";
export type Tab = "Feed" | "Following";

export interface Stats {
  speed: string;
  distance: string;
  agility: number;
}

export interface Athlete {
  id: string;
  name: string;
  avatarUrl: string;
  tag?: string;
  sport: Sport;
  position: string;
  country: string;
  city: string;
  age: number;
  timeAgo: string;
  videoDuration: string;
  views: string;
  stats: Stats;
}

export interface Filters {
  sport: Sport | "";
  position: string;
  country: string;
  city: string;
  ageRange: [number | null, number | null];
}
