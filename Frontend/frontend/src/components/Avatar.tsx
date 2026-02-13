import React from 'react';
import type { ReactNode } from 'react';
import styles from './Avatar.module.css';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'small' | 'medium' | 'large';
  showCamera?: boolean;
  onCameraClick?: () => void;
  children?: ReactNode;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  size = 'medium',
  showCamera = false,
  onCameraClick,
  children
}) => {
  const sizeClass = styles[size];

  return (
    <div className={`${styles.avatarWrapper} ${sizeClass}`}>
      <div className={styles.avatarRing}>
        {src ? (
          <img src={src} alt={alt} className={styles.avatarImage} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {children || (
              <svg viewBox="0 0 24 24" fill="none" className={styles.placeholderIcon}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        )}
      </div>
      
      {showCamera && (
        <button 
          className={styles.cameraButton}
          onClick={onCameraClick}
          aria-label="Upload photo"
        >
          <svg viewBox="0 0 24 24" fill="none" className={styles.cameraIcon}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" fill="currentColor"/>
            <circle cx="12" cy="13" r="4" fill="white"/>
          </svg>
        </button>
      )}
    </div>
  );
};

export default Avatar;
