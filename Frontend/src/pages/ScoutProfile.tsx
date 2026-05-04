import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Pencil, ArrowRight, Bookmark } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useProfilePermissions } from "@/hooks/useProfilePermissions";
import "./AthleteProfile.css";
import athlightLogoOriginal from "@/assets/athlight_logo.png";

type ProfileType = "Athlete Profile" | "Coach Profile" | "Scout Profile";

type HistoryItem = {
  id: number;
  name: string;
  roleLabel: ProfileType;
  subtitle: string;
  viewedAt: string;
  initials: string;
};

type SavedProfileItem = {
  id: number;
  name: string;
  roleLabel: ProfileType;
  subtitle: string;
  initials: string;
  saved: boolean;
};

export default function ScoutProfile() {
  const navigate = useNavigate();
  const { isOwner } = useProfilePermissions("scout");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  // isOwner currently always true (no scout-other-view route), but resolved centrally for consistency.
  void isOwner;

  const handleReturnToApp = () => navigate("/scout-feed");

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionIds = ["scout-overview-section", "scout-history-section", "scout-saved-section"];
    const navMap: Record<string, string> = {
      "scout-overview-section": "overview",
      "scout-history-section": "history",
      "scout-saved-section": "saved",
    };

    const observer = new IntersectionObserver(
      (entries) => {
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

  const scoutStats = [
    { label: "Followers", value: "842" },
    { label: "Following", value: "61" },
    { label: "Saved Profiles", value: "24" },
  ];

  const infoCards = [
    { label: "Region of Focus", value: "Western Region" },
    { label: "Organization", value: "Talent Eye Agency" },
    { label: "Focus Sport", value: "Football" },
    { label: "Nationality", value: "Saudi" },
  ];

  const preferredTalentFocus = [
    { label: "Position", value: "Forward, Midfielder" },
    { label: "Age Range", value: "U18, U21" },
    { label: "Attributes", value: "Speed, Finishing, Tactical Awareness" },
  ];

  const recentHistory: HistoryItem[] = [
    { id: 1, name: "Mohammed Al-Harbi", roleLabel: "Athlete Profile", subtitle: "Forward • Al Hilal", viewedAt: "Viewed 2 hours ago", initials: "MA" },
    { id: 2, name: "Ahmed Ali", roleLabel: "Athlete Profile", subtitle: "Midfielder • Al Ittihad", viewedAt: "Viewed yesterday", initials: "AA" },
    { id: 3, name: "Saad Al-Sharif", roleLabel: "Coach Profile", subtitle: "Coach • Al Hilal Academy", viewedAt: "Viewed 2 days ago", initials: "SA" },
    { id: 4, name: "Sara Noor", roleLabel: "Athlete Profile", subtitle: "Defender • Al Ahli", viewedAt: "Viewed 3 days ago", initials: "SN" },
  ];

  const initialSavedProfiles: SavedProfileItem[] = [
    { id: 1, name: "Mohammed Al-Harbi", roleLabel: "Athlete Profile", subtitle: "Forward • Al Hilal", initials: "MA", saved: true },
    { id: 2, name: "Ahmed Ali", roleLabel: "Athlete Profile", subtitle: "Midfielder • Al Ittihad", initials: "AA", saved: true },
    { id: 3, name: "Sara Noor", roleLabel: "Athlete Profile", subtitle: "Defender • Al Ahli", initials: "SN", saved: true },
    { id: 4, name: "Saad Al-Sharif", roleLabel: "Coach Profile", subtitle: "Coach • Talent Eye Agency", initials: "SA", saved: true },
  ];

  const [savedProfiles, setSavedProfiles] = useState(initialSavedProfiles);

  const toggleSave = (id: number) => {
    setSavedProfiles((prev) =>
      prev.map((profile) =>
        profile.id === id ? { ...profile, saved: !profile.saved } : profile
      )
    );
  };

  const roleLabelColor = (role: ProfileType) => {
    if (role === "Athlete Profile") return { bg: "hsl(195 56% 38% / 0.1)", color: "hsl(195 56% 38%)" };
    if (role === "Coach Profile") return { bg: "hsl(152 52% 46% / 0.1)", color: "hsl(152 52% 40%)" };
    return { bg: "hsl(52 82% 63% / 0.15)", color: "hsl(42 60% 35%)" };
  };

  return (
    <div className="athlete-profile-page">
      <div className="shell">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div>
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

            <div className="nav-label">Main</div>

            <button
              className={`nav-item ${activeNav === "overview" ? "active" : ""}`}
              onClick={() => { setActiveNav("overview"); scrollToSection("scout-overview-section"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Overview
            </button>

            <button
              className={`nav-item ${activeNav === "history" ? "active" : ""}`}
              onClick={() => { setActiveNav("history"); scrollToSection("scout-history-section"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              History
            </button>

            <button
              className={`nav-item ${activeNav === "saved" ? "active" : ""}`}
              onClick={() => { setActiveNav("saved"); scrollToSection("scout-saved-section"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
              Saved Profiles
            </button>

          </div>

          <div className="sidebar-bottom">
            <div className="athlete-mini">
              <div className="avatar-sm">SA</div>
              <div className="athlete-mini-info">
                <div className="athlete-mini-name">Saad Al-Mutairi</div>
                <div className="athlete-mini-sub">Scout · Talent Eye Agency</div>
              </div>
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
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main" ref={mainRef}>

          {/* ── Overview Section ── */}
          <section id="scout-overview-section" className="overview-grid">

            <div className="card profile-card">
              <div className="profile-card-toprow">
                <div className="profile-header">
                  <div className="profile-avatar-wrap">
                    <div className="profile-avatar">SA</div>
                    <div className="verified-badge">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="white">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>

                  <div className="profile-name">
                    <h2>Saad Al-Mutairi</h2>

                    <div className="profile-stats-row">
                      {scoutStats.map((stat, index) => (
                        <div key={stat.label} style={{ display: "contents" }}>
                          <div className="profile-stat">
                            <span className="ps-num">{stat.value}</span>
                            <span className="ps-lbl">{stat.label}</span>
                          </div>
                          {index !== scoutStats.length - 1 && <div className="profile-stat-divider" />}
                        </div>
                      ))}
                    </div>

                    <div className="profile-tags">
                      <span className="tag tag-sport">Talent Scout</span>
                    </div>

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
                        Age 34
                      </span>
                    </div>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to="/scout-edit-profile" className="edit-profile-icon-btn" aria-label="Edit Profile">
                        <Pencil size={16} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Edit Profile</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="meta-grid">
                {infoCards.map((m) => (
                  <div className="meta-box" key={m.label}>
                    <div className="meta-label">{m.label}</div>
                    <div className="meta-val">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Bio & Preferred Talent Focus */}
              <div className="tab-content">
                <div className="info-section">
                  <h4>Scout Bio</h4>
                  <p>
                    Football scout focused on identifying promising athletes with strong
                    tactical awareness, movement quality, and long-term development
                    potential across Saudi clubs and academies.
                  </p>

                  <h4>Preferred Talent Focus</h4>
                  <div className="skill-tags">
                    {preferredTalentFocus.map((item) => (
                      <span className="skill-tag" key={item.label}>{item.label}: {item.value}</span>
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
                        <div className="cd-val">+966 501 234 987</div>
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
                        <div className="cd-val">saad.scout@email.com</div>
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
                        <div className="cd-val">@sa_scout129</div>
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
                        <div className="cd-val">Available to agencies</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Profile Completion Card */}
            <div className="completion-card card">
              <h3>Profile completion</h3>

              <div className="progress-ring" style={{
                background: `conic-gradient(hsl(152 52% 46%) 0deg 216deg, hsl(195 14% 92%) 216deg 360deg)`
              }}>
                <div className="progress-inner">
                  <strong>60%</strong>
                  <span>complete</span>
                </div>
              </div>

              <div className="completion-list">
                {[
                  { label: "Account setup", done: true, pct: "10%" },
                  { label: "Upload photo", done: true, pct: "20%" },
                  { label: "Personal info", done: true, pct: "15%" },
                  { label: "Biography", done: true, pct: "15%" },
                  { label: "Preferred focus", done: false, pct: "+15%" },
                  { label: "Contact info", done: false, pct: "+25%" },
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

              <div className="scout-pill">⚡ Complete scout profiles make review workflows more efficient</div>
            </div>
          </section>

          {/* ── History Section ── */}
          <section id="scout-history-section" className="card dashboard-section">
            <div className="section-head">
              <h3>Recent Scouting History</h3>
              <Link to="/scout-history">
                <button className="btn btn-outline">
                  View All History
                  <ArrowRight size={13} style={{ marginLeft: 6, display: "inline" }} />
                </button>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {recentHistory.map((item) => {
                const colors = roleLabelColor(item.roleLabel);
                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", cursor: "default" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 28px -6px hsl(152 52% 46% / 0.2), 0 8px 20px -4px hsl(210 45% 11% / 0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, hsl(195 56% 38%), hsl(152 52% 46%))",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {item.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(210 45% 11%)" }}>{item.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: colors.bg,
                          color: colors.color,
                        }}>
                          {item.roleLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "hsl(210 14% 46%)", fontWeight: 500, marginTop: 2 }}>{item.subtitle}</div>
                      <div style={{ fontSize: 10, color: "hsl(210 14% 60%)", marginTop: 2 }}>{item.viewedAt}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Saved Profiles Section ── */}
          <section id="scout-saved-section" className="card dashboard-section">
            <div className="section-head">
              <h3>Saved Profiles</h3>
              <Link to="/scout-saved-profiles">
                <button className="btn btn-outline">
                  View All Saved
                  <ArrowRight size={13} style={{ marginLeft: 6, display: "inline" }} />
                </button>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {savedProfiles.filter((item) => item.saved).map((item) => {
                const colors = roleLabelColor(item.roleLabel);
                return (
                  <div
                    key={item.id}
                    className="card"
                    style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", cursor: "default" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 28px -6px hsl(152 52% 46% / 0.2), 0 8px 20px -4px hsl(210 45% 11% / 0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, hsl(195 56% 38%), hsl(152 52% 46%))",
                      color: "white",
                      fontSize: 13,
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      {item.initials}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(210 45% 11%)" }}>{item.name}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: 12,
                          background: colors.bg,
                          color: colors.color,
                        }}>
                          {item.roleLabel}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "hsl(210 14% 46%)", fontWeight: 500, marginTop: 2 }}>{item.subtitle}</div>
                    </div>
                    <button
                      onClick={() => toggleSave(item.id)}
                      title={item.saved ? "Remove from saved" : "Save profile"}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: item.saved ? "hsl(152 52% 46% / 0.12)" : "hsl(195 14% 92%)",
                        color: item.saved ? "hsl(152 52% 40%)" : "hsl(210 14% 46%)",
                        transition: "all 0.2s",
                        flexShrink: 0,
                      }}
                    >
                      <Bookmark size={14} fill={item.saved ? "currentColor" : "none"} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

        </main>
      </div>

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
    </div>
  );
}
