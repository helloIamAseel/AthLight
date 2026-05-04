"""
Computer Vision Routes
Endpoints for player tracking, identification, and stats calculation.
"""
 
from flask import Blueprint, request
import json
from pathlib import Path
import os
import time
import json
import tempfile
import requests
from pathlib import Path
from datetime import datetime
from flask import Blueprint, request
 
# Import CV modules
from config import PlayerTracker, StatsExtractor, PlayerIdentifier, FieldCalibrator
 
cv_bp = Blueprint('computer_vision', __name__)
 
@cv_bp.route('/api/track-video', methods=['POST']) #tracking endpoint
def track_video():
    """Track players in a video."""
    try:
        data = request.json
        
        # Get video URL
        video_url = data.get('video_url')
        if not video_url:
            return {"error": "video_url is required"}, 400
        
      # Download video to temp folder
        import requests
        import tempfile
        
        # Create temp file
        temp_dir = tempfile.gettempdir()
        temp_video = os.path.join(temp_dir, f"video_{int(time.time())}.mp4")
        
        # Download
        response = requests.get(video_url, stream=True)
        with open(temp_video, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        print(f"Video downloaded to: {temp_video}")
        
        # Define output paths
        cv_output_dir = Path(__file__).parent.parent.parent / 'computer_vision' / 'output'
        cv_output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_json = str(cv_output_dir / f'tracked_{timestamp}_data.json')
        
        # Model path
        model_path = str(Path(__file__).parent.parent.parent / 'computer_vision' / 'models' / 'yolov8n.pt')
        
        # Track video (NO output video with boxes needed!)
        print(f"Starting tracking...")
        tracker = PlayerTracker(
            model_path=model_path,
            confidence=0.2,
            min_frames=120
        )
        
        tracking_data = tracker.process_video(
            video_path=temp_video,
            output_path=None  # Don't save tracked video!
        )
        
        # Save tracking data JSON
        with open(output_json, 'w') as f:
            json.dump(tracking_data, f)
        
        # Delete temp video
        os.remove(temp_video)
        
        return {
            "status": "success",
            "message": f"Successfully tracked {tracking_data['summary']['valid_unique_players']} players",
            "num_players": tracking_data['summary']['valid_unique_players'],
            "tracking_data_path": output_json,
            "player_ids": tracking_data['summary']['player_ids']
        }
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": f"Tracking failed: {str(e)}"}, 500
     
 
@cv_bp.route('/api/identify-player', methods=['POST']) #palyer IDing endpoint 
def identify_player():
    """
    Identify which player is the user based on clicks.
    
    Expected input (JSON):
    {
        "tracking_data_path": "output/tracking_data.json",
        "video_path": "path/to/video.mp4",
        "clicks": [
            {"frame_number": 150, "x": 850, "y": 420},
            {"frame_number": 300, "x": 920, "y": 450},
            {"frame_number": 450, "x": 880, "y": 430}
        ]
    }
    
    Returns:
    {
        "status": "success",
        "player_id": 165,
        "confidence": 0.8,
        "num_clicks": 3
    }
    """
    try:
        data = request.json
        
        tracking_data_path = data.get('tracking_data_path')
        video_url = data.get('video_url')  # Original video URL
        num_frames = data.get('num_frames')
        clicks = data.get('clicks', [])
        
        if not tracking_data_path:
            return {"error": "tracking_data_path is required"}, 400
        
        # Create identifier
        identifier = PlayerIdentifier(tracking_data_path=tracking_data_path)

        # 1. Extract CLEAN frames
        if num_frames:
            # Download original video
            import requests
            import tempfile
            
            temp_video = os.path.join(tempfile.gettempdir(), f"vid_{int(time.time())}.mp4")
            response = requests.get(video_url, stream=True)
            with open(temp_video, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Extract clean frames from ORIGINAL video
            selected_frames = identifier.select_identification_frames(num_frames=int(num_frames))
            
            frame_results = []
            for f in selected_frames:
                # Extract CLEAN frame 
                img_path = identifier.get_clean_frame(
                    frame_number=f['frame_number'],
                    video_path=temp_video  # Use original video
                )
                frame_results.append({
                    "frame_number": f['frame_number'],
                    "image_url": img_path
                })
            
            # Delete temp video
            os.remove(temp_video)
            
            return {
                "status": "success",
                "message": "Clean frames extracted successfully",
                "frames": frame_results
            }

        # 2. Identify player from clicks
        if clicks:
            result = identifier.identify_player_from_multiple_clicks(clicks)
            return {
                "status": "success",
                "player_id": result['player_id'],
                "confidence": result['confidence']
            }

        return {"error": "Provide num_frames OR clicks"}, 400
        
    except Exception as e:
        return {"error": f"Identification failed: {str(e)}"}, 500
 
 
@cv_bp.route('/api/calculate-stats', methods=['POST']) #stat calc endpoint
def calculate_stats():
    """
    Calculate performance stats for a player.
    
    Expected input (JSON):
    {
        "tracking_data_path": "output/tracking_data.json",
        "player_id": 165,
        "video_path": "path/to/video.mp4",
        "calibration_method": "auto"  // Optional: "auto", "manual", or "auto_corrected"
    }
    
    Returns:
    {
        "status": "success",
        "player_id": 165,
        "overall_score": 75.4,
        "speed": {"score": 74.2, "max_speed_kmh": 26.7, ...},
        "distance": {"score": 73.1, "total_km": 0.02, ...},
        "agility": {"score": 78.6, ...},
        "calibration_method": "auto_corrected",
        "calibration_confidence": "medium"
    }
    """
    try:
        data = request.json
        
        # Required fields
        tracking_data_path = data.get('tracking_data_path')
        player_id = data.get('player_id')
        video_path = data.get('video_path')
        
        # Validate input
        if not tracking_data_path:
            return {"error": "tracking_data_path is required"}, 400
        if player_id is None:
            return {"error": "player_id is required"}, 400
        if not video_path:
            return {"error": "video_path is required"}, 400
        
        # Check files exist
        if not Path(tracking_data_path).exists():
            return {"error": f"Tracking data not found: {tracking_data_path}"}, 404
        if not Path(video_path).exists():
            return {"error": f"Video file not found: {video_path}"}, 404
        
         # Load tracking data
        with open(tracking_data_path, 'r') as f:
            tracking_data = json.load(f)
        
        # Validate player exists
        if player_id not in tracking_data['summary']['player_ids']:
            return {
                "error": f"Player {player_id} not found in tracking data. Available players: {tracking_data['summary']['player_ids']}"
            }, 404
        
        # Run calibration
        print(f"Calibrating field for video: {video_path}")
        calibrator = FieldCalibrator(video_path)
        calibration_result = calibrator.calibrate()
        
        pixels_per_meter = calibration_result['pixels_per_meter']
        confidence = calibration_result['confidence']
        calibration_method = calibration_result['method']
        
        # Initialize stats extractor
        extractor = StatsExtractor(
            tracking_data_path=tracking_data_path,
            calibration=calibrator,
            player_id=player_id
        )
        
        # Calculate all stats
        print(f"Calculating stats for player {player_id}")
        stats = extractor.calculate_all_stats()
        
        # Add metadata
        stats['calibration_method'] = calibration_method
        stats['calibration_confidence'] = confidence
        
        return {
            "status": "success",
            **stats  # Unpack all stats into a response
        }
        
    except Exception as e:
        return {"error": f"Stats calculation failed: {str(e)}"}, 500