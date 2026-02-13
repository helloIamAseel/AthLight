import React from 'react';
import type { ReactNode } from 'react';
import styles from './UserHeader.module.css';

interface UserHeaderProps {
  avatar?: string;
  name: string;
  timestamp?: string;
  subtitle?: string;
  action?: ReactNode;
  onAvatarClick?: () => void;
  className?: string;
}

const UserHeader: React.FC<UserHeaderProps> = ({
  avatar,
  name,
  timestamp,
  subtitle,
  action,
  onAvatarClick,
  className = ''
}) => {
  return (
    <div className={`${styles.header} ${className}`}>
      <div className={styles.left}>
        <div 
          className={styles.avatar}
          onClick={onAvatarClick}
          style={{ cursor: onAvatarClick ? 'pointer' : 'default' }}
        >
          {avatar ? (
            <img src={avatar} alt={name} className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <svg viewBox="0 0 24 24" fill="none" className={styles.placeholderIcon}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
        
        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
          {timestamp && <div className={styles.timestamp}>{timestamp}</div>}
        </div>
      </div>
      
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default UserHeader;
