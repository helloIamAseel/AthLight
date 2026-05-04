import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Plus, FileText } from "lucide-react";
import ExploreIcon from "@/components/feed/ExploreIcon";
import type { NavItem } from "@/components/feed/BottomNav";

export type UserRole = "athlete" | "coach" | "scout";

interface UseRoleNavOptions {
  role: UserRole;
  onUploadClick?: () => void;
}

const ROLE_ROUTES: Record<UserRole, { feed: string; explore: string; profile: string; extras?: { key: string; path: string; label: string; icon: React.ReactNode }[] }> = {
  athlete: {
    feed: "/feed",
    explore: "/explore",
    profile: "/athlete-profile",
  },
  coach: {
    feed: "/coach-feed",
    explore: "/coach-explore",
    profile: "/coach-profile",
    extras: [
      { key: "feedbacks", path: "/coach-feedback-history", label: "Feedbacks", icon: <FileText className="h-5 w-5" /> },
    ],
  },
  scout: {
    feed: "/scout-feed",
    explore: "/scout-explore",
    profile: "/scout-profile",
  },
};

export function useRoleNav({ role, onUploadClick }: UseRoleNavOptions) {
  const navigate = useNavigate();
  const location = useLocation();
  const routes = ROLE_ROUTES[role];

  const isActive = (path: string) => location.pathname === path;

  const navItems: NavItem[] = [
    {
      key: "feed",
      icon: <Home className="h-5 w-5" />,
      label: "Feed",
      onClick: () => navigate(routes.feed),
      isActive: isActive(routes.feed),
    },
  ];

  // Athlete gets upload FAB
  if (role === "athlete" && onUploadClick) {
    navItems.push({
      key: "upload",
      icon: <Plus className="h-6 w-6" />,
      label: "",
      onClick: onUploadClick,
      isFab: true,
    });
  }

  navItems.push({
    key: "explore",
    icon: <ExploreIcon className="h-5 w-5" />,
    label: "Explore",
    onClick: () => navigate(routes.explore),
    isActive: isActive(routes.explore),
  });

  // Role-specific extras (Reports for athlete, Feedbacks for coach)
  if (routes.extras) {
    for (const extra of routes.extras) {
      navItems.push({
        key: extra.key,
        icon: extra.icon,
        label: extra.label,
        onClick: () => navigate(extra.path),
        isActive: isActive(extra.path),
      });
    }
  }

  return {
    navItems,
    routes,
    isActive,
    navigateToProfile: () => navigate(routes.profile),
  };
}
