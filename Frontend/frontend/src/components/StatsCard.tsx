import React from 'react';
import type { ReactNode } from 'react';
import styles from './StatsCard.module.css';

interface StatsCardProps {
  label: string;
  value: string | number;
  children?: ReactNode;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  children,
  className = ''
}) => {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{children || value}</div>
    </div>
  );
};

export default StatsCard;
