// src/constants/icons.tsx
// Centralized icon library for AthLight
// Import individual icons or use pre-configured navItems
// https://icon-sets.iconify.design/majesticons/?icon-filter=pl&keyword=f 

import React from 'react';

// Home Icon
export const HomeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M20 19v-8.5a1 1 0 0 0-.4-.8l-7-5.25a1 1 0 0 0-1.2 0l-7 5.25a1 1 0 0 0-.4.8V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1"
    />
  </svg>
);

// Following/Users Icon
export const FollowingIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <circle cx="9" cy="9" r="4"/>
      <path d="M16 19c0-3.314-3.134-6-7-6s-7 2.686-7 6m13-6a4 4 0 1 0-3-6.646"/>
      <path d="M22 19c0-3.314-3.134-6-7-6c-.807 0-2.103-.293-3-1.235"/>
    </g>
  </svg>
);

// Profile/User Icon
export const ProfileIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <circle cx="12" cy="8" r="5"/>
      <path d="M20 21a8 8 0 1 0-16 0m16 0a8 8 0 1 0-16 0"/>
    </g>
  </svg>
);

// Add/Plus Icon
export const AddIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      stroke="currentColor" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M5 12h7m7 0h-7m0 0V5m0 7v7"
    />
  </svg>
);

// Bell/Notification Icon
export const NotificationIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Search Icon
export const SearchIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Logout Icon
export const LogoutIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Play Icon
export const PlayIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

// Message/Chat Icon
export const MessageIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Camera Icon
export const CameraIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" 
      fill="currentColor"
    />
    <circle cx="12" cy="13" r="4" fill="white"/>
  </svg>
);

// Dark Mode/Sun Icon
export const DarkModeIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

// Close/X Icon
export const CloseIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      d="M18 6 6 18M6 6l12 12" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Delete/Trash Icon
export const DeleteIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path 
      d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Pre-configured navigation items for BottomNav component
export const navItems = [
  {
    id: 'feed',
    label: 'Feed',
    icon: <HomeIcon />
  },
  {
    id: 'following',
    label: 'Following',
    icon: <FollowingIcon />
  }
];

// Alternative nav items with profile
export const navItemsWithProfile = [
  {
    id: 'feed',
    label: 'Feed',
    icon: <HomeIcon />
  },
  {
    id: 'following',
    label: 'Following',
    icon: <FollowingIcon />
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <ProfileIcon />
  }
];
