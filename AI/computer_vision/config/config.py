"""
Configuration file for Player Tracking Module
==============================================
This file contains all the settings.
"""

import os
from pathlib import Path

# Base directory for this file
BASE_DIR = Path(__file__).parent.parent

# Model settings
MODEL_CONFIG = {
    'model_path': BASE_DIR / 'models' / 'yolov8n.pt',
    'confidence_threshold': 0.15,  # Minimum confidence (0-1). Lower = more detections but more false positives
    'iou_threshold': 0.7,  # Intersection over Union threshold for tracking
}

# Video processing settings
VIDEO_CONFIG = {
    'input_dir': BASE_DIR / 'input',  # Where uploaded videos are stored
    'output_dir': BASE_DIR / 'output',  # Where processed videos are saved
    'save_tracking_data': True,  # Whether to save JSON files with tracking data
}

# Tracking settings
TRACKING_CONFIG = {
    'tracker_type': 'bytetrack',  # Options: 'bytetrack', 'botsort'
    'persist': True,  # Keep track IDs consistent across frames
}

# Detection settings
DETECTION_CONFIG = {
    'classes_to_detect': [0],  # 0 = person in COCO dataset
    # If you train a custom model later for specific roles, you can adjust this
}

# Output settings
OUTPUT_CONFIG = {
    'draw_boxes': True,  # Draw bounding boxes on output video
    'draw_labels': True,  # Draw track IDs on output video
    'save_annotated_video': True,  # Save video with annotations
    'video_codec': 'mp4v',  # Codec for output video
}

# Create necessary directories
VIDEO_CONFIG['input_dir'].mkdir(parents=True, exist_ok=True)
VIDEO_CONFIG['output_dir'].mkdir(parents=True, exist_ok=True)
