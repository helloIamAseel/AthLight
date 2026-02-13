import React from 'react';
import type { ReactNode } from 'react';
import styles from './TopNav.module.css';
import Avatar from './Avatar';
import SearchBar from './SearchBar';
import Button from './Button';
import NotificationBadge from './NotificationBadge';

interface TopNavProps {
  searchValue: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
  onFilterClick?: () => void;
  showLogout?: boolean;
  onLogoutClick?: () => void;
  showDarkMode?: boolean;
  onDarkModeClick?: () => void;
  avatarSrc?: string;
  onAvatarClick?: () => void;
}

const TopNav: React.FC<TopNavProps> = ({
  searchValue,
  onSearchChange,
  notificationCount = 0,
  onNotificationClick,
  onFilterClick,
  showLogout = true,
  onLogoutClick,
  showDarkMode = true,
  onDarkModeClick,
  avatarSrc,
  onAvatarClick
}) => {
  return (
    <nav className={styles.topNav}>
      <div className={styles.container}>
        <div className={styles.avatarWrapper} onClick={onAvatarClick}>
          <Avatar src={avatarSrc} size="small" />
        </div>
        
        <div className={styles.searchWrapper}>
          <SearchBar 
            value={searchValue}
            onChange={onSearchChange}
            placeholder="Search athletes..."
          />
        </div>

        <Button variant="secondary" onClick={onFilterClick}>
          Filters
        </Button>

        <div className={styles.iconGroup}>
          <div className={styles.notificationWrapper} onClick={onNotificationClick}>
            <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {notificationCount > 0 && (
              <div className={styles.badge}>
                <NotificationBadge count={notificationCount} />
              </div>
            )}
          </div>

          {showLogout && (
            <div className={styles.iconButton} onClick={onLogoutClick}>
              <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}

          {showDarkMode && (
            <div className={styles.iconButton} onClick={onDarkModeClick}>
              <svg viewBox="0 0 24 24" fill="none" className={styles.icon}>
                <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
