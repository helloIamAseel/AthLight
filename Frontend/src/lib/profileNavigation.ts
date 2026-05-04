import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Centralized profile-link builder.
 *
 * GOAL: Anywhere in the app where a user/profile entry is clicked (avatar, name, card,
 * search result, history row, saved row, evaluated athlete, feedback row, etc.) MUST
 * route through this helper. Pages must NOT hardcode `/athlete-profile?viewer=...`
 * style strings on their own — that drifts and creates inconsistent permissions.
 *
 * The destination is determined by the TARGET profile role (athlete/coach/scout).
 * The `?viewer=` query (consumed by useProfilePermissions) is derived from the
 * VIEWER role (the currently logged-in user). When the viewer is opening their
 * OWN profile, no viewer query is attached → owner mode.
 */

export type ProfileRole = "athlete" | "coach" | "scout";
export type ViewerRoleParam = "coach" | "scout" | "athlete" | "other";

export interface OpenProfileArgs {
  /** Role of the profile being opened. */
  targetRole: ProfileRole;
  /** Role of the currently logged-in user (the viewer). */
  viewerRole: ProfileRole;
  /**
   * True when this entry represents the logged-in user themself (own profile).
   * When true, the viewer query is omitted → owner-mode rendering.
   * When omitted/false, the viewer query is derived from viewerRole.
   */
  isSelf?: boolean;
  /** Optional target id, in case future profiles are id-driven (`/athlete-profile/:id`). */
  targetId?: string | number;
}

const PROFILE_BASE: Record<ProfileRole, string> = {
  athlete: "/athlete-profile",
  coach: "/coach-profile",
  scout: "/scout-profile",
};

/**
 * Map (targetRole, viewerRole) → the `?viewer=` query value used by
 * useProfilePermissions. The convention:
 *  - athlete viewing another athlete  → "other"
 *  - any other cross-role view        → the viewer's role (coach|scout|athlete)
 */
function viewerQueryValue(targetRole: ProfileRole, viewerRole: ProfileRole): ViewerRoleParam {
  if (targetRole === "athlete" && viewerRole === "athlete") return "other";
  return viewerRole;
}

export function buildProfilePath(args: OpenProfileArgs): string {
  const { targetRole, viewerRole, isSelf, targetId } = args;
  const base = PROFILE_BASE[targetRole];
  const idPart = targetId !== undefined ? `/${encodeURIComponent(String(targetId))}` : "";

  // Own profile → no viewer query (owner mode handled by useProfilePermissions).
  if (isSelf) return `${base}${idPart}`;

  const viewer = viewerQueryValue(targetRole, viewerRole);
  return `${base}${idPart}?viewer=${viewer}`;
}

/**
 * Hook: returns a single function used by every profile-entry click handler.
 * Usage:
 *   const openProfile = useOpenProfile("coach");
 *   <button onClick={() => openProfile({ targetRole: "athlete" })}>...</button>
 */
export function useOpenProfile(viewerRole: ProfileRole) {
  const navigate = useNavigate();
  return useCallback(
    (args: Omit<OpenProfileArgs, "viewerRole">) => {
      const path = buildProfilePath({ ...args, viewerRole });
      navigate(path);
    },
    [navigate, viewerRole]
  );
}
