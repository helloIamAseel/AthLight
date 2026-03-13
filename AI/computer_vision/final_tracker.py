"""
FINAL Player Tracker - Production Ready
========================================
Simple, clean tracker with lifespan filtering.
Based on diagnostic: filters IDs that appear < 60 frames.
"""

from ultralytics import YOLO
import supervision as sv
import cv2
from pathlib import Path
import json
from collections import Counter
import numpy as np


class PlayerTrackerFinal:
    
    def __init__(self, model_path: str, confidence: float = 0.2, min_frames: int = 120): #only those who last for 120+ frames are valid
        """
        Args:
            confidence: Detection confidence (0.1-0.3)
            min_frames: Minimum frames to count as valid player
        """
        self.confidence = confidence
        self.min_frames = min_frames
        
        print(f"Loading YOLO model...")
        self.model = YOLO(model_path)
        
        print(f"Initializing tracker...")
        self.tracker = sv.ByteTrack()  # To find the same player in all frames
        
        print(f"Settings: conf={confidence}, min_frames={min_frames}")
    
    def process_video(self, video_path: str, output_path: str):
        cap = cv2.VideoCapture(video_path)
        
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"\nVideo: {width}x{height}, {fps}fps, {total_frames} frames")
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        tracking_data = {
            'video_info': {'fps': fps, 'width': width, 'height': height, 'total_frames': total_frames},
            'frames': []
        }
        
        frame_count = 0
        id_frame_counts = Counter()  # Count frames each ID appears
        
        print("\nProcessing...")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Detect by running yolo then converting the results to a supervision object
            results = self.model.predict(frame, conf=self.confidence, classes=[0], verbose=False)[0]
            detections = sv.Detections.from_ultralytics(results)
            
            # Track
            detections = self.tracker.update_with_detections(detections)
            
            # Store frame data
            frame_data = {'frame_number': frame_count, 'detections': []}
            
            if detections.tracker_id is not None:
                for i in range(len(detections)):
                    track_id = int(detections.tracker_id[i])
                    bbox = detections.xyxy[i]
                    conf = float(detections.confidence[i]) if detections.confidence is not None else 1.0
                    
                    # Count this appearance
                    id_frame_counts[track_id] += 1
                    
                    # Store detection
                    x1, y1, x2, y2 = bbox
                    frame_data['detections'].append({
                        'track_id': track_id,
                        'confidence': conf,
                        'bbox': {
                            'x1': float(x1), 'y1': float(y1),
                            'x2': float(x2), 'y2': float(y2),
                            'center_x': float((x1+x2)/2),
                            'center_y': float((y1+y2)/2)
                        }
                    })
            
            tracking_data['frames'].append(frame_data)
            
            # Annotate
            annotated = self._draw(frame.copy(), detections)
            out.write(annotated)
            
            frame_count += 1
            
            if frame_count % 30 == 0:
                print(f"  Frame {frame_count}/{total_frames} ({frame_count/total_frames*100:.0f}%)")
        
        cap.release()
        out.release()
        
        # FILTER: Only keep IDs that appeared for min_frames or more
        valid_ids = {pid for pid, count in id_frame_counts.items() if count >= self.min_frames}
        
        print(f"\n{'='*60}")
        print(f"Raw unique IDs: {len(id_frame_counts)}")
        print(f"Valid players (>={self.min_frames} frames): {len(valid_ids)}")
        print(f"Player IDs: {sorted(valid_ids)}")
        print(f"{'='*60}")
        
        # Summary
        tracking_data['summary'] = {
            'total_frames': frame_count,
            'raw_unique_ids': len(id_frame_counts),
            'valid_unique_players': len(valid_ids),
            'player_ids': sorted(valid_ids),
            'min_frames_threshold': self.min_frames
        }
        
        # Save
        json_path = output_path.replace('.mp4', '_data.json')
        with open(json_path, 'w') as f:
            json.dump(tracking_data, f, indent=2)
        
        print(f"\nOutput: {output_path}")
        print(f"Data: {json_path}")
        
        return tracking_data
    
    def _draw(self, frame, detections):
        box_annotator = sv.BoxAnnotator(thickness=2, color=sv.Color.GREEN)
        label_annotator = sv.LabelAnnotator(text_thickness=2, text_scale=0.6)
        
        labels = []
        if detections.tracker_id is not None:
            labels = [f"#{int(tid)}" for tid in detections.tracker_id]
        
        frame = box_annotator.annotate(scene=frame, detections=detections)
        if labels:
            frame = label_annotator.annotate(scene=frame, detections=detections, labels=labels)
        
        return frame


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2: # To give the option to pass in other valuse of min_frames, usefull for testing
        print("\nUsage: python final_tracker.py <video_path> [min_frames]")
        print("Example: python final_tracker.py input/match.mp4 60")
        sys.exit(1)
    
    video = sys.argv[1]
    min_frames = int(sys.argv[2]) if len(sys.argv) > 2 else 60
    
    tracker = PlayerTrackerFinal("models/yolov8n.pt", confidence=0.2, min_frames=min_frames)
    result = tracker.process_video(video, "output/final_tracked.mp4")
    
    count = result['summary']['valid_unique_players']

