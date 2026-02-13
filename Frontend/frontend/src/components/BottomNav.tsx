import React from 'react';
import styles from './BottomNav.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
  activeId: string;
  onItemClick: (id: string) => void;
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({
  items,
  activeId,
  onItemClick,
  className = ''
}) => {
  return (
    <nav className={`${styles.nav} ${className}`}>
      {items.map((item) => (
        <button
          key={item.id}
          className={`${styles.navItem} ${activeId === item.id ? styles.active : ''}`}
          onClick={() => onItemClick(item.id)}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
