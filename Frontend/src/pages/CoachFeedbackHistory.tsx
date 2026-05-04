import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Search, RotateCcw, CalendarDays, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import DeleteConfirmCard from "@/components/delete/DeleteConfirmCard";
import AppDatePicker from "@/components/AppDatePicker";
import { useOpenProfile } from "@/lib/profileNavigation";

/* ===================== Types ===================== */

type VideoType = "training" | "match";

export type FeedbackItem = {
  id: string;
  playerName: string;
  videoType: VideoType;
  score: number;
  date: string;
  comment: string;
};

type ScoreFilter = "all" | "high" | "medium" | "low";

type DateFilter =
  | { kind: "all" }
  | { kind: "today" }
  | { kind: "yesterday" }
  | { kind: "last7" }
  | { kind: "thisMonth" }
  | { kind: "pastMonth" }
  | { kind: "past3Months" }
  | { kind: "month"; year: number; monthIndex: number }
  | { kind: "range"; from: string; to: string };

/* ===================== Helpers ===================== */

function matchesScore(score: number, filter: ScoreFilter) {
  if (filter === "all") return true;
  if (filter === "high") return score >= 7;
  if (filter === "medium") return score >= 4 && score < 7;
  return score < 4;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}
function endOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function startOfNextMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function fmtMonth(year: number, monthIndex: number) {
  return `${MONTH_NAMES[monthIndex]} ${year}`;
}

function labelDateFilter(f: DateFilter) {
  if (f.kind === "all") return "All dates";
  if (f.kind === "today") return "Today";
  if (f.kind === "yesterday") return "Yesterday";
  if (f.kind === "last7") return "Last 7 Days";
  if (f.kind === "thisMonth") return "This Month";
  if (f.kind === "pastMonth") return "Past Month";
  if (f.kind === "past3Months") return "Past 3 Months";
  if (f.kind === "month") return fmtMonth(f.year, f.monthIndex);
  return `${f.from} → ${f.to}`;
}

function matchesDate(dateIso: string, filter: DateFilter) {
  if (filter.kind === "all") return true;
  const itemDate = new Date(dateIso);
  const now = new Date();

  if (filter.kind === "today") return itemDate >= startOfDay(now) && itemDate <= endOfDay(now);
  if (filter.kind === "yesterday") {
    const y = new Date(now); y.setDate(now.getDate() - 1);
    return itemDate >= startOfDay(y) && itemDate <= endOfDay(y);
  }
  if (filter.kind === "last7") {
    const a = new Date(now); a.setDate(now.getDate() - 6);
    return itemDate >= startOfDay(a) && itemDate <= endOfDay(now);
  }
  if (filter.kind === "thisMonth") return itemDate >= startOfMonth(now) && itemDate < startOfNextMonth(now);
  if (filter.kind === "pastMonth") {
    const a = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const b = new Date(now.getFullYear(), now.getMonth(), 1);
    return itemDate >= a && itemDate < b;
  }
  if (filter.kind === "past3Months") {
    const a = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    return itemDate >= a && itemDate <= endOfDay(now);
  }
  if (filter.kind === "month") {
    const a = new Date(filter.year, filter.monthIndex, 1);
    const b = new Date(filter.year, filter.monthIndex + 1, 1);
    return itemDate >= a && itemDate < b;
  }
  if (filter.kind === "range") {
    const from = new Date(`${filter.from}T00:00:00`);
    const to = new Date(`${filter.to}T23:59:59`);
    return itemDate >= from && itemDate <= to;
  }
  return true;
}

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ===================== DateFilterDropdown ===================== */

function DateFilterDropdown({
  value,
  onChange,
  monthOptions,
}: {
  value: DateFilter;
  onChange: (v: DateFilter) => void;
  monthOptions: Array<{ year: number; monthIndex: number }>;
}) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(value.kind === "range" ? value.from : "");
  const [to, setTo] = useState(value.kind === "range" ? value.to : "");
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const label = useMemo(() => labelDateFilter(value), [value]);

  const quickPicks: Array<{ key: Exclude<DateFilter["kind"], "month" | "range">; label: string }> = [
    { key: "all", label: "All" },
    { key: "today", label: "Today" },
    { key: "yesterday", label: "Yesterday" },
    { key: "last7", label: "Last 7 Days" },
    { key: "thisMonth", label: "This Month" },
    { key: "pastMonth", label: "Past Month" },
    { key: "past3Months", label: "Past 3 Months" },
  ];

  const toggleOpen = () => {
    if (!open) {
      if (value.kind === "range") { setFrom(value.from); setTo(value.to); }
      else { setFrom(""); setTo(""); }
    }
    setOpen((s) => !s);
  };

  const pick = (v: DateFilter) => { onChange(v); setOpen(false); };

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={toggleOpen}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-border/40 bg-card text-xs font-medium text-foreground hover:border-secondary/40 hover:bg-secondary/[0.04] transition-all duration-200"
      >
        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
        {label}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-64 rounded-xl border border-border/40 bg-card p-3.5 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Quick picks</p>
          <div className="flex flex-wrap gap-1.5">
            {quickPicks.map((q) => (
              <button
                key={q.key}
                type="button"
                onClick={() => pick({ kind: q.key } as DateFilter)}
                className="rounded-lg bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-foreground/70 hover:bg-secondary/15 hover:text-secondary transition-colors"
              >
                {q.label}
              </button>
            ))}
          </div>

          {monthOptions.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Months</p>
              <div className="flex flex-col gap-0.5">
                {monthOptions.slice(0, 6).map((m) => (
                  <button
                    key={`${m.year}-${m.monthIndex}`}
                    type="button"
                    onClick={() => pick({ kind: "month", year: m.year, monthIndex: m.monthIndex })}
                    className="rounded-lg px-2.5 py-1.5 text-left text-xs text-foreground/70 hover:bg-muted/60 transition-colors"
                  >
                    {fmtMonth(m.year, m.monthIndex)}
                  </button>
                ))}
              </div>
            </>
          )}

          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Custom range</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-10">From</label>
              <AppDatePicker
                value={from}
                onChange={setFrom}
                placeholder="Start date"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-10">To</label>
              <AppDatePicker
                value={to}
                onChange={setTo}
                placeholder="End date"
                className="flex-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 text-xs h-8 rounded-lg"
                disabled={!from || !to}
                onClick={() => { if (from && to) { onChange({ kind: "range", from, to }); setOpen(false); } }}
              >
                Apply
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 rounded-lg"
                onClick={() => { setFrom(""); setTo(""); onChange({ kind: "all" }); setOpen(false); }}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== Demo Data ===================== */

const DEMO: FeedbackItem[] = [
  {
    id: "1", playerName: "Ahmed Ali", videoType: "match", score: 8.5,
    date: "2026-01-20T18:30:00Z",
    comment: "Great positioning and timing, keep scanning before receiving.",
  },
  {
    id: "2", playerName: "Sara Noor", videoType: "training", score: 6.2,
    date: "2026-01-18T09:00:00Z",
    comment: "Good intensity, but work on first touch under pressure.",
  },
  {
    id: "3", playerName: "Ahmed Ali", videoType: "training", score: 3.6,
    date: "2025-12-22T15:10:00Z",
    comment: "Needs improvement in stamina and recovery runs.",
  },
  {
    id: "4", playerName: "Maha Sami", videoType: "match", score: 7.0,
    date: "2025-11-05T20:45:00Z",
    comment: "Solid decisions, improve communication with back line.",
  },
];

/* ===================== Page ===================== */

import { getSportAgeRange, validateAgeRangeForSport } from "@/lib/sportAgeConfig";
import { useRoleNav } from "@/hooks/useRoleNav";
import PageHeader from "@/components/feed/PageHeader";
import BottomNav from "@/components/feed/BottomNav";

export default function CoachFeedbackHistory({ items = DEMO }: { items?: FeedbackItem[] }) {
  const navigate = useNavigate();
  const { navItems } = useRoleNav({ role: "coach" });
  const openProfile = useOpenProfile("coach");
  const [searchName, setSearchName] = useState("");
  const [videoFilter, setVideoFilter] = useState<"all" | VideoType>("all");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>({ kind: "all" });
  const [ageRange, setAgeRange] = useState<[number | null, number | null]>([null, null]);
  const [sportFilter, setSportFilter] = useState("");
  const sportRange = getSportAgeRange(sportFilter);
  const [deleteTarget, setDeleteTarget] = useState<FeedbackItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 700));
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const monthOptions = useMemo(() => {
    const seen = new Set<string>();
    const list: Array<{ year: number; monthIndex: number }> = [];
    for (const it of items) {
      const d = new Date(it.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(key)) { seen.add(key); list.push({ year: d.getFullYear(), monthIndex: d.getMonth() }); }
    }
    list.sort((a, b) => (b.year - a.year) || (b.monthIndex - a.monthIndex));
    return list;
  }, [items]);

  const filtered = useMemo(() => {
    const q = searchName.trim().toLowerCase();
    return items
      .filter((it) => {
        if (q && !it.playerName.toLowerCase().includes(q)) return false;
        if (videoFilter !== "all" && it.videoType !== videoFilter) return false;
        if (!matchesScore(it.score, scoreFilter)) return false;
        if (!matchesDate(it.date, dateFilter)) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [items, searchName, videoFilter, scoreFilter, dateFilter]);

  const handleAgeChange = (index: 0 | 1, value: string) => {
    const newRange: [number | null, number | null] = [...ageRange] as [number | null, number | null];
    newRange[index] = value === "" ? null : Number(value);
    setAgeRange(newRange);
  };

  const ageError = validateAgeRangeForSport(ageRange[0], ageRange[1], sportFilter);

  const resetFilters = () => {
    setSearchName("");
    setVideoFilter("all");
    setScoreFilter("all");
    setDateFilter({ kind: "all" });
    setAgeRange([null, null]);
    setSportFilter("");
  };

  const videoTabs: Array<{ key: "all" | VideoType; label: string }> = [
    { key: "all", label: "All" },
    { key: "training", label: "Training" },
    { key: "match", label: "Match" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pb-20">
      <PageHeader
        title="Feedback History"
        subtitle="Review all feedback you've sent"
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

      {/* ── Content ── */}
      <div className="mx-auto max-w-3xl px-5 pt-3 pb-5">

        {/* ── Filters Card ── */}
        <div className="rounded-xl border border-border/30 bg-card p-4 shadow-sm mb-3">

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              type="search"
              placeholder="Search player name…"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="pl-10 h-10 text-sm rounded-lg border-border/40 focus:border-secondary/50 bg-muted/20"
            />
          </div>

          {/* Filter Controls Row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Video Type Tabs */}
            <div className="inline-flex rounded-lg border border-border/30 overflow-hidden">
              {videoTabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setVideoFilter(t.key)}
                  className={`px-3.5 py-2 text-[11px] font-semibold transition-all duration-200 ${
                    videoFilter === t.key
                      ? "gradient-brand text-white"
                      : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Score */}
            <Select value={scoreFilter} onValueChange={(v) => setScoreFilter(v as ScoreFilter)}>
              <SelectTrigger className="h-9 w-[130px] text-[11px] rounded-lg border-border/40">
                <SelectValue placeholder="All scores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All scores</SelectItem>
                <SelectItem value="high">≥ 7 (High)</SelectItem>
                <SelectItem value="medium">4 – 6.9 (Mid)</SelectItem>
                <SelectItem value="low">&lt; 4 (Low)</SelectItem>
              </SelectContent>
            </Select>

            {/* Date */}
            <DateFilterDropdown value={dateFilter} onChange={setDateFilter} monthOptions={monthOptions} />
          </div>

          {/* Sport & Age — collapsed row */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-[150px]">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Sport</Label>
              <Select value={sportFilter || "_all"} onValueChange={(v) => { setSportFilter(v === "_all" ? "" : v); setAgeRange([null, null]); }}>
                <SelectTrigger className="h-9 text-xs rounded-lg border-border/40">
                  <SelectValue placeholder="All Sports" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all">All Sports</SelectItem>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Swimming">Swimming</SelectItem>
                  <SelectItem value="Padel">Padel</SelectItem>
                  <SelectItem value="Running">Running</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[90px]">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Min Age</Label>
              <Input
                type="number"
                min={sportRange.min}
                max={sportRange.max}
                placeholder={String(sportRange.min)}
                value={ageRange[0] ?? ""}
                onChange={(e) => handleAgeChange(0, e.target.value)}
                className={`h-9 text-xs rounded-lg border-border/40 ${ageError ? "border-destructive" : ""}`}
              />
            </div>
            <div className="w-[90px]">
              <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Max Age</Label>
              <Input
                type="number"
                min={sportRange.min}
                max={sportRange.max}
                placeholder={String(sportRange.max)}
                value={ageRange[1] ?? ""}
                onChange={(e) => handleAgeChange(1, e.target.value)}
                className={`h-9 text-xs rounded-lg border-border/40 ${ageError ? "border-destructive" : ""}`}
              />
            </div>
          </div>
          {ageError && <p className="text-[11px] text-destructive mt-2">{ageError}</p>}
        </div>

        {/* ── Results ── */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground">
            Showing <span className="text-foreground font-bold">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-border/20 bg-card/50">
            <div className="h-14 w-14 rounded-full bg-muted/40 flex items-center justify-center mb-3">
              <Search className="h-6 w-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-semibold text-foreground">No results found</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((it) => {
              const isHigh = it.score >= 7;
              const isMed = it.score >= 4 && it.score < 7;
              return (
                <article
                  key={it.id}
                  className="group rounded-xl border border-border/30 bg-card p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  {/* Row 1: Name + Type + Score */}
                  <div className="flex items-start gap-3">
                    {/* Name + Meta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <button
                          type="button"
                          onClick={() => openProfile({ targetRole: "athlete", targetId: it.id })}
                          className="text-sm font-bold text-foreground truncate hover:text-secondary transition-colors text-left"
                        >
                          {it.playerName}
                        </button>
                        <span className={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${
                          it.videoType === "training"
                            ? "bg-gradient-to-r from-secondary to-[hsl(152_52%_46%)]"
                            : "bg-gradient-to-r from-primary to-secondary"
                        }`}>
                          {it.videoType === "training" ? "Training" : "Match"}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">{formatDateShort(it.date)}</p>
                    </div>

                    {/* Score Badge */}
                    <div
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-extrabold text-white ${
                        isHigh
                          ? "bg-gradient-to-r from-[hsl(152_52%_46%)] to-[hsl(149_46%_56%)]"
                          : isMed
                          ? "bg-gradient-to-r from-[hsl(45_80%_50%)] to-[hsl(53_82%_63%)]"
                          : "bg-gradient-to-r from-destructive to-[hsl(0_60%_55%)]"
                      }`}
                    >
                      {it.score.toFixed(1)}/10
                    </div>
                  </div>

                  {/* Feedback */}
                  <p className="text-[13px] text-muted-foreground leading-relaxed mt-3">{it.comment}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border/20">
                    <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1 px-2 text-foreground/60 hover:text-secondary hover:bg-secondary/10 rounded-lg">
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[11px] h-7 px-2 text-foreground/40 hover:text-destructive hover:bg-destructive/10 gap-1 rounded-lg"
                      onClick={() => setDeleteTarget(it)}
                    >
                      <Trash2 className="h-3 w-3" /> Delete
                    </Button>
                    <div className="ml-auto">
                      <Button variant="ghost" size="sm" className="text-[11px] h-7 gap-1 px-2 font-semibold text-secondary hover:bg-secondary/10 rounded-lg">
                        View Video <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation overlay */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <DeleteConfirmCard
            open={!!deleteTarget}
            kind="feedback"
            itemName={`${deleteTarget.playerName} - ${deleteTarget.videoType}`}
            layout="inline"
            loading={deleteLoading}
            onCancel={() => { if (!deleteLoading) setDeleteTarget(null); }}
            onConfirm={handleDeleteConfirm}
          />
        </div>
      )}

      <BottomNav items={navItems} />
    </div>
  );
}
