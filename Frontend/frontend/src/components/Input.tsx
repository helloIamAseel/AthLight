import React from 'react';
import styles from './Input.module.css';

interface InputProps {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  valid?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  error = false,
  valid = false,
  className = '',
}) => {
  const getClassName = () => {
    const classes = [styles.input];
    
    if (error) classes.push(styles.error);
    if (valid) classes.push(styles.valid);
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={getClassName()}
    />
  );
};

export default Input;
