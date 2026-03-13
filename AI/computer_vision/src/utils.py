"""
Utility functions for player tracking (most are probeply not really used)
Helper functions.
"""

import cv2
import json
from pathlib import Path
from typing import List, Dict, Tuple
import numpy as np


def validate_video(video_path: str) -> Tuple[bool, str]:
    """
    Check if a video file is valid and can be opened.
    
    Args:
        video_path: Path to video file
        
    Returns:
        Tuple of (is_valid, message)
    """
    if not Path(video_path).exists():
        return False, f"File does not exist: {video_path}"
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        cap.release()
        return False, f"Could not open video file: {video_path}"
    
    # Check if video has frames
    ret, frame = cap.read()
    cap.release()
    
    if not ret:
        return False, f"Video file appears to be empty or corrupted: {video_path}"
    
    return True, "Video is valid"


def get_video_info(video_path: str) -> Dict:
    """
    Extract metadata from a video file.
    
    Args:
        video_path: Path to video file
        
    Returns:
        Dictionary with video metadata
    """
    cap = cv2.VideoCapture(video_path)
    
    info = {
        'width': int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
        'height': int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        'fps': int(cap.get(cv2.CAP_PROP_FPS)),
        'frame_count': int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
        'duration_seconds': 0,
        'file_size_mb': 0
    }
    
    if info['fps'] > 0:
        info['duration_seconds'] = info['frame_count'] / info['fps']
    
    file_size_bytes = Path(video_path).stat().st_size
    info['file_size_mb'] = round(file_size_bytes / (1024 * 1024), 2)
    
    cap.release()
    return info


def calculate_iou(box1: List[float], box2: List[float]) -> float:
    """
    Calculate Intersection over Union (IoU) between two bounding boxes.
    
    This measures how much two boxes overlap. Used in tracking to determine
    if a detection in frame N is the same person as a detection in frame N+1.
    
    Args:
        box1: [x1, y1, x2, y2] format
        box2: [x1, y1, x2, y2] format
        
    Returns:
        IoU value between 0 and 1 (1 = perfect overlap)
    """
    x1_1, y1_1, x2_1, y2_1 = box1
    x1_2, y1_2, x2_2, y2_2 = box2
    
    # Calculate intersection area
    x1_i = max(x1_1, x1_2)
    y1_i = max(y1_1, y1_2)
    x2_i = min(x2_1, x2_2)
    y2_i = min(y2_1, y2_2)
    
    if x2_i < x1_i or y2_i < y1_i:
        return 0.0
    
    intersection = (x2_i - x1_i) * (y2_i - y1_i)
    
    # Calculate union area
    area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
    area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
    union = area1 + area2 - intersection
    
    return intersection / union if union > 0 else 0.0

def extract_player_frames(
    video_path: str, 
    tracking_data: Dict, 
    player_id: int,
    output_dir: str,
    sample_rate: int = 30
):
    """Extract frames showing a specific player."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Get trajectory from tracking data
    trajectory = []
    for frame in tracking_data['frames']:
        for detection in frame['detections']:
            if detection['track_id'] == player_id:
                trajectory.append({
                    'frame_number': frame['frame_number'],
                    'bbox': detection['bbox']  # ← Use 'bbox' directly
                })
                break
    
    if not trajectory:
        print(f"Player {player_id} not found in tracking data")
        return
    
    cap = cv2.VideoCapture(video_path)
    saved_count = 0
    
    for i, point in enumerate(trajectory):
        if i % sample_rate != 0:
            continue
        
        frame_number = point['frame_number']
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
        ret, frame = cap.read()
        
        if not ret:
            continue
        
        # Get bounding box
        bbox = point['bbox']  # ← Changed from 'position'
        x1, y1 = int(bbox['x1']), int(bbox['y1'])
        x2, y2 = int(bbox['x2']), int(bbox['y2'])
        
        # Add padding
        padding = 20
        x1 = max(0, x1 - padding)
        y1 = max(0, y1 - padding)
        x2 = min(frame.shape[1], x2 + padding)
        y2 = min(frame.shape[0], y2 + padding)
        
        # Crop and save
        cropped = frame[y1:y2, x1:x2]
        output_file = output_path / f"player_{player_id}_frame_{frame_number:06d}.jpg"
        cv2.imwrite(str(output_file), cropped)
        saved_count += 1
    
    cap.release()
    print(f"Saved {saved_count} frames of player {player_id} to {output_dir}")

if __name__ == "__main__":
    print("Utility functions for player tracking")
    print("Import this module to use these functions in your code")
