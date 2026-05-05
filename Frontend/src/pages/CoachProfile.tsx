import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Pencil, ArrowRight } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useProfilePermissions } from "@/hooks/useProfilePermissions";
import { useOpenProfile } from "@/lib/profileNavigation";
import "./AthleteProfile.css";
import athlightLogoOriginal from "@/assets/athlight_logo.png";

type VerificationStatus = "verified" | "pending" | "rejected";

export default function CoachProfile() {
  const navigate = useNavigate();
  const { isOwner, canSeeCoachOwnFeedback, canSeeCoachEvaluatedAthletes } =
    useProfilePermissions("coach");
  const openProfile = useOpenProfile("coach");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeNav, setActiveNav] = useState("overview");
  const verificationStatus: VerificationStatus = "verified";

  const handleReturnToApp = () => navigate("/coach-feed");

  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionIds = ["coach-overview-section"];
    const navMap: Record<string, string> = {
      "coach-overview-section": "overview",
    };
    if (isOwner) {
      sectionIds.push("coach-feedback-section");
      navMap["coach-feedback-section"] = "feedback";
    } else {
      sectionIds.push("coach-athletes-section");
      navMap["coach-athletes-section"] = "athletes";
    }

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
  }, [isOwner]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const recentFeedback = [
    { id: 1, player: "Ahmed Ali", type: "Match", date: "2026-01-20", score: 8.5, comment: "Great positioning and timing, keep scanning before receiving." },
    { id: 2, player: "Sara Noor", type: "Training", date: "2026-01-18", score: 6.2, comment: "Good intensity, but work on first touch under pressure." },
    { id: 3, player: "Khalid Alharbi", type: "Training", date: "2026-01-15", score: 7.9, comment: "Strong movement overall, improve decision-making in crowded areas." },
    { id: 4, player: "Smaher Ali", type: "Training", date: "2026-01-13", score: 8.3, comment: "Strong movement overall, improve decision-making in crowded areas." },
  ];

  const evaluatedAthletes = [
    { id: 1, name: "Ahmed Ali", role: "Forward", club: "Al Ittihad", lastScore: "8.5/10" },
    { id: 2, name: "Sara Noor", role: "Midfielder", club: "Al Ahli", lastScore: "6.2/10" },
    { id: 3, name: "Khalid Alharbi", role: "Striker", club: "Al Hilal", lastScore: "7.9/10" },
    { id: 4, name: "Yousef Salem", role: "Defender", club: "Al Nassr", lastScore: "8.1/10" },
  ];

  const scoreGradient = (score: number) => {
    if (score >= 7) return "linear-gradient(135deg, hsl(152 52% 46%), hsl(149 46% 56%))";
    if (score >= 4) return "linear-gradient(135deg, hsl(45 80% 50%), hsl(53 82% 63%))";
    return "linear-gradient(135deg, hsl(0 72% 52%), hsl(0 60% 55%))";
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
              onClick={() => { setActiveNav("overview"); scrollToSection("coach-overview-section"); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Overview
            </button>

            {isOwner && (
              <button
                className={`nav-item ${activeNav === "feedback" ? "active" : ""}`}
                onClick={() => { setActiveNav("feedback"); scrollToSection("coach-feedback-section"); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Feedback
              </button>
            )}

            {!isOwner && (
              <button
                className={`nav-item ${activeNav === "athletes" ? "active" : ""}`}
                onClick={() => { setActiveNav("athletes"); scrollToSection("coach-athletes-section"); }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Evaluated Athletes
              </button>
            )}

          </div>

          <div className="sidebar-bottom">
            <div className="athlete-mini">
              <div className="avatar-sm">SA</div>
              <div className="athlete-mini-info">
                <div className="athlete-mini-name">Saad Al-Sharif</div>
                <div className="athlete-mini-sub">Coach · Al Hilal Academy</div>
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
          <section id="coach-overview-section" className="overview-grid">

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
                    <h2>
                      Saad Al-Sharif


                    </h2>

                    <div className="profile-stats-row">
                      <div className="profile-stat">
                        <span className="ps-num">1,253</span>
                        <span className="ps-lbl">Followers</span>
                      </div>
                      <div className="profile-stat-divider" />
                      <div className="profile-stat">
                        <span className="ps-num">89</span>
                        <span className="ps-lbl">Following</span>
                      </div>
                      <div className="profile-stat-divider" />
                      <div className="profile-stat">
                        <span className="ps-num">214</span>
                        <span className="ps-lbl">Feedbacks</span>
                      </div>
                    </div>

                    <div className="profile-tags">
                      <span className="tag tag-sport">Tactical Coach</span>

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
                        Age 37
                      </span>
                      <span className="quick-item">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9l-5 4.87L18.18 21 12 17.77 5.82 21 7 13.87 2 9l6.91-.74L12 2z" />
                        </svg>
                        SAFF Licensed
                      </span>
                    </div>
                  </div>

                  {isOwner && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link to="/coach-edit-profile" className="edit-profile-icon-btn" aria-label="Edit Profile">
                          <Pencil size={16} />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">Edit Profile</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </div>

              {/* Meta Grid */}
              <div className="meta-grid">
                {[
                  { label: "Experience", value: "10 Years" },
                  { label: "Club / Academy", value: "Al Hilal Academy" },
                  { label: "License Status", value: "Verified" },
                  { label: "Nationality", value: "Saudi" },
                ].map((m) => (
                  <div className="meta-box" key={m.label}>
                    <div className="meta-label">{m.label}</div>
                    <div className="meta-val">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Bio & Specialties */}
              <div className="tab-content">
                <div className="info-section">
                  <h4>Coach Bio</h4>
                  <p>
                    Tactical coach focused on helping athletes improve decision-making,
                    movement off the ball, and positioning under pressure. Works closely
                    with youth and developing players through structured, performance-based feedback.
                  </p>

                  <h4>Specialties</h4>
                  <div className="skill-tags">
                    {["Positioning", "Finishing", "Decision Making", "Tactical Awareness", "Youth Development"].map((s) => (
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
                        <div className="cd-val">+966 504 955 823</div>
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
                        <div className="cd-val">saad@email.com</div>
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
                        <div className="cd-val">@sa_ad129</div>
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
                  { label: "Upload photo", done: true, pct: "15%" },
                  { label: "Personal info", done: true, pct: "10%" },
                  { label: "Biography", done: true, pct: "10%" },
                  { label: "Contact info", done: true, pct: "15%" },
                  { label: "License verification", done: false, pct: "+40%" },
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

              <div className="scout-pill">⚡ Verified coaches build stronger trust with athletes</div>
            </div>
          </section>

          {/* ── Feedback Section (owner only) ── */}
          {canSeeCoachOwnFeedback && <section id="coach-feedback-section" className="card dashboard-section">
            <div className="section-head">
              <h3>Recent Feedback</h3>
              <Link to="/coach-feedback-history">
                <button className="btn btn-outline">
                  View All Feedback
                  <ArrowRight size={13} style={{ marginLeft: 6, display: "inline" }} />
                </button>
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {recentFeedback.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openProfile({ targetRole: "athlete", targetId: item.id })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProfile({ targetRole: "athlete", targetId: item.id }); } }}
                  className="card"
                  style={{ padding: 16, transition: "all 0.2s", cursor: "pointer" }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 0 28px -6px hsl(152 52% 46% / 0.2), 0 8px 20px -4px hsl(210 45% 11% / 0.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "hsl(210 45% 11%)" }}>{item.player}</span>
                    <span
                      className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-extrabold text-white ${item.score >= 7
                          ? "bg-gradient-to-r from-[hsl(152_52%_46%)] to-[hsl(149_46%_56%)]"
                          : item.score >= 4
                            ? "bg-gradient-to-r from-[hsl(45_80%_50%)] to-[hsl(53_82%_63%)]"
                            : "bg-gradient-to-r from-destructive to-[hsl(0_60%_55%)]"
                        }`}
                    >
                      {item.score.toFixed(1)}/10
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span
                      className={`shrink-0 inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white ${item.type === "Training"
                          ? "bg-gradient-to-r from-secondary to-[hsl(152_52%_46%)]"
                          : "bg-gradient-to-r from-primary to-secondary"
                        }`}
                    >
                      {item.type}
                    </span>
                    <span style={{ fontSize: 11, color: "hsl(210 14% 46%)", fontWeight: 500 }}>{item.date}</span>
                  </div>

                  <p style={{ fontSize: 12, color: "hsl(210 14% 46%)", lineHeight: 1.6, margin: 0 }}>{item.comment}</p>
                </div>
              ))}
            </div>
          </section>}

          {/* ── Evaluated Athletes Section (non-owner only) ── */}
          {canSeeCoachEvaluatedAthletes && <section id="coach-athletes-section" className="card dashboard-section">
            <div className="section-head">
              <h3>Evaluated Athletes</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {evaluatedAthletes.map((athlete) => (
                <div
                  key={athlete.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openProfile({ targetRole: "athlete", targetId: athlete.id })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openProfile({ targetRole: "athlete", targetId: athlete.id }); } }}
                  className="card"
                  style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s", cursor: "pointer" }}
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
                    {athlete.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "hsl(210 45% 11%)" }}>{athlete.name}</div>
                    <div style={{ fontSize: 11, color: "hsl(210 14% 46%)", fontWeight: 500 }}>{athlete.role} · {athlete.club}</div>
                  </div>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "linear-gradient(135deg, hsl(152 52% 46% / 0.12), hsl(52 82% 63% / 0.12))",
                    color: "hsl(152 52% 40%)",
                  }}>
                    {athlete.lastScore}
                  </span>
                </div>
              ))}
            </div>
          </section>}

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
