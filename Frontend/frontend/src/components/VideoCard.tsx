import React from 'react';
import styles from './VideoCard.module.css';

interface VideoCardProps {
  thumbnail: string;
  title: string;
  category?: string;
  views?: number;
  date?: string;
  onPlay?: () => void;
  onDelete?: () => void;
  className?: string;
}

const VideoCard: React.FC<VideoCardProps> = ({
  thumbnail,
  title,
  category,
  views,
  date,
  onPlay,
  onDelete,
  className = ''
}) => {
  return (
    <div className={`${styles.card} ${className}`}>
      <div className={styles.thumbnail} onClick={onPlay}>
        <img src={thumbnail} alt={title} className={styles.thumbnailImage} />
        <button className={styles.playButton} aria-label="Play video">
          <svg viewBox="0 0 24 24" fill="currentColor" className={styles.playIcon}>
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        
        <div className={styles.meta}>
          {category && <span className={styles.category}>{category}</span>}
          {views !== undefined && <span className={styles.views}>{views.toLocaleString()} views</span>}
        </div>
        
        {date && <div className={styles.date}>{date}</div>}
        
        {onDelete && (
          <button 
            className={styles.deleteButton}
            onClick={onDelete}
            aria-label="Delete video"
          >
            <svg viewBox="0 0 24 24" fill="none" className={styles.deleteIcon}>
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoCard;
