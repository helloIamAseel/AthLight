import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/**
 * Smart "return to app" / back navigation.
 *
 * - If the user got to the current page via in-app navigation
 *   (location.key !== "default") → navigate(-1).
 * - Otherwise (deep link / fresh tab) → navigate to /feed.
 *
 * Use the returned function for the sidebar AthLight logo and as a fallback
 * for back buttons that don't have an explicit `backTo`.
 */
export function useReturnToApp(fallback: string = "/feed") {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(() => {
    if (location.key && location.key !== "default") {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, location.key, fallback]);
}
