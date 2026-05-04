import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Play, Star, Trash2, Calendar, Zap, Ruler, Activity, ArrowLeft, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import StatPill from "@/components/feed/StatPill";
import { useProfilePermissions } from "@/hooks/useProfilePermissions";

type VideoItem = {
  id: number;
  title: string;
  type: "Match" | "Training";
  feedback: string;
  score: number;
  views: string;
  uploadedAt: string;
  duration: string;
  favorite?: boolean;
  stats: { speed: string; distance: string; agility: string };
};

export default function AthleteVideos() {
  const { isOwner, viewerQuery } = useProfilePermissions("athlete");

  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("highest");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  const [videos, setVideos] = useState<VideoItem[]>([
    {
      id: 1, title: "Match Highlight", type: "Match",
      feedback: "Coach Feedback: Excellent movement, better scanning before final touch.",
      score: 8.9, views: "2.1k views", uploadedAt: "Uploaded on March 10, 2026",
      duration: "02:14", favorite: true,
      stats: { speed: "32 km/h", distance: "9.4 km", agility: "88" },
    },
    {
      id: 2, title: "Acceleration Drill", type: "Training",
      feedback: "Coach Feedback: Strong explosive movement and improved reaction speed.",
      score: 8.4, views: "1.7k views", uploadedAt: "Uploaded on March 08, 2026",
      duration: "01:47", favorite: false,
      stats: { speed: "29 km/h", distance: "7.2 km", agility: "91" },
    },
    {
      id: 3, title: "Goal Opportunity", type: "Match",
      feedback: "Coach Feedback: Great positioning inside the box and quick finishing choice.",
      score: 9.1, views: "3.8k views", uploadedAt: "Uploaded on March 06, 2026",
      duration: "03:02", favorite: true,
      stats: { speed: "34 km/h", distance: "10.1 km", agility: "85" },
    },
    {
      id: 4, title: "Ball Control Session", type: "Training",
      feedback: "Coach Feedback: Cleaner first touch, but balance can improve under pressure.",
      score: 7.9, views: "980 views", uploadedAt: "Uploaded on March 03, 2026",
      duration: "02:28", favorite: false,
      stats: { speed: "27 km/h", distance: "6.8 km", agility: "82" },
    },
    {
      id: 5, title: "Pressing Sequence", type: "Match",
      feedback: "Coach Feedback: Good pressing intensity and faster transition recovery.",
      score: 8.3, views: "1.3k views", uploadedAt: "Uploaded on February 28, 2026",
      duration: "01:56", favorite: false,
      stats: { speed: "30 km/h", distance: "8.5 km", agility: "87" },
    },
    {
      id: 6, title: "Finishing Practice", type: "Training",
      feedback: "Coach Feedback: Strong shot power, needs more consistency on weak foot finishing.",
      score: 8.0, views: "1.1k views", uploadedAt: "Uploaded on February 24, 2026",
      duration: "02:41", favorite: true,
      stats: { speed: "28 km/h", distance: "7.0 km", agility: "84" },
    },
  ]);

  const openDeleteModal = (id: number) => { setSelectedVideoId(id); setShowDeleteModal(true); };
  const confirmDelete = () => {
    if (selectedVideoId !== null) setVideos(prev => prev.filter(v => v.id !== selectedVideoId));
    setShowDeleteModal(false); setSelectedVideoId(null);
  };
  const cancelDelete = () => { setShowDeleteModal(false); setSelectedVideoId(null); };
  const toggleFavorite = (id: number) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, favorite: !v.favorite } : v));
  };

  const filteredVideos = useMemo(() => {
    let result = [...videos];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v => v.title.toLowerCase().includes(q) || v.feedback.toLowerCase().includes(q) || v.type.toLowerCase().includes(q));
    }
    if (typeFilter !== "all") result = result.filter(v => v.type.toLowerCase() === typeFilter);
    if (sortOption === "highest") result.sort((a, b) => b.score - a.score);
    if (sortOption === "views") result.sort((a, b) => parseFloat(b.views) - parseFloat(a.views));
    if (sortOption === "newest") result = [...result].reverse();
    return result;
  }, [videos, search, sortOption, typeFilter]);

  const totalVideos = videos.length;
  const topRatedCount = videos.filter(v => v.score >= 8.5).length;
  const matchCount = videos.filter(v => v.type === "Match").length;
  const trainingCount = videos.filter(v => v.type === "Training").length;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-6">

        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">Athlete Videos</h1>
            <p className="text-sm text-muted-foreground">Browse match and training clips</p>
          </div>
          <Link to={`/athlete-profile${viewerQuery}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft size={14} /> Back to Profile
            </Button>
          </Link>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Videos", value: totalVideos },
            { label: "Top Rated", value: topRatedCount },
            { label: "Match Videos", value: matchCount },
            { label: "Training Videos", value: trainingCount },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-card p-3 text-center shadow-sm">
              <strong className="text-lg font-bold text-foreground">{s.value}</strong>
              <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-[34px] text-xs"
            />
          </div>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="h-[34px] min-w-0 w-auto px-2.5 text-xs font-medium rounded-lg border-border bg-card hover:border-secondary/40 hover:bg-secondary/[0.04] focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highest">Highest Rated</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-[34px] min-w-0 w-auto px-2.5 text-xs font-medium rounded-lg border-border bg-card hover:border-secondary/40 hover:bg-secondary/[0.04] focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="match">Match</SelectItem>
              <SelectItem value="training">Training</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Videos Grid — EXACT same card style as AthleteProfile / Explore / Feeds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map(video => (
            <article key={video.id} className="rounded-xl border border-border/50 bg-card shadow-sm spotlight-hover spotlight-border transition-all duration-300 overflow-hidden group">
              {/* Thumbnail */}
              <section className="relative aspect-video flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/6 via-secondary/4 to-accent/3 border-b border-border/30">
                {/* Actions overlay — owner only */}
                {isOwner && (
                  <div className="absolute top-2 right-2 flex gap-1.5 z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => toggleFavorite(video.id)}
                      title={video.favorite ? "Remove favorite" : "Add to favorite"}
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/30 text-background backdrop-blur-sm transition-all duration-200 hover:bg-foreground/60 hover:scale-110"
                    >
                      <Star size={13} className={video.favorite ? "fill-yellow-400 text-yellow-400" : ""} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(video.id)}
                      title="Delete video"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/30 text-background backdrop-blur-sm transition-all duration-200 hover:bg-destructive/70 hover:scale-110"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                {/* Play */}
                <button type="button" aria-label="Play" className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full gradient-brand text-primary-foreground shadow-glow hover:shadow-xl hover:scale-110 transition-all duration-300">
                  <Play className="h-6 w-6 ml-0.5" />
                </button>

                {/* Duration — bottom-right */}
                <span className="absolute bottom-2 right-2 rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-semibold text-background backdrop-blur-sm">{video.duration}</span>
              </section>

              {/* Performance Metrics — SAME as Explore/Feeds */}
              <section className="grid grid-cols-3 gap-1.5 px-3 pt-2.5 pb-0">
                <StatPill icon={<Zap className="h-3 w-3 text-primary" />} label="Speed" value={video.stats.speed} />
                <StatPill icon={<Ruler className="h-3 w-3 text-secondary" />} label="Distance" value={video.stats.distance} />
                <StatPill icon={<Activity className="h-3 w-3 text-accent-foreground" />} label="Agility" value={video.stats.agility} />
              </section>

              {/* Content */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-secondary">{video.type}</span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar size={11} className="shrink-0" />
                    <span className="whitespace-nowrap">{video.uploadedAt.replace("Uploaded on ", "")}</span>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-1">{video.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed mb-2 line-clamp-2">{video.feedback}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary">Score {video.score}</span>
                  <span className="text-[11px] text-muted-foreground">{video.views}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground font-medium">No videos found.</p>
            <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="rounded-xl border border-border bg-card p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-base font-bold text-foreground mb-2">Delete Video?</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete this video?</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={cancelDelete}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
