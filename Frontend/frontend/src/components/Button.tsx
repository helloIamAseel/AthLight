import React from 'react';
import type { ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'text' | 'link';
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  large?: boolean;
  style?: React.CSSProperties;
}

const Button: React.FC<ButtonProps> = ({
  type = 'button',
  variant = 'primary',
  onClick,
  disabled = false,
  children,
  className = '',
  large = false,
  style, 
}) => {
  const getClassName = () => {
    const classes = [styles.button];
    
    if (variant === 'primary') classes.push(styles.primary);
    if (variant === 'secondary') classes.push(styles.secondary);
    if (variant === 'text') classes.push(styles.text);
    if (variant === 'link') classes.push(styles.link);
    if (large) classes.push(styles.large);
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <button
      type={type}
      className={getClassName()}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
};

export default Button;
