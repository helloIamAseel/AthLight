import { useSearchParams } from "react-router-dom";

/**
 * Centralized profile permission system.
 *
 * Convention: All profile pages are reached with an optional `?viewer=` query param.
 *  - missing  → the logged-in user is the profile OWNER (own profile)
 *  - "coach"  → a Coach is viewing someone else's profile
 *  - "scout"  → a Scout is viewing someone else's profile
 *  - "athlete" / "other" → another Athlete is viewing the profile
 *
 * This hook is the SINGLE source of truth for what controls render on a profile,
 * its sub-pages (videos, reports), and any role-gated actions (Send Feedback, Edit, etc.).
 *
 * Use everywhere a profile, profile-derived view, or report is rendered to guarantee
 * the same UI shows up regardless of which page navigated into it.
 */

export type ViewerRole = "athlete" | "coach" | "scout" | "other";
export type ProfileOwnerRole = "athlete" | "coach" | "scout";

export interface ProfilePermissions {
  /** Raw viewer query value, or null if owner. */
  viewer: ViewerRole | null;
  /** True when the logged-in user IS the profile owner. */
  isOwner: boolean;
  /** Convenience flags by viewer role (false when isOwner). */
  isCoachViewer: boolean;
  isScoutViewer: boolean;
  isAthleteViewer: boolean;
  /** Owner-only controls: edit profile, sign out, profile completion, video star/delete, upload. */
  canEdit: boolean;
  canSeeOwnerControls: boolean;
  /** Coaches viewing an athlete can leave feedback. Owners and other roles cannot. */
  canSendFeedback: boolean;
  /**
   * Reports visibility on an Athlete profile:
   *  - Owner: yes (own reports)
   *  - Coach / Scout viewer: yes (read-only)
   *  - Another Athlete: NO (private)
   */
  canViewAthleteReports: boolean;
  /**
   * Coach profile section visibility:
   *  - Owner sees Recent Feedback (own feedback history)
   *  - External viewers see Evaluated Athletes
   */
  canSeeCoachOwnFeedback: boolean;
  canSeeCoachEvaluatedAthletes: boolean;
  /**
   * Scout profile section visibility:
   *  - Owner sees History + Saved Profiles
   *  - External viewers see neither (scout-only)
   */
  canSeeScoutPrivateSections: boolean;
  /** Query string suffix to preserve viewer context across navigation (e.g. "?viewer=coach"). */
  viewerQuery: string;
  /** Build a URL preserving the current viewer context. */
  withViewer: (path: string) => string;
}

function normalizeViewer(raw: string | null): ViewerRole | null {
  if (!raw) return null;
  if (raw === "coach" || raw === "scout" || raw === "athlete") return raw;
  // Backwards-compat: "other" === another athlete viewer
  if (raw === "other") return "other";
  return "other";
}

/**
 * Centralized permission resolver for the profile being viewed.
 *
 * @param ownerRole role of the profile being viewed (athlete/coach/scout). Defaults to "athlete"
 *                  since most viewer-gated permissions are athlete-profile-centric.
 */
export function useProfilePermissions(
  ownerRole: ProfileOwnerRole = "athlete"
): ProfilePermissions {
  const [searchParams] = useSearchParams();
  const viewer = normalizeViewer(searchParams.get("viewer"));
  const isOwner = viewer === null;

  const isCoachViewer = viewer === "coach";
  const isScoutViewer = viewer === "scout";
  const isAthleteViewer = viewer === "athlete" || viewer === "other";

  // Owner-only controls
  const canEdit = isOwner;
  const canSeeOwnerControls = isOwner;

  // Send Feedback: only a Coach viewing an Athlete profile.
  const canSendFeedback = ownerRole === "athlete" && isCoachViewer;

  // Athlete reports: owner, coach viewer, scout viewer. NOT another athlete.
  const canViewAthleteReports =
    ownerRole === "athlete" && (isOwner || isCoachViewer || isScoutViewer);

  // Coach profile sections
  const canSeeCoachOwnFeedback = ownerRole === "coach" && isOwner;
  const canSeeCoachEvaluatedAthletes = ownerRole === "coach" && !isOwner;

  // Scout profile sections (history + saved are owner-only)
  const canSeeScoutPrivateSections = ownerRole === "scout" && isOwner;

  const viewerQuery = viewer ? `?viewer=${viewer}` : "";
  const withViewer = (path: string) => {
    if (!viewerQuery) return path;
    return path.includes("?") ? `${path}&viewer=${viewer}` : `${path}${viewerQuery}`;
  };

  return {
    viewer,
    isOwner,
    isCoachViewer,
    isScoutViewer,
    isAthleteViewer,
    canEdit,
    canSeeOwnerControls,
    canSendFeedback,
    canViewAthleteReports,
    canSeeCoachOwnFeedback,
    canSeeCoachEvaluatedAthletes,
    canSeeScoutPrivateSections,
    viewerQuery,
    withViewer,
  };
}
