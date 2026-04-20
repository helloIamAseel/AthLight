"""
Player Identification Module
Helps identify which tracked player is the video uploader.

Process:
1. Select good frames for user to identify themselves
2. User clicks on themselves in each frame
3. Determine which track_id is the user based on clicks
"""

import json
import numpy as np
from typing import List, Dict, Optional
from collections import Counter
from pathlib import Path


class PlayerIdentifier:
    """
    Identifies which tracked player is the video uploader.
    """
    
    def __init__(self, tracking_data_path: str):
        """
        Initialize with tracking data from player_tracker.py
        
        Args:
            tracking_data_path: Path to tracking_data.json file
        """
        with open(tracking_data_path, 'r') as f: # this is just like try-with-resources in java
            self.tracking_data = json.load(f)
        
        self.video_info = self.tracking_data['video_info']
        self.frames = self.tracking_data['frames']
        self.valid_player_ids = set(self.tracking_data['summary']['player_ids'])
        
        print(f"Loaded tracking data: {len(self.frames)} frames, "
              f"{len(self.valid_player_ids)} valid players")
        
    def _get_frame_data(self, frame_number: int) -> Dict:
        """
        Safely get frame data by frame number.
        
        This method finds the frame by its frame_number field instead of
        assuming the list index matches the frame number. This makes it
        more robust if frames are ever filtered or reordered.
        
        Args:
            frame_number: The frame number to look up
            
        Returns:
            Frame data dictionary
            
        Raises:
            ValueError: If frame not found
        """
        # Try direct index first (fast path - works if list index = frame_number)
        if 0 <= frame_number < len(self.frames):
            if self.frames[frame_number]['frame_number'] == frame_number:
                return self.frames[frame_number]
        
        # Fallback: Search for frame by frame_number field (safe path)
        frame_data = next(
            (f for f in self.frames if f['frame_number'] == frame_number),
            None
        )
        
        if frame_data is None:
            raise ValueError(f"Frame {frame_number} not found in tracking data")
        
        return frame_data  
    
    def select_identification_frames(
        self, 
        num_frames: int = 4, 
        seed: Optional[int] = None
    ) -> List[Dict]:
        """
        Select optimal frames for user identification.
        
        Criteria for good frames:
        - Spread evenly across video
        - Have multiple players visible (easier to identify yourself)
        - Players are clearly visible (not too small)
        
        Args:
            num_frames: Number of frames to select
            seed: Random seed for reproducible selection (None = random)
        
        Returns:
            List of frame info dictionaries with frame_number and metadata
        """
        if seed is not None:
            np.random.seed(seed) # generate a random seed
        
        total_frames = len(self.frames)
        
        # Step 1: Score each frame based on quality
        frame_scores = []
        
        for frame_data in self.frames: # this loops goes through the list of dects "self.frames"
            frame_num = frame_data['frame_number']
            detections = frame_data['detections'] # assigning shorter names for easeier coding and readablty
            
            # Filter to only valid players
            valid_detections = []
            for d in detections:
                if d['track_id'] in self.valid_player_ids:
                    valid_detections.append(d)
            
            if len(valid_detections) == 0:
                continue # skip the current frame if no valid detections were founde
            
            # Score based on:
            # 1. Number of players (more = easier to identify yourself)
            # 2. Average bbox size (bigger = clearer)
            num_players = len(valid_detections)
            
            avg_size = np.mean([ # reads the x1,x2,y1,y2 from json file and calculats the area of each bbox
                (d['bbox']['x2'] - d['bbox']['x1']) * (d['bbox']['y2'] - d['bbox']['y1'])
                for d in valid_detections
            ])
            
            # Normalize size (assuming 1920x1080 frame), calculats avg for bbox sizes- 
            # -to score the frame (higher score better frame for the user to look for themselves)
            normalized_size = avg_size / (self.video_info['width'] * self.video_info['height'])
            
            # Combined score
            score = (num_players * 0.7) + (normalized_size * 1000 * 0.3)
            
            frame_scores.append({
                'frame_number': frame_num,
                'score': score,
                'num_players': num_players,
                'avg_size': avg_size
            })
        
        # Step 2: Select frames spread across video
        # Divide video into num_frames segments
        segment_size = total_frames // num_frames
        
        selected_frames = []
        
        for i in range(num_frames):
            # Define segment range
            segment_start = i * segment_size
            segment_end = (i + 1) * segment_size if i < num_frames - 1 else total_frames
            
            # Find frames in this segment
            segment_frames = [
                f for f in frame_scores 
                if segment_start <= f['frame_number'] < segment_end
            ]
            
            if not segment_frames:
                continue
            
            # Pick frame from this segment
            # Sort by score
            # lmabda is like a short way to make a function, here it returns the frame's score
            # reverse = True makes highest score first instead of lowest
            segment_frames_sorted = sorted(segment_frames, key=lambda x: x['score'], reverse=True)
            
            # Take top 4 candidates
            num_candidates = min(4, len(segment_frames_sorted))
            candidates = segment_frames_sorted[:num_candidates]
            
            if seed is None:
                # Truly random selection
                best_frame = candidates[np.random.randint(0, len(candidates))]
            else:
                # Use seed to pick different frame each time
                # Use seed + segment index to get different selection per segment
                idx = (seed + i) % len(candidates)
                best_frame = candidates[idx]
            
            selected_frames.append(best_frame)
        
        # Sort by frame number for user experience
        selected_frames.sort(key=lambda x: x['frame_number'])
        
        print(f"\nSelected {len(selected_frames)} frames for identification:")
        for f in selected_frames:
            print(f"  Frame {f['frame_number']}: {f['num_players']} players visible")
        
        return selected_frames
    
    def get_frame_image_path(self, frame_number: int, video_path: str, output_dir: str = "output/id_frames") -> str:
        """
        Extract a specific frame from video as image for frontend to display.
        
        Args:
            frame_number: Frame to extract
            video_path: Path to original video
            output_dir: Where to save frame images
        
        Returns:
            Path to saved frame image
        """
        import cv2
        
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        cap = cv2.VideoCapture(video_path)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number) # jumps to a frame rather than start from the begginig
        ret, frame = cap.read() # cap.read() returns 2 things at once, a boolean for ret and an image for frame
        cap.release()
        
        if not ret:
            raise ValueError(f"Could not read frame {frame_number}")
        
        # Draw bounding boxes around athelets on frame to help user
        frame_data = self._get_frame_data(frame_number)        
        for detection in frame_data['detections']:
            if detection['track_id'] not in self.valid_player_ids:
                continue
            
            bbox = detection['bbox']
            x1, y1 = int(bbox['x1']), int(bbox['y1'])
            x2, y2 = int(bbox['x2']), int(bbox['y2'])
            
            # Draw box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            
            # Draw ID
            cv2.putText(frame, f"#{detection['track_id']}", 
                       (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                       0.6, (0, 255, 0), 2)
        
        # Save
        output_path = f"{output_dir}/frame_{frame_number}.jpg"
        cv2.imwrite(output_path, frame)
        
        return output_path
    
    def identify_player_from_click(
        self, 
        frame_number: int, 
        click_x: float, 
        click_y: float
    ) -> Optional[int]:
        """
        Determine which player was clicked in a specific frame.
        
        Args:
            frame_number: Frame number where click occurred
            click_x: X coordinate of click
            click_y: Y coordinate of click
        
        Returns:
            track_id of clicked player, or None if no player at that location
        """
        frame_data = self._get_frame_data(frame_number)           
        # Check each detection to see if click is inside its bbox
        for detection in frame_data['detections']:
            if detection['track_id'] not in self.valid_player_ids:
                continue # to skip invalid ids
            
            bbox = detection['bbox']
            
            # Check if click is inside this bounding box
            if (bbox['x1'] <= click_x <= bbox['x2'] and 
                bbox['y1'] <= click_y <= bbox['y2']):
                return detection['track_id'] # if click was here return 
        
        return None
    
    def identify_player_from_multiple_clicks(
        self, 
        clicks: List[Dict[str, float]]
    ) -> Dict:
        """
        Identify player based on multiple clicks across different frames.
        Uses majority voting for robustness.
        
        Args:
            clicks: List of click dictionaries with keys:
                   - frame_number: int
                   - x: float
                   - y: float
        
        Returns:
            Dictionary with:
                - player_id: The identified track_id
                - confidence: How confident we are (0-1)
                - vote_counts: How many times each ID was clicked
                - failed_clicks: Number of clicks that didn't hit any player
        """
        identified_ids = []
        failed_clicks = 0 # usefull for debugging and ui/ux
        
        print(f"\nProcessing {len(clicks)} clicks...")
        
        for i, click in enumerate(clicks, 1): # gives both the index number and the value at the same time, 1 is for counting from 1
            frame_num = click['frame_number']
            x = click['x']
            y = click['y']
            
            player_id = self.identify_player_from_click(frame_num, x, y)
            
            if player_id is not None:
                identified_ids.append(player_id)
                print(f"  Click {i} (frame {frame_num}): Player #{player_id}")
            else:
                failed_clicks += 1
                print(f"  Click {i} (frame {frame_num}): No player found at ({x:.0f}, {y:.0f})")
        
        if not identified_ids:
            return {
                'player_id': None,
                'confidence': 0.0,
                'vote_counts': {},
                'failed_clicks': failed_clicks,
                'error': 'No valid player clicks detected'
            }
        
        # Count votes using Counter 
        vote_counts = Counter(identified_ids)

        top_players_list = vote_counts.most_common(1)   # list of size 1
        top_player_tuple = top_players_list[0]          # get top
        winner_id = top_player_tuple[0]                 # get id 
        winner_votes = top_player_tuple[1]              # get vote count        
        # Calculate confidence
        confidence = winner_votes / len(clicks)
        
        print(f"\nIdentification Result:")
        print(f"  Player ID: #{winner_id}")
        print(f"  Confidence: {confidence:.1%} ({winner_votes}/{len(clicks)} clicks)")
        print(f"  Vote breakdown: {dict(vote_counts)}")
        
        return {
            'player_id': winner_id,
            'confidence': confidence,
            'vote_counts': dict(vote_counts),
            'failed_clicks': failed_clicks
        }


def example_usage(): # FOR TESTING 
    """
    Example showing how to use the PlayerIdentifier.
    This simulates what the backend API will do.
    """
    print("="*70)
    print("PLAYER IDENTIFICATION - EXAMPLE USAGE")
    print("="*70)
    
    # Initialize
    identifier = PlayerIdentifier("output/final_tracked_data.json")
    
    # Step 1: Select frames for identification
    print("\n[STEP 1] Selecting frames for user to identify themselves...")
    selected_frames = identifier.select_identification_frames(num_frames=5, seed=0)
    
    # In real system, these frame numbers would be sent to frontend
    frame_numbers = [f['frame_number'] for f in selected_frames]
    print(f"\nFrames to show user: {frame_numbers}")
    
    # Step 2: Extract frame images (optional - for frontend display)
    print("\n[STEP 2] Extracting frame images...")
    # Uncomment if you have the video file:
    # for frame_num in frame_numbers:
    #     img_path = identifier.get_frame_image_path(frame_num, "input/sample.mp4")
    #     print(f"  Saved frame {frame_num} to {img_path}")
    
    # Step 3: Simulate user clicks (in real system, these come from frontend)
    print("\n[STEP 3] Simulating user clicks...")
    
    # Get actual player from first selected frame to simulate proper clicks
    print("\nFinding a player that appears in multiple frames...")
    
    # Count which players appear in selected frames
    player_appearances = {}
    for frame_num in frame_numbers:
        frame_data = identifier.frames[frame_num]
        for det in frame_data['detections']:
            if det['track_id'] in identifier.valid_player_ids:
                if det['track_id'] not in player_appearances:
                    player_appearances[det['track_id']] = []
                player_appearances[det['track_id']].append({
                    'frame': frame_num,
                    'bbox': det['bbox']
                })
    
    # Find player that appears in most frames
    best_player = max(player_appearances.items(), key=lambda x: len(x[1]))
    target_player_id = best_player[0]
    appearances = best_player[1]
    
    print(f"Simulating clicks on Player #{target_player_id} (appears in {len(appearances)}/{len(frame_numbers)} frames)")
    
    # Create clicks for this player
    example_clicks = []
    for frame_num in frame_numbers:
        # Find this player in this frame
        player_in_frame = next((a for a in appearances if a['frame'] == frame_num), None)
        
        if player_in_frame:
            # Click center of their bbox
            bbox = player_in_frame['bbox']
            x = (bbox['x1'] + bbox['x2']) / 2
            y = (bbox['y1'] + bbox['y2']) / 2
        else:
            # Player not in this frame, click random location (will fail)
            x, y = 500, 400
        
        example_clicks.append({'frame_number': frame_num, 'x': x, 'y': y})
    
    # Step 4: Identify player
    print("\n[STEP 4] Identifying player from clicks...")
    result = identifier.identify_player_from_multiple_clicks(example_clicks)
    
    # Step 5: Return result
    print("\n[STEP 5] Result to send back to backend:")
    print(json.dumps(result, indent=2))
    
    if result['player_id'] is not None:
        if result['confidence'] >= 0.6:
            print(f"\n✅ SUCCESS! User is Player #{result['player_id']}")
        else:
            print(f"\n⚠️  LOW CONFIDENCE ({result['confidence']:.1%})")
            print("   Recommend asking user to try again with different frames")
    else:
        print("\n❌ FAILED - No player identified")
        print("   User needs to click directly on players")


if __name__ == "__main__":
    example_usage()
