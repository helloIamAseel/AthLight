import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Pencil, Play, Star, Trash2, Calendar, Zap, Ruler, Activity } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StatPill from "@/components/feed/StatPill";
import SendFeedbackModal from "@/components/SendFeedbackModal";
import { useProfilePermissions } from "@/hooks/useProfilePermissions";
import "./AthleteProfile.css";
import athlightLogo from "@/assets/athlight_logo_v2.png";
import athlightLogoOriginal from "@/assets/athlight_logo.png";

type TabId = "bio" | "injuries";

type ProfileVideoItem = {
  id: number;
  title: string;
  type: "Match" | "Training";
  feedback: string;
  score: number;
  views: string;
  uploadedAt: string;
  duration: string;
  status: "Top Rated" | "Trending" | "New";
  favorite?: boolean;
  thumb: string;
  stats: { speed: string; distance: string; agility: string };
};

export default function AthleteProfile() {
  const navigate = useNavigate();
  const { viewer, isOwner, isCoachViewer, viewerQuery, canViewAthleteReports } =
    useProfilePermissions("athlete");

  const handleReturnToApp = () => navigate("/feed");

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("bio");
  const [activeNav, setActiveNav] = useState("overview");
  const [showVideoDeleteModal, setShowVideoDeleteModal] = useState(false);
  const [selectedProfileVideoId, setSelectedProfileVideoId] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const [topVideos, setTopVideos] = useState<ProfileVideoItem[]>([
    {
      id: 1,
      title: "Match Highlight",
      type: "Match",
      feedback: "Coach Feedback: Excellent movement, better scanning before final touch.",
      score: 8.9,
      views: "2.1k views",
      uploadedAt: "Uploaded on March 10, 2026",
      duration: "02:14",
      status: "Top Rated",
      favorite: true,
      thumb: "linear-gradient(135deg,#0f766e,#14b8a6,#facc15)",
      stats: { speed: "32 km/h", distance: "9.4 km", agility: "88" },
    },
    {
      id: 2,
      title: "Acceleration Drill",
      type: "Training",
      feedback: "Coach Feedback: Strong explosive movement and improved reaction speed.",
      score: 8.4,
      views: "1.7k views",
      uploadedAt: "Uploaded on March 08, 2026",
      duration: "01:47",
      status: "Trending",
      favorite: false,
      thumb: "linear-gradient(135deg,#0369a1,#38bdf8)",
      stats: { speed: "29 km/h", distance: "7.2 km", agility: "91" },
    },
    {
      id: 3,
      title: "Goal Opportunity",
      type: "Match",
      feedback: "Coach Feedback: Great positioning inside the box and quick finishing choice.",
      score: 9.1,
      views: "3.8k views",
      uploadedAt: "Uploaded on March 06, 2026",
      duration: "03:02",
      status: "Top Rated",
      favorite: true,
      thumb: "linear-gradient(135deg,#059669,#a3e635)",
      stats: { speed: "34 km/h", distance: "10.1 km", agility: "85" },
    },
  ]);

  const openProfileVideoDeleteModal = (id: number) => {
    setSelectedProfileVideoId(id);
    setShowVideoDeleteModal(true);
  };

  const confirmProfileVideoDelete = () => {
    if (selectedProfileVideoId !== null) {
      setTopVideos((prev) => prev.filter((video) => video.id !== selectedProfileVideoId));
    }
    setShowVideoDeleteModal(false);
    setSelectedProfileVideoId(null);
  };

  const cancelProfileVideoDelete = () => {
    setShowVideoDeleteModal(false);
    setSelectedProfileVideoId(null);
  };

  const toggleProfileVideoFavorite = (id: number) => {
    setTopVideos((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, favorite: !video.favorite } : video
      )
    );
  };

  // Scroll-based nav highlighting
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionIds = ["overview-section", "dashboard-section", "videos-section"];
    const navMap: Record<string, string> = {
      "overview-section": "overview",
      "dashboard-section": "dashboard",
      "videos-section": "videos",
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the most visible section
        let best: { id: string; ratio: number } | null = null;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.ratio) {
              best = { id: entry.target.id, ratio: entry.intersectionRatio };
            }
          }
        });
        if (best) {
          setActiveNav(navMap[best.id]);
        }
      },
      {
        root: mainRef.current,
        threshold: [0, 0.1, 0.2, 0.3, 0.5],
        rootMargin: "-10% 0px -60% 0px",
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="athlete-profile-page">

      <div className="shell">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div>
            {/* Brand — click to return to app */}
            <button
              type="button"
              className="brand brand-clickable"
              onClick={handleReturnToApp}
              title="Return to app"
              aria-label="Return to app"
            >
              <img src={athlightLogoOriginal} alt="AthLight" style={{ width: 36, height: 36, objectFit: "contain", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.12)", padding: 2 }} />
              <span className="brand-name">AthLight</span>
            </button>

            {/* Main Nav */}
            <div className="nav-label">Main</div>

            <button
              className={`nav-item ${activeNav === "overview" ? "active" : ""}`}
              onClick={() => { setActiveNav("overview"); scrollToSection("overview-section"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Overview
            </button>

            <button
              className={`nav-item ${activeNav === "dashboard" ? "active" : ""}`}
              onClick={() => { setActiveNav("dashboard"); scrollToSection("dashboard-section"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Dashboard
            </button>

            <button
              className={`nav-item ${activeNav === "videos" ? "active" : ""}`}
              onClick={() => { setActiveNav("videos"); scrollToSection("videos-section"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" />
              </svg>
              Videos
            </button>

            {/* Reports — visible to athlete owner, coach viewer, scout viewer.
                Hidden when viewer="other" (another athlete looking at this profile). */}
            {canViewAthleteReports && (
              <>
                <div className="nav-label" style={{ marginTop: 18 }}>{isOwner ? "Account" : "Athlete"}</div>
                <button
                  type="button"
                  className="nav-item"
                  onClick={() => navigate(`/reports${viewerQuery}`)}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  Reports
                </button>
              </>
            )}

          </div>

          {/* Sidebar Bottom */}
          <div className="sidebar-bottom">
            <div className="athlete-mini">
              <div className="avatar-sm">MA</div>
              <div className="athlete-mini-info">
                <div className="athlete-mini-name">Mohammed Al-Harbi</div>
                <div className="athlete-mini-sub">Athlete · Al Hilal</div>
              </div>
              {isOwner && (
                <button
                  className="logout-icon-btn"
                  onClick={() => setShowLogoutModal(true)}
                  title="Log out"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main" ref={mainRef}>

          {/* ── Overview Section ── */}
          <section id="overview-section" className={`overview-grid ${!isOwner ? "overview-grid-full" : ""}`}>

            {/* Left: Profile Card */}
            <div className="card profile-card">

              {/* Card Top Row */}
              <div className="profile-card-toprow">
                <div className="profile-header">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar">MA</div>
                    <div className="verified-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  <div className="profile-name">
                    <h2>Mohammed Al-Harbi</h2>

                    {/* Stats Row */}
                    <div className="profile-stats-row">
                      <div className="profile-stat">
                        <span className="ps-num">1253</span>
                        <span className="ps-lbl">Followers</span>
                      </div>
                      <div className="profile-stat-divider" />
                      <div className="profile-stat">
                        <span className="ps-num">89</span>
                        <span className="ps-lbl">Following</span>
                      </div>
                      <div className="profile-stat-divider" />
                      <div className="profile-stat">
                        <span className="ps-num">7</span>
                        <span className="ps-lbl">Videos</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="profile-tags">
                      <span className="tag tag-sport">Football</span>
                      <span className="tag tag-pos">Forward</span>
                      <span className="tag tag-club">Al Hilal</span>
                    </div>

                    {/* Quick Info */}
                    <div className="profile-quick">
                      <span className="quick-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        Riyadh, KSA
                      </span>
                      <span className="quick-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        Age 23
                      </span>
                    </div>
                  </div>

                  {isOwner && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/athlete-edit-profile" className="edit-profile-icon-btn" aria-label="Edit Profile">
                          <Pencil size={16} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Edit Profile</TooltipContent>
                    </Tooltip>
                  )}
                  {isCoachViewer && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-secondary/25 text-secondary hover:bg-secondary/5 hover:border-secondary/40 shrink-0"
                      onClick={() => setShowFeedbackModal(true)}
                    >
                      Send Feedback
                    </Button>
                  )}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="meta-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {[
                  { label: "Height", value: "178 cm" },
                  { label: "Weight", value: "73 kg" },
                  { label: "Nationality", value: "Saudi" },
                ].map((m) => (
                  <div className="meta-box" key={m.label}>
                    <div className="meta-label">{m.label}</div>
                    <div className="meta-val">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="tabs">
                {(["bio", "injuries"] as TabId[]).map((t) => (
                  <button
                    key={t}
                    className={`tab ${activeTab === t ? "active" : ""}`}
                    onClick={() => setActiveTab(t)}
                  >
                    {t === "bio" ? "Bio" : "Injuries"}
                  </button>
                ))}
              </div>

              {/* Tab: Bio */}
              {activeTab === "bio" && (
                <div className="tab-content">
                  <div className="info-section">
                    <h4>Player Bio</h4>
                    <p>
                      Fast attacking forward with strong movement off the ball, sharp finishing instincts,
                      and improving decision-making in transitions and tight spaces.
                    </p>
                    <div className="skill-tags">
                      {["Speed", "Finishing", "Positioning", "Pressing", "1v1 Dribbling"].map((s) => (
                        <span className="skill-tag" key={s}>{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="contact-section">
                    <h4>Contact &amp; Social</h4>
                    <div className="contact-grid">

                      <div className="contact-item">
                        <div className="contact-icon ci-phone">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.91 12 19.79 19.79 0 0 1 1.84 3.35 2 2 0 0 1 3.82 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </div>
                        <div>
                          <div className="cd-label">Phone</div>
                          <div className="cd-val">+966 504 988 092</div>
                        </div>
                      </div>

                      <div className="contact-item">
                        <div className="contact-icon ci-email">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                          </svg>
                        </div>
                        <div>
                          <div className="cd-label">Email</div>
                          <div className="cd-val">mohammed@email.com</div>
                        </div>
                      </div>

                      <div className="contact-item">
                        <div className="contact-icon ci-twitter">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                          </svg>
                        </div>
                        <div>
                          <div className="cd-label">Twitter / X</div>
                          <div className="cd-val">@moh_alharbi</div>
                        </div>
                      </div>

                      <div className="contact-item">
                        <div className="contact-icon ci-wa">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                          </svg>
                        </div>
                        <div>
                          <div className="cd-label">WhatsApp</div>
                          <div className="cd-val">Available to agents</div>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* Tab: Injuries */}
              {activeTab === "injuries" && (
                <div className="tab-content">
                  <div className="info-section">
                    <h4>Injury History</h4>
                    <p>No major injuries recorded. Minor ankle strain in a previous training cycle. Currently fit and available for selection.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Profile Completion Card — owner only */}
            {isOwner && (
              <div className="completion-card card">
                <h3>Profile completion</h3>

                <div className="progress-ring">
                  <div className="progress-inner">
                    <strong>40%</strong>
                    <span>complete</span>
                  </div>
                </div>

                <div className="completion-list">
                  {[
                    { label: "Account setup",  done: true,  pct: "10%" },
                    { label: "Upload photo",   done: true,  pct: "5%"  },
                    { label: "Personal info",  done: true,  pct: "10%" },
                    { label: "Injury history", done: false, pct: "+20%" },
                    { label: "Biography",      done: true,  pct: "15%" },
                    { label: "Contact info",   done: false, pct: "+12%" },
                  ].map((item) => (
                    <div className="comp-item" key={item.label}>
                      <div className={`comp-icon ${item.done ? "ci-done" : "ci-miss"}`}>
                        {item.done ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        )}
                      </div>
                      <span className="comp-label">{item.label}</span>
                      <span className={item.done ? "pct-done" : "pct-add"}>{item.pct}</span>
                    </div>
                  ))}
                </div>

                <div className="scout-pill">⚡ Scouts view completed profiles 4× more</div>
              </div>
            )}
          </section>

          {/* ── Dashboard Section ── */}
          <section id="dashboard-section" className="card dashboard-section">

            <div className="section-head">
              <h3>Performance Dashboard</h3>
                <div className="filters-row">
                  <Select defaultValue="current">
                    <SelectTrigger className="dash-filter-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Performance</SelectItem>
                      <SelectItem value="best">Best Performance</SelectItem>
                      <SelectItem value="lowest">Lowest Performance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="match">
                    <SelectTrigger className="dash-filter-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="match">Match</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="7d">
                    <SelectTrigger className="dash-filter-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 days</SelectItem>
                      <SelectItem value="30d">Last 30 days</SelectItem>
                      <SelectItem value="3m">Last 3 months</SelectItem>
                      <SelectItem value="1y">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
            </div>

            {/* Performance Stats */}
            <div className="perf-stats-grid">
              {[
                { label: "Peak Speed",      value: "31 km/h",  sub: "Top 12% in position",  tooltip: "Highest recorded sprint speed in the selected period" },
                { label: "Distance",        value: "5 km",     sub: "Avg last 5 sessions",   tooltip: "Average distance covered per selected session" },
                { label: "Agility",         value: "92%",      sub: "Improving trend",       tooltip: "Agility score based on movement and direction change" },
                { label: "Feedback Score",  value: "8.6 / 10", sub: "This week",             tooltip: "Average coach feedback score in the selected range" },
              ].map((s) => (
                <div className="perf-stat" key={s.label}>
                  <div className="info-icon has-tooltip">i
                    <div className="tooltip-box">{s.tooltip}</div>
                  </div>
                  <div className="ps-label">{s.label}</div>
                  <div className="ps-val">{s.value}</div>
                  <div className="ps-sub">{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts Layout */}
            <div className="dash-layout">

              {/* Monthly Performance Trend */}
              <div className="dashboard-chart-card">
                <div className="chart-label">Monthly Performance Trend</div>
                <svg viewBox="0 0 420 240" width="100%">
                  <defs>
                    <linearGradient id="currentFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0f766e" stopOpacity=".18" />
                      <stop offset="100%" stopColor="#0f766e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="45" y1="30"  x2="45"  y2="190" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="45" y1="190" x2="390" y2="190" stroke="#e5e7eb" strokeWidth="1" />
                  <line x1="45" y1="150" x2="390" y2="150" stroke="#e5e7eb" strokeDasharray="4,4" strokeWidth="1" />
                  <line x1="45" y1="110" x2="390" y2="110" stroke="#e5e7eb" strokeDasharray="4,4" strokeWidth="1" />
                  <line x1="45" y1="70"  x2="390" y2="70"  stroke="#e5e7eb" strokeDasharray="4,4" strokeWidth="1" />
                  {/* Y Labels */}
                  <text x="35" y="194" fontSize="10" textAnchor="end" fill="#9ca3af">0</text>
                  <text x="35" y="154" fontSize="10" textAnchor="end" fill="#9ca3af">25</text>
                  <text x="35" y="114" fontSize="10" textAnchor="end" fill="#9ca3af">50</text>
                  <text x="35" y="74"  fontSize="10" textAnchor="end" fill="#9ca3af">75</text>
                  <text x="35" y="34"  fontSize="10" textAnchor="end" fill="#9ca3af">100</text>
                  {/* Previous Period Line */}
                  <path d="M45,142 L102,129 L159,144 L216,124 L273,127 L330,116 L387,121" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="6,4" strokeLinejoin="round" />
                  {/* Current Period Area */}
                  <path d="M45,150 L102,123 L159,134 L216,102 L273,114 L330,70 L387,92 L387,190 L45,190 Z" fill="url(#currentFill)" />
                  {/* Current Period Line */}
                  <path d="M45,150 L102,123 L159,134 L216,102 L273,114 L330,70 L387,92" fill="none" stroke="#0f766e" strokeWidth="3" strokeLinejoin="round" />
                  {/* Data Points */}
                  {[[45,150],[102,123],[159,134],[216,102],[273,114],[330,70],[387,92]].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#0f766e" />
                  ))}
                  {/* X Labels */}
                  {["Jan","Feb","Mar","Apr","May","Jun","Jul"].map((m, i) => (
                    <text key={m} x={45 + i * 57} y="210" fontSize="10" textAnchor="middle" fill="#9ca3af">{m}</text>
                  ))}
                </svg>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot legend-main" />
                    <span>This Period</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot legend-secondary" />
                    <span>Previous Period</span>
                  </div>
                </div>
              </div>

              {/* Performance Radar */}
              <div className="dashboard-chart-card">
                <div className="chart-label">Performance Radar</div>
                <svg viewBox="0 0 320 262" width="100%">
                  {/* Grid Polygons */}
                  <polygon points="160,35 255,125 160,215 65,125"   fill="none" stroke="#e5e7eb" />
                  <polygon points="160,60 230,125 160,190 90,125"   fill="none" stroke="#e5e7eb" />
                  <polygon points="160,85 205,125 160,165 115,125"  fill="none" stroke="#e5e7eb" />
                  <polygon points="160,103 184,125 160,147 136,125" fill="none" stroke="#e5e7eb" />
                  {/* Axes */}
                  <line x1="160" y1="35"  x2="160" y2="215" stroke="#e5e7eb" />
                  <line x1="65"  y1="125" x2="255" y2="125" stroke="#e5e7eb" />
                  {/* Data Shape */}
                  <polygon points="160,57 224,125 160,170 98,125" fill="rgba(15,118,110,0.18)" stroke="#0f766e" strokeWidth="2.5" />
                  {/* Data Points */}
                  <circle cx="160" cy="57"  r="4" fill="#0f766e" />
                  <circle cx="224" cy="125" r="4" fill="#0f766e" />
                  <circle cx="160" cy="170" r="4" fill="#0f766e" />
                  <circle cx="98"  cy="125" r="4" fill="#0f766e" />
                  {/* Axis Labels */}
                  <text x="160" y="18"  textAnchor="middle" fontSize="11" fill="#6b7280">Speed</text>
                  <text x="264" y="129" fontSize="11" fill="#6b7280">Agility</text>
                  <text x="160" y="236" textAnchor="middle" fontSize="11" fill="#6b7280">Feedback Score</text>
                  <text x="13"  y="129" fontSize="11" fill="#6b7280">Distance</text>
                  {/* Scale Labels */}
                  <text x="167" y="106" fontSize="9" fill="#9ca3af">25</text>
                  <text x="167" y="87"  fontSize="9" fill="#9ca3af">50</text>
                  <text x="167" y="63"  fontSize="9" fill="#9ca3af">75</text>
                  <text x="167" y="39"  fontSize="9" fill="#9ca3af">100</text>
                  {/* Metric Values */}
                  <text x="160" y="49"  textAnchor="middle" fontSize="10" fill="#0f766e" fontWeight="700">88</text>
                  <text x="234" y="121" fontSize="10" fill="#0f766e" fontWeight="700">92</text>
                  <text x="160" y="184" textAnchor="middle" fontSize="10" fill="#0f766e" fontWeight="700">65</text>
                  <text x="74"  y="121" fontSize="10" fill="#0f766e" fontWeight="700">86</text>
                </svg>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot legend-main" />
                    <span>Selected Metrics</span>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── Videos Section ── */}
          <section id="videos-section" className="card videos-section">

            <div className="section-head">
              <h3>Top Videos</h3>
              <Link to={`/athlete-videos${viewerQuery}`}>
                <button className="btn btn-outline">View all videos</button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topVideos.map((video) => (
                <article key={video.id} className="rounded-xl border border-border/50 bg-card shadow-sm spotlight-hover spotlight-border transition-all duration-300 overflow-hidden group">
                  {/* Thumbnail */}
                  <section className="relative aspect-video flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/6 via-secondary/4 to-accent/3 border-b border-border/30">
                    {/* Actions — owner only */}
                    {isOwner && (
                      <div className="absolute top-2 right-2 flex gap-1.5 z-10 opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => toggleProfileVideoFavorite(video.id)}
                          title={video.favorite ? "Remove favorite" : "Add to favorite"}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground/30 text-background backdrop-blur-sm transition-all duration-200 hover:bg-foreground/60 hover:scale-110"
                        >
                          <Star size={13} className={video.favorite ? "fill-yellow-400 text-yellow-400" : ""} />
                        </button>
                        <button
                          onClick={() => openProfileVideoDeleteModal(video.id)}
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

                    {/* Duration */}
                    <span className="absolute bottom-2 right-2 rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-semibold text-background backdrop-blur-sm">{video.duration}</span>
                  </section>

                  {/* Stats */}
                  <section className="grid grid-cols-3 gap-1.5 px-3 pt-2.5 pb-0 profile-stats-compact">
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
          </section>

        </main>
      </div>

      {/* ── Delete Video Modal ── */}
      {showVideoDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Delete Video</h3>
            <p>Are you sure you want to delete this video?</p>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={cancelProfileVideoDelete}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmProfileVideoDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Logout Modal ── */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3>Log out</h3>
            <p>Are you sure you want to log out?</p>
            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancel</button>
              <button className="btn btn-danger">Log out</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Send Feedback Modal (coach viewer) ── */}
      {showFeedbackModal && (
        <SendFeedbackModal
          playerId="athlete-001"
          playerName="Mohammed Al-Harbi"
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={(payload) => {
            console.log("Feedback submitted:", payload);
            setShowFeedbackModal(false);
          }}
        />
      )}

    </div>
  );
}
