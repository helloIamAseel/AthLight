"""
Player Stats Extraction Module
==============================
Calculates performance statistics for an identified player.

Stats calculated:
1. Speed (0-100 score)
2. Distance Covered (0-100 score)
3. Agility Score (0-100 score)
"""

import json
import numpy as np
from typing import Dict, List, Tuple
from pathlib import Path
import sys
sys.path.append(str(Path(__file__).parent)) # to make imports work 
from field_calibrator import FieldCalibrator


class StatsExtractor:
    """
    Extracts and calculates performance statistics for a player.
    """
    
    def __init__(
        self, 
        tracking_data_path: str,
        calibration: FieldCalibrator,
        player_id: int
    ):
        """
        Initialize stats extractor.
        
        Args:
            tracking_data_path: Path to tracking data JSON
            calibration: FieldCalibrator instance (already calibrated)
            player_id: Track ID of the player to analyze
        """
        with open(tracking_data_path, 'r') as f:
            self.tracking_data = json.load(f)
        
        self.calibration = calibration
        self.player_id = player_id
        self.fps = self.tracking_data['video_info']['fps']
        
        # Extract player's trajectory
        self.trajectory = self._extract_player_trajectory()
        
        print(f"\nStats Extractor initialized for Player #{player_id}")
        print(f"  Frames where player appears: {len(self.trajectory)}")
        print(f"  Video FPS: {self.fps}")
    
    def _extract_player_trajectory(self) -> List[Dict]:
        """
        Extract all frames where the target player appears.
        
        Returns:
            List of frame data with player's position
        """
        trajectory = []
        
        for frame in self.tracking_data['frames']:
            for detection in frame['detections']:
                if detection['track_id'] == self.player_id:
                    trajectory.append({ # a list of dicts
                        'frame_number': frame['frame_number'],
                        'time_seconds': frame['frame_number'] / self.fps,
                        'bbox': detection['bbox'],
                        'position_pixels': ( # a tuple
                            detection['bbox']['center_x'],
                            detection['bbox']['center_y']
                        ),
                        'confidence': detection['confidence']
                    })
                    break
        
        return trajectory
    
    def calculate_all_stats(self) -> Dict:
        """
        Calculate all performance statistics.
        
        Returns:
            Dictionary with all stats (scores 0-100)
        """
        print("\n" + "="*70)
        print(f"CALCULATING STATS FOR PLAYER #{self.player_id}")
        print("="*70)
        
        # Calculate raw metrics
        distance_data = self._calculate_distance()
        speed_data = self._calculate_speed()
        agility_data = self._calculate_agility()
        
        # 0-100 scores
        stats = {
            'player_id': self.player_id,
            'calibration_method': self.calibration.calibration_result['method'],
            'calibration_confidence': self.calibration.calibration_result['confidence'],
            
            # Distance stats
            'distance': {
                'total_meters': distance_data['total_meters'],
                'total_kilometers': distance_data['total_kilometers'],
                'score': self._normalize_distance_score(distance_data['total_meters']),
                'percentile': None  # Would need multiple players to calculate
            },
            
            # Speed stats
            'speed': {
                'max_speed_mps': speed_data['max_speed'],
                'max_speed_kmh': speed_data['max_speed'] * 3.6,
                'avg_speed_mps': speed_data['avg_speed'],
                'avg_speed_kmh': speed_data['avg_speed'] * 3.6,
                'score': self._normalize_speed_score(speed_data['max_speed']),
                'sprint_count': speed_data['sprint_count']
            },
            
            # Agility stats
            'agility': agility_data,
            
            # Overall summary
            'overall_score': self._calculate_overall_score({
                'distance': self._normalize_distance_score(distance_data['total_meters']),
                'speed': self._normalize_speed_score(speed_data['max_speed']),
                'agility': agility_data['score']
            })
        }
        
        self._print_stats_summary(stats)
        
        return stats
    
    def _calculate_distance(self) -> Dict:
        """
        Calculate total distance covered by player.
        
        Returns:
            Distance data in meters and kilometers
        """
        total_distance_pixels = 0
        
        for i in range(1, len(self.trajectory)):
            prev_pos = self.trajectory[i-1]['position_pixels']
            curr_pos = self.trajectory[i]['position_pixels']
            
            # Euclidean distance
            dx = curr_pos[0] - prev_pos[0]
            dy = curr_pos[1] - prev_pos[1]
            distance_pixels = np.sqrt(dx**2 + dy**2)
            
            total_distance_pixels += distance_pixels
        
        # Convert to meters
        total_meters = self.calibration.pixels_to_meters(total_distance_pixels)
        
        return {
            'total_pixels': total_distance_pixels,
            'total_meters': total_meters,
            'total_kilometers': total_meters / 1000
        }
    
    def _calculate_speed(self) -> Dict:
        """
        Calculate speed metrics.
        
        Returns:
            Speed data including max, avg, and sprint count
        """
        speeds = []  # meters per second
        
        for i in range(1, len(self.trajectory)):
            prev = self.trajectory[i-1] # preveios 
            curr = self.trajectory[i] # current
            
            # Distance between frames
            dx = curr['position_pixels'][0] - prev['position_pixels'][0]
            dy = curr['position_pixels'][1] - prev['position_pixels'][1]
            distance_pixels = np.sqrt(dx**2 + dy**2)
            distance_meters = self.calibration.pixels_to_meters(distance_pixels)
            
            # Time between frames
            time_diff = (curr['frame_number'] - prev['frame_number']) / self.fps
            
            if time_diff > 0:
                speed_mps = distance_meters / time_diff
                speeds.append(speed_mps)
        
        if not speeds:
            return {
                'max_speed': 0,
                'avg_speed': 0,
                'sprint_count': 0
            }
        
        max_speed = max(speeds)
        
        # SANITY CHECK: Human max speed is ~12 m/s (43 km/h)
        if max_speed > 12.0:
            print(f"\n⚠️  WARNING: Detected impossible speed!")
            print(f"   Max speed: {max_speed * 3.6:.1f} km/h ({max_speed:.1f} m/s)")
            print(f"   Human limit: ~43 km/h (12 m/s)")
            print(f"   → Calibration may be incorrect")
            correction_factor = 12.0 / max_speed
            print(f"   → Suggested calibration correction: ×{correction_factor:.2f}")
            print(f"   → This would give max speed: {12.0 * 3.6:.1f} km/h")
        
        # Count sprints (speed > 6 m/s ≈ 21.6 km/h)
        sprint_threshold = 6.0
        sprint_count = sum(1 for s in speeds if s > sprint_threshold)
        
        return {
            'max_speed': max_speed,
            'avg_speed': np.mean(speeds),
            'sprint_count': sprint_count,
            'speeds': speeds  # Store for agility calculation
        }
    
    def _calculate_agility(self) -> Dict:
        """
        Calculate agility score based on Change of Direction (COD) metrics.
    
        Scientific approach:
        - COD Frequency: How often player changes direction
        - COD Sharpness: Average angle of direction changes
    
        This is more honest than arbitrary weighted formulas because:
        1. We can only measure movement (not decision-making)
        2. Avoids bias toward faster players
        3. Reports actual observable metrics
    
        References:
        - https://repositorio.umaia.pt/server/api/core/bitstreams/2cfcd131-a47d-4634-8ad8-7ed6ecbc0b37/content
        - https://pmc.ncbi.nlm.nih.gov/articles/PMC10024719/
    
        Returns:
           Agility data with COD metrics
        """
        if len(self.trajectory) < 3:
           return {
            'score': 0,
            'cod_frequency_per_min': 0,
            'cod_sharpness_degrees': 0,
            'total_direction_changes': 0,
            'sharp_turns_45deg': 0,
            'sharp_turns_90deg': 0
        }
           
        # A check to ignore players with very littel data
        duration_seconds = len(self.trajectory) / self.fps
    
        if duration_seconds < 5:
            return {
                'score': 0,
                'cod_frequency_per_min': 0,
                'cod_sharpness_degrees': 0,
                'total_direction_changes': 0,
                'frequency_score': 0,
                'sharpness_score': 0,
                'warning': 'Insufficient data (< 5 seconds)'
            }
    
        # Calculate direction at each frame
        directions = []
        for i in range(1, len(self.trajectory)):
            prev = self.trajectory[i-1]
            curr = self.trajectory[i]
        
            dx = curr['position_pixels'][0] - prev['position_pixels'][0]
            dy = curr['position_pixels'][1] - prev['position_pixels'][1]
        
            direction = np.arctan2(dy, dx)
            directions.append(direction)
    
        # Calculate direction changes (angles)
        direction_changes = []
        for i in range(1, len(directions)):
            change = abs(directions[i] - directions[i-1])
            # Normalize to 0-π (angles wrap around at 2π)
            if change > np.pi:
                change = 2*np.pi - change
            direction_changes.append(change)
    
        if not direction_changes:
            return {
                'score': 0,
                'cod_frequency_per_min': 0,
                'cod_sharpness_degrees': 0,
                'total_direction_changes': 0,
                'sharp_turns_45deg': 0,
                'sharp_turns_90deg': 0
            }
    
        # ===== DEFINE COD THRESHOLD =====
        cod_threshold = np.radians(90)
        total_cods = sum(1 for d in direction_changes if d > cod_threshold)
    
        # ===== METRIC 1: COD Frequency =====
        duration_seconds = len(self.trajectory) / self.fps
    
        # Normalize by time (CODs per minute)
        cod_frequency = total_cods / (duration_seconds / 60) if duration_seconds > 0 else 0
    
        # ===== METRIC 2: COD Sharpness =====
        significant_changes = [d for d in direction_changes if d > cod_threshold]
        avg_cod_angle = np.mean(significant_changes) if significant_changes else 0
        avg_cod_degrees = np.degrees(avg_cod_angle)
    
        # ===== SCORING: Use capped scaling =====
        # Instead of fixed benchmarks, use reasonable caps
    
        # For frequency: Cap at 200 CODs/min (anything above = 100)
        max_reasonable_frequency = 200
        frequency_score = min((cod_frequency / max_reasonable_frequency) * 100, 100)
    
        # For sharpness: Cap at 150 degrees average (very sharp)
        max_reasonable_sharpness = 150
        sharpness_score = min((avg_cod_degrees / max_reasonable_sharpness) * 100, 100)
    
        # Combined score
        agility_score = (frequency_score + sharpness_score) / 2
    
        return {
            'score': round(agility_score, 1),
        
            # Primary COD metrics (scientifically grounded)
            'cod_frequency_per_min': round(cod_frequency, 1),
            'cod_sharpness_degrees': round(avg_cod_degrees, 1),
        
            # Supporting metrics
            'total_direction_changes': total_cods,

        
            # Component scores (for UI display)
            'frequency_score': round(frequency_score, 1),
            'sharpness_score': round(sharpness_score, 1)
        }
    
    def _normalize_distance_score(self, meters: float) -> float:
        """
        Normalize distance to 0-100 score.
        
        Professional players cover 9-13 km per match.
        Scale proportionally for video length.
        """
        # Get video duration
        duration_seconds = len(self.trajectory) / self.fps
        duration_minutes = duration_seconds / 60
        
        # Expected distance per minute for high performance
        expected_per_minute = 150  # meters (9km / 60min)
        expected_total = expected_per_minute * duration_minutes
        
        # Score as percentage of expected
        score = (meters / expected_total) * 100
        
        return min(round(score, 1), 100)
    
    def _normalize_speed_score(self, max_speed_mps: float) -> float:
        """
        Normalize speed to 0-100 score.
        
        Professional player max speeds: 8-10 m/s (28-36 km/h)
        """
        # 10 m/s = 100 points
        score = (max_speed_mps / 10.0) * 100
        
        return min(round(score, 1), 100)
    
    def _calculate_overall_score(self, component_scores: Dict) -> float:
        """
        Calculate overall performance score.
        
        Weighted average of all components.
        """
        weights = {
            'distance': 0.3,
            'speed': 0.35,
            'agility': 0.35
        }
        
        overall = sum(
            component_scores[key] * weights[key]
            for key in weights.keys()
        )
        
        return round(overall, 1)
    
    def _print_stats_summary(self, stats: Dict):
        """
        Print formatted stats summary.
        """
        print("\n" + "="*70)
        print("PERFORMANCE STATISTICS")
        print("="*70)
        
        print(f"\n📊 OVERALL SCORE: {stats['overall_score']}/100")
        
        print(f"\n🏃 DISTANCE")
        print(f"  Total: {stats['distance']['total_kilometers']:.2f} km ({stats['distance']['total_meters']:.0f} m)")
        print(f"  Score: {stats['distance']['score']}/100")
        
        print(f"\n⚡ SPEED")
        print(f"  Max: {stats['speed']['max_speed_kmh']:.1f} km/h ({stats['speed']['max_speed_mps']:.1f} m/s)")
        print(f"  Avg: {stats['speed']['avg_speed_kmh']:.1f} km/h ({stats['speed']['avg_speed_mps']:.1f} m/s)")
        print(f"  Sprints: {stats['speed']['sprint_count']}")
        print(f"  Score: {stats['speed']['score']}/100")
        
        print(f"\n🔄 AGILITY")
        print(f"  Overall: {stats['agility']['score']}/100")
        print(f"  COD Frequency: {stats['agility']['cod_frequency_per_min']:.1f} changes/min (Score: {stats['agility']['frequency_score']}/100)")
        print(f"  COD Sharpness: {stats['agility']['cod_sharpness_degrees']:.1f}° average (Score: {stats['agility']['sharpness_score']}/100)")
        print(f"  Total Direction Changes: {stats['agility']['total_direction_changes']}")
        
        print(f"\n⚠️  Calibration: {stats['calibration_method']} ({stats['calibration_confidence']} confidence)")
        if stats['calibration_confidence'] == 'low':
            print("     Stats are estimated - for better accuracy, re-record with field lines visible")
        
        print("="*70)
    
    def save_stats(self, output_path: str):
        """
        Save stats to JSON file.
        """
        stats = self.calculate_all_stats()
        
        with open(output_path, 'w') as f:
            json.dump(stats, f, indent=2)
        
        print(f"\n✅ Stats saved to: {output_path}")
        
        return stats


if __name__ == "__main__":
    print("\nThis module should be imported, not run directly.")
    print("See test_stats_extraction.py for usage example.")
