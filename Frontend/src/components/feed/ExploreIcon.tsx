import React from "react";

interface ExploreIconProps {
  className?: string;
}

/** Search icon with a small sparkle accent for AI-powered discovery */
export default function ExploreIcon({ className = "h-5 w-5" }: ExploreIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Magnifying glass */}
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.1" y1="15.1" x2="21" y2="21" />
      {/* Sparkle accent */}
      <path d="M19 4l0.5 1.5L21 6l-1.5 0.5L19 8l-0.5-1.5L17 6l1.5-0.5Z" strokeWidth={1.5} />
    </svg>
  );
}
