import React from 'react';
import styles from './NotificationBadge.module.css';

interface NotificationBadgeProps {
  count: number;
  onClick?: () => void;
  className?: string;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  onClick,
  className = ''
}) => {
  if (count === 0) return null;

  const displayCount = count > 99 ? '99+' : count;

  return (
    <button 
      className={`${styles.badge} ${className}`}
      onClick={onClick}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </button>
  );
};

export default NotificationBadge;
