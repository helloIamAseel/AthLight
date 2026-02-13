import React from 'react';
import type { ReactNode } from 'react';
import styles from './FloatingCard.module.css';

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
}

const FloatingCard: React.FC<FloatingCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`${styles.card} ${className}`}>
      {children} 
    </div>
  );
};

export default FloatingCard;
