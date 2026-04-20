"""
AI Module Configuration
Loads and initializes all AI modules once at startup.
"""
 
import sys
from pathlib import Path
 
# Add the specific module paths directly
AI_DIR = Path(__file__).resolve().parent.parent
 
sys.path.insert(0, str(AI_DIR / 'NLP' / 'src'))
sys.path.insert(0, str(AI_DIR / 'recommendation' / 'src'))
sys.path.insert(0, str(AI_DIR / 'computer_vision' / 'src'))
 
# Import NLP module
from feedback_analyzer import FeedbackAnalyzer
 
# Import recommendation components
import scout_feed
import athlete_feed  
import coach_feed
import rec_utils
 
# Import Computer Vision modules
try:
    from player_tracker import PlayerTracker
    from player_identifier import PlayerIdentifier
    from stats_extractor import StatsExtractor
    from field_calibrator import FieldCalibrator
    print("✅ Computer Vision modules imported successfully")
except ImportError as e:
    print(f"⚠️  Warning: Could not import CV modules: {e}")
    print(f"   CV endpoints will not work until this is fixed")
    PlayerTracker = None
    PlayerIdentifier = None
    StatsExtractor = None
    FieldCalibrator = None
 
class RecommendationEngine:
    """Wrapper for recommendation system because normal import did not work"""
    
    def __init__(self):
        print("Recommendation Engine ready! ✅")
    
    def get_feed(self, user_type: str, **kwargs):
        """Get personalized feed based on user type"""
        if user_type == 'scout':
            return scout_feed.get_scout_feed(**kwargs)
        elif user_type == 'athlete':
            return athlete_feed.get_athlete_feed(**kwargs)
        elif user_type == 'coach':
            return coach_feed.get_coach_feed(**kwargs)
        else:
            raise ValueError(f"Unknown user type: {user_type}")
 
 
# Initialize AI modules (load models once at startup)
print("\n" + "="*70)
print("Loading AI models...")
print("="*70)
nlp_analyzer = FeedbackAnalyzer()
recommendation_engine = RecommendationEngine()
print("="*70)
print("✅ All AI models loaded!")
print("="*70 + "\n")
 
# CV modules are available for import (no initialization needed)
# Import them in routes like: from config import PlayerTracker, StatsExtractor, etc.