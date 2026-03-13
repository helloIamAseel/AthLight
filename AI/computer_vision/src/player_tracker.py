"""
Player Tracking Module (Supervision Version).
This module handles detection and tracking of football players in uploaded videos.
Uses the supervision library for more stable tracking (same as the reference repo).

How it works:
1. YOLO detects all "person" objects in each frame
2. Supervision's ByteTrack tracker assigns and maintains unique IDs
3. We filter to keep only "person" class (class_id = 0 in COCO dataset)
4. Results are saved as an annotated video
"""

from ultralytics import YOLO
import supervision as sv 
import cv2
from pathlib import Path
import json
from typing import Dict
import numpy as np
from collections import Counter



class PlayerTracker:
    """
    Main class for detecting and tracking players in football videos.
    Uses supervision library for better tracking stability.
    
    Attributes:
        model: YOLOv8 model instance
        tracker: Supervision ByteTrack tracker
        model_path: Path to the YOLO weights file
        confidence_threshold: Minimum confidence for detections (0-1)
    """
    
    def __init__(self, model_path: str, confidence_threshold: float = 0.2):
     """
     Initialize the player tracker.
     """
    # Store parameters
     self.model_path = model_path
     self.confidence_threshold = confidence_threshold

    # Load YOLO model
     print(f"Loading YOLO model from {model_path}...")
     self.model = YOLO(model_path)
     print("Model loaded successfully!")

    # Initialize supervision ByteTrack tracker
     print("Initializing ByteTrack tracker...")
     self.tracker = sv.ByteTrack()

    # Initialize annotators
     self.box_annotator = sv.BoxAnnotator(thickness=2)
     self.label_annotator = sv.LabelAnnotator(
        text_thickness=2,
        text_scale=0.5
    )

    print("PlayerTracker initialized successfully")


    print("Tracker initialized!")
        
    def process_video(self, video_path: str, output_path: str, save_tracking_data: bool = True) -> Dict: # this method will return a dictionary
        """
        Process a video to detect and track all players.
        
        Args:
            video_path: Path to input video file
            output_path: Path where processed video will be saved
            save_tracking_data: Whether to save tracking data as JSON (usefull when testing)
            
        Returns:
            Dictionary containing tracking statistics and metadata
        """
        # Open the video
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened(): # throw exception.. raise = throw in java
            raise ValueError(f"Could not open video: {video_path}")
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS)) # frames per second
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)) 
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)) # total numbers of frames
        
        print(f"\nVideo Info:")
        print(f"  Resolution: {width}x{height}")
        print(f"  FPS: {fps}")
        print(f"  Total Frames: {total_frames}")
        print(f"  Duration: {total_frames/fps:.2f} seconds")
        
        # Setup video writer for output, meaning it creat an open file for the output to be added in later 
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        
        # this is the blueprint for the json file of the data
        tracking_data = { # this a pyhton var of type dict
            'video_info': { # another dict 
                'fps': fps,
                'width': width,
                'height': height,
                'total_frames': total_frames
            },
            'frames': []  # Will store per-frame tracking data
        }
        
        frame_count = 0
        unique_player_ids = set()
        
        print("\nProcessing video...")
        
        while True: # this loop reads the vid 
            success, frame = cap.read() # this a short hand syntax that catches the 2 vars returned by cap.raed()
            if not success:
                break

            # this code detects the field to isolate to make sure only players are detected and not other ppl
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV) # changes colors from RGB to HSV

            lower_green = np.array([35, 40, 40])  # arrays of hsv values for shades of green
            upper_green = np.array([85, 255, 255])
            
            """ scans every frame and comare it to the green shades to then creat an image 
            with everythig considered field is white and the rest is black """
            field_mask = cv2.inRange(hsv, lower_green, upper_green) 
            
            # STEP 1: Run YOLO detection (NO tracking yet)
            results = self.model.predict(
                frame, # from the loop that came before
                conf=self.confidence_threshold,
                classes=[0],  # 0 = person in COCO dataset that YOLO was trained on
                verbose=False  # Suppress YOLO output so it doesn't keep writing to the console
            )[0] # YOLO returns a list of detections results for each frame and we only want the 1st one
            
            # STEP 2: Convert to supervision format
            detections = sv.Detections.from_ultralytics(results)

            # field-based filtring
            if detections.xyxy is not None and len(detections) > 0: # make sure there are actually detections to process
                keep_mask = [] # for storing true/false for each detection (t=keep it/f= ignore)

                for bbox in detections.xyxy:
                    x1, y1, x2, y2 = bbox

                    # bottom-center point (feet) so we can know who is standing on the field
                    foot_x = int((x1 + x2) / 2)
                    foot_y = int(y2)

                    # makes sure the feet are in frame 
                    foot_x = np.clip(foot_x, 0, field_mask.shape[1] - 1)
                    foot_y = np.clip(foot_y, 0, field_mask.shape[0] - 1)

                    # check if feet are on grass
                    on_field = field_mask[foot_y, foot_x] > 0
                    keep_mask.append(on_field)

                detections = detections[np.array(keep_mask)]

            
            # STEP 2.5: size filtering 
            if detections.xyxy is not None and len(detections) > 0:
                widths = detections.xyxy[:, 2] - detections.xyxy[:, 0]
                heights = detections.xyxy[:, 3] - detections.xyxy[:, 1]

                # numbers here can be changed to make the filtering more or less strict
                mask = (widths > 60) & (heights > 120)
                detections = detections[mask]

            
            # STEP 3: use byteTrack tracker
            detections = self.tracker.update_with_detections(detections)
            
            # extract tracking information from this frame
            frame_data = self._extract_frame_data(detections, frame_count)
            tracking_data['frames'].append(frame_data)
            
            # collect unique player IDs
            if frame_data['detections']:
                for detection in frame_data['detections']:
                    unique_player_ids.add(detection['track_id'])
            
            # draw boxes and IDs on the frame
            annotated_frame = self._draw_annotations(frame.copy(), detections)
            
            # Write the annotated frame to output video
            out.write(annotated_frame)
            
            frame_count += 1
            
            # progress indicator (helpful to see what is happening during testing)
            if frame_count % 30 == 0:
                progress = (frame_count / total_frames) * 100
                print(f"  Progress: {progress:.1f}% ({frame_count}/{total_frames} frames) - Unique IDs so far: {len(unique_player_ids)}")
                
        
        # closes opened files
        cap.release()
        out.release()

        MIN_FRAMES = 60 # an athlete should be in at least 60 frames to be 'real'

        id_counts = Counter() # loops throug every frame to count how many frames each ID was in
        for frame in tracking_data['frames']:
            for det in frame['detections']:
                id_counts[det['track_id']] += 1

        # in a set store the valide IDs
        valid_ids = {pid for pid, count in id_counts.items() if count >= MIN_FRAMES}


        tracking_data['summary'] = { # to show the final results
            'total_frames_processed': frame_count,
            'unique_players_detected': len(valid_ids),
            'player_ids': sorted(list(valid_ids))
        }

        
        print(f"\n✓ Processing complete!")
        print(f"  Frames processed: {frame_count}")
        print(f"  Unique players detected: {len(unique_player_ids)}")
        print(f"  Player IDs: {sorted(list(unique_player_ids))}")
        print(f"  Output saved to: {output_path}")

        print(
            f"Frame {frame_count}: "
            f"YOLO detections = {len(results.boxes) if results.boxes is not None else 0}, "
            f"Tracked = {len(detections)}"
        )

        
        # save tracking data as JSON
        if save_tracking_data:
            json_path = output_path.replace('.mp4', '_tracking_data.json')
            with open(json_path, 'w') as f:
                json.dump(tracking_data, f, indent=2)
            print(f"  Tracking data saved to: {json_path}")
        
        return tracking_data
    
    def _extract_frame_data(self, detections: sv.Detections, frame_number: int) -> Dict:
        """
        Extract tracking data from supervision Detections object.
        
        Args:
            detections: Supervision Detections object with tracking IDs
            frame_number: Current frame number
            
        Returns:
            Dictionary with frame number and list of detections
        """
        frame_data = {
            'frame_number': frame_number,
            'detections': []
        }
        
        # check if there are any detections
        if len(detections) == 0:
            return frame_data
        
        # extract data for each detected person
        for i in range(len(detections)):
            bbox = detections.xyxy[i]
            x1, y1, x2, y2 = bbox
    
            if detections.confidence is not None:
                confidence = detections.confidence[i]
            else:
                confidence = 1.0
        
            if detections.tracker_id is not None:
                 track_id = detections.tracker_id[i]
            else:
                track_id = -1
    
            detection = { # a dict of athelet data
                'track_id': int(track_id),
                'confidence': float(confidence),
                'bbox': {
                    'x1': float(x1),
                    'y1': float(y1),
                    'x2': float(x2),
                    'y2': float(y2),
                    'center_x': float((x1 + x2) / 2),
                    'center_y': float((y1 + y2) / 2)
                }
            }
    
            frame_data['detections'].append(detection)
        
        return frame_data
    
    def _draw_annotations(self, frame: np.ndarray, detections: sv.Detections) -> np.ndarray:
        """
        Draw bounding boxes and track IDs on the frame.
        
        Args:
            frame: Video frame
            detections: Supervision Detections with tracking IDs
            
        Returns:
            Annotated frame
        """
        # Use supervision's built-in annotators for consistent visualization
        box_annotator = sv.BoxAnnotator(thickness=2)
        label_annotator = sv.LabelAnnotator(text_thickness=2, text_scale=0.5)
        
        # Create labels with track IDs
        labels = []
        if detections.tracker_id is not None:
            labels = [f"#{tracker_id}" for tracker_id in detections.tracker_id]
        
        # Draw boxes and labels
        frame = box_annotator.annotate(scene=frame, detections=detections)
        if labels:
            frame = label_annotator.annotate(scene=frame, detections=detections, labels=labels)
        
        return frame


def main(): # fOR TESTINGGGG
    """
    Example usage of the PlayerTracker class.
    This shows how to use the tracker with a sample video.
    """
    # Paths (you'll need to adjust these)
    MODEL_PATH = "../models/yolov8n.pt"
    VIDEO_PATH = "path/to/your/video.mp4"  # Change this
    OUTPUT_PATH = "../output/tracked_video.mp4"
    
    # Create output directory if it doesn't exist
    Path("../output").mkdir(parents=True, exist_ok=True)
    
    # Initialize tracker
    tracker = PlayerTracker(
        model_path=MODEL_PATH,
        confidence_threshold=0.3  # Lower confidence works better with supervision
    )
    
    # Process the video
    results = tracker.process_video(
        video_path=VIDEO_PATH,
        output_path=OUTPUT_PATH,
        save_tracking_data=True
    )
    
    print("\n" + "="*50)
    print("TRACKING COMPLETE")
    print("="*50)


if __name__ == "__main__":
    main()
