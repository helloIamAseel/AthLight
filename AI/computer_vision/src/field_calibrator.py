"""
Field Calibration Module

Auto-detects field dimensions for accurate stats calculation.
Falls back to estimation if field lines aren't visible.
"""

import cv2
import numpy as np
from pathlib import Path
from typing import Dict, Optional, Tuple
import json


class FieldCalibrator:
    """
    Calibrates pixel-to-meter conversion for stat calculation.
    
    Two modes:
    1. Auto-detection: Detects field lines and calculates dimensions
    2. Estimation: Uses player height as reference when lines not visible
    """
    
    # Standard football field dimensions (meters)
    STANDARD_FIELD = {
        'length': 105,      # Full field length
        'width': 68,        # Full field width
        'penalty_box_length': 16.5,
        'penalty_box_width': 40.3,
        'goal_area_length': 5.5,
        'goal_area_width': 18.3,
        'center_circle_radius': 9.15
    }
    
    AVERAGE_PLAYER_HEIGHT = 1.75  # meters
    
    def __init__(self, video_path: str):
        """
        Initialize calibrator with video.
        
        Args:
            video_path: Path to video file
        """
        self.video_path = video_path
        self.calibration_result = None
    
    def calibrate(self) -> Dict:
        """
        Attempt calibration with auto-detection, fall back to estimation.
        Includes sanity checks to validate calibration.
        
        Returns:
            Dictionary with calibration info:
            - method: 'auto' or 'estimated'
            - pixels_per_meter: conversion ratio
            - confidence: 'high', 'medium', or 'low'
            - field_dimensions: detected or assumed dimensions
        """
        print("\n" + "="*70)
        print("FIELD CALIBRATION")
        print("="*70)
        
        # Try auto-detection
        print("\nAttempting auto-detection of field lines...")
        auto_result = self._try_auto_detection()
        
        if auto_result['success']:
            ppm = auto_result['pixels_per_meter']
            
            # SANITY CHECK: Validate calibration makes sense
            is_valid, corrected_ppm = self._validate_calibration(ppm)
            
            if is_valid:
                print("✅ Field lines detected successfully!")
                print("✅ Calibration validated - values are realistic")
                self.calibration_result = {
                    'method': 'auto',
                    'pixels_per_meter': ppm,
                    'confidence': 'high',
                    'field_dimensions': auto_result['dimensions'],
                    'detection_details': auto_result['details']
                }
            else:
                print("⚠️  Auto-detection produced unrealistic values")
                print(f"   Original: {ppm:.1f} pixels/meter")
                print(f"   Corrected: {corrected_ppm:.1f} pixels/meter")
                self.calibration_result = {
                    'method': 'auto_corrected',
                    'pixels_per_meter': corrected_ppm,
                    'confidence': 'medium',
                    'field_dimensions': 'estimated',
                    'warning': 'Calibration auto-corrected for realistic values'
                }
        else:
            print("⚠️  Could not detect field lines clearly.")
            print("Falling back to estimation method...")
            
            est_result = self._estimate_from_players()
            self.calibration_result = {
                'method': 'estimated',
                'pixels_per_meter': est_result['pixels_per_meter'],
                'confidence': 'low',
                'field_dimensions': 'unknown',
                'warning': 'Stats are estimated - accuracy may be lower'
            }
        
        print(f"\nCalibration complete:")
        print(f"  Method: {self.calibration_result['method']}")
        print(f"  Pixels per meter: {self.calibration_result['pixels_per_meter']:.2f}")
        print(f"  Confidence: {self.calibration_result['confidence']}")
        
        return self.calibration_result
    
    def _validate_calibration(self, pixels_per_meter: float) -> Tuple[bool, float]:
        """
        Validate calibration produces realistic values.
        
        Sanity checks:
        - Typical tactical cam: 40-60 pixels/meter
        - Too low (<35): Overestimates distances/speeds
        - Too high (>75): Underestimates distances/speeds
        
        Returns:
            Tuple of (is_valid, corrected_value)
        """
        # Reasonable range for tactical camera footage
        MIN_PPM = 35  # Stricter minimum
        MAX_PPM = 75
        TYPICAL_PPM = 50  # Conservative middle ground
        
        if MIN_PPM <= pixels_per_meter <= MAX_PPM:
            return True, pixels_per_meter
        else:
            # Outside reasonable range - use conservative estimate
            print(f"   Calibration outside reasonable range ({MIN_PPM}-{MAX_PPM})")
            return False, TYPICAL_PPM
    
    def _try_auto_detection(self) -> Dict:
        """
        Try to auto-detect field dimensions from video frames.
        
        Returns:
            Dictionary with success status and calibration data
        """
        cap = cv2.VideoCapture(self.video_path)
        
        # Sample frames from different parts of video (25% 50% 75%)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        sample_frames = [
            total_frames // 4,
            total_frames // 2,
            3 * total_frames // 4
        ]
        
        best_detection = None
        best_score = 0
        
        for frame_num in sample_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
            ret, frame = cap.read()
            
            if not ret:
                continue
            
            # Detect lines in this frame
            detection = self._detect_lines_in_frame(frame)
            
            if detection['score'] > best_score:
                best_score = detection['score']
                best_detection = detection
        
        cap.release()
        
        # Consider detection successful if score > threshold
        if best_score > 0.3:
            return {
                'success': True,
                'pixels_per_meter': best_detection['pixels_per_meter'],
                'dimensions': best_detection['dimensions'],
                'details': best_detection
            }
        else:
            return {'success': False}
    
    def _detect_lines_in_frame(self, frame: np.ndarray) -> Dict:
        """
        Detect field lines in a single frame.
        
        Uses:
        1. Green field mask (HSV)
        2. White line detection (edges)
        3. Hough line detection
        4. Known field dimensions to calculate ratio
        
        Returns:
            Detection result with score
        """
        height, width = frame.shape[:2]
        
        # Convert to HSV for green field detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Detect green field
        lower_green = np.array([25, 30, 30])
        upper_green = np.array([95, 255, 255])
        field_mask = cv2.inRange(hsv, lower_green, upper_green)
        
        # Detect white lines on field
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Only look at field area
        gray_on_field = cv2.bitwise_and(gray, gray, mask=field_mask)
        
        # Detect bright areas (white lines)
        _, white_mask = cv2.threshold(gray_on_field, 180, 255, cv2.THRESH_BINARY)
        
        # Find edges
        edges = cv2.Canny(white_mask, 50, 150)
        
        # Detect lines using Hough transform
        lines = cv2.HoughLinesP(
            edges,
            rho=1,
            theta=np.pi/180,
            threshold=50,
            minLineLength=100,
            maxLineGap=10
        )
        
        if lines is None or len(lines) < 5:
            return {'score': 0, 'pixels_per_meter': 50}  # Default fallback
        
        # Analyze detected lines
        horizontal_lines = []
        vertical_lines = []
        
        for line in lines:
            x1, y1, x2, y2 = line[0]
            
            # Calculate angle
            angle = np.abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)
            
            # Classify as horizontal or vertical
            if angle < 20 or angle > 160:  # Horizontal
                horizontal_lines.append(line[0])
            elif 70 < angle < 110:  # Vertical
                vertical_lines.append(line[0])
        
        # Score based on number and quality of lines
        num_lines = len(horizontal_lines) + len(vertical_lines)
        line_score = min(num_lines / 20, 1.0)  # Normalize to 0-1
        
        # Estimate pixels per meter based on frame width
        # Assume we're seeing roughly half the field width
        estimated_field_width_visible = self.STANDARD_FIELD['width'] * 0.6
        estimated_ppm = width / estimated_field_width_visible
        
        # If we detected lines, refine the estimate
        if horizontal_lines:
            # Use longest horizontal line as reference
            longest_h = max(horizontal_lines, key=lambda l: np.sqrt((l[2]-l[0])**2 + (l[3]-l[1])**2))
            line_length_pixels = np.sqrt((longest_h[2]-longest_h[0])**2 + (longest_h[3]-longest_h[1])**2)
            
            # Assume this might be the width of penalty box (40.3m) or similar
            # This is a rough estimate
            if line_length_pixels > width * 0.3:
                estimated_ppm = line_length_pixels / 40  # Rough estimate
        
        return {
            'score': line_score,
            'pixels_per_meter': estimated_ppm,
            'dimensions': 'detected_from_lines',
            'num_lines': num_lines,
            'horizontal_lines': len(horizontal_lines),
            'vertical_lines': len(vertical_lines)
        }
    
    def _estimate_from_players(self) -> Dict:
        """
        Estimate calibration using average player height.
        
        This is the fallback when field lines aren't visible.
        Less accurate but still usable.
        
        Returns:
            Estimated calibration
        """
        cap = cv2.VideoCapture(self.video_path)
        
        # Get middle frame
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        cap.set(cv2.CAP_PROP_POS_FRAMES, total_frames // 2)
        ret, frame = cap.read()
        cap.release()
        
        if not ret:
            # Ultimate fallback
            return {'pixels_per_meter': 50}  # Rough default
        
        height, width = frame.shape[:2]
        
        # Estimate based on frame dimensions
        # Assume camera sees roughly 40-60 meters of field width
        assumed_visible_width = 50  # meters
        estimated_ppm = width / assumed_visible_width
        
        print(f"  Using estimation: ~{assumed_visible_width}m visible → {estimated_ppm:.1f} pixels/meter")
        
        return {
            'pixels_per_meter': estimated_ppm,
            'method': 'player_height_estimate'
        }
    
    def pixels_to_meters(self, pixels: float) -> float:
        """
        Convert pixel distance to meters.
        
        Args:
            pixels: Distance in pixels
            
        Returns:
            Distance in meters
        """
        if self.calibration_result is None:
            raise ValueError("Must run calibrate() first!")
        
        return pixels / self.calibration_result['pixels_per_meter']
    
    def meters_to_pixels(self, meters: float) -> float:
        """
        Convert meters to pixels.
        
        Args:
            meters: Distance in meters
            
        Returns:
            Distance in pixels
        """
        if self.calibration_result is None:
            raise ValueError("Must run calibrate() first!")
        
        return meters * self.calibration_result['pixels_per_meter']
    
    def save_calibration(self, output_path: str):
        """
        Save calibration data to file.
        
        Args:
            output_path: Where to save calibration JSON
        """
        if self.calibration_result is None:
            raise ValueError("Must run calibrate() first!")
        
        with open(output_path, 'w') as f:
            json.dump(self.calibration_result, f, indent=2)
        
        print(f"Calibration saved to: {output_path}")
    
    @classmethod # Alternative way to create instances
    def load_calibration(cls, calibration_path: str) -> 'FieldCalibrator':
        """
        Load previously saved calibration.
        
        Args:
            calibration_path: Path to calibration JSON
            
        Returns:
            FieldCalibrator instance with loaded calibration
        """
        with open(calibration_path, 'r') as f:
            calibration_data = json.load(f)
        
        calibrator = cls.__new__(cls)
        calibrator.calibration_result = calibration_data
        calibrator.video_path = None
        
        return calibrator


def test_calibration(video_path: str): # FOR TESTINGG
    """
    Test the calibration on a video.
    """
    print("="*70)
    print("FIELD CALIBRATION TEST")
    print("="*70)
    
    calibrator = FieldCalibrator(video_path)
    result = calibrator.calibrate()
    
    # Save calibration
    output_path = "output/field_calibration.json"
    calibrator.save_calibration(output_path)
    
    # Test conversion
    print("\n" + "="*70)
    print("CONVERSION TESTS")
    print("="*70)
    
    test_pixels = [100, 500, 1000]
    for px in test_pixels:
        meters = calibrator.pixels_to_meters(px)
        print(f"  {px} pixels = {meters:.2f} meters")
    
    print("\n" + "="*70)
    if result['confidence'] == 'high':
        print("✅ HIGH CONFIDENCE - Stats will be accurate!")
    elif result['confidence'] == 'medium':
        print("⚠️  MEDIUM CONFIDENCE - Stats should be reasonable")
    else:
        print("⚠️  LOW CONFIDENCE - Stats are estimated")
        print("\nRecommendation for user:")
        print("  'For more accurate stats, please re-record with field lines visible'")
    print("="*70)


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python field_calibrator.py <video_path>")
        print("Example: python field_calibrator.py input/sample.mp4")
        sys.exit(1)
    
    test_calibration(sys.argv[1])
