"""
Recommendation Engine - Main Interface
Single entry point for all recommendation types.

Usage:
    from recommendation_engine import RecommendationEngine
    
    engine = RecommendationEngine()
    feed = engine.get_feed(user_type='scout', user=scout_data, ...)
"""
try:
    # Try relative imports first (when used as package)
    from .scout_feed import get_scout_feed
    from .athlete_feed import get_athlete_feed
    from .coach_feed import get_coach_feed
    from .rec_utils import calculate_distance, calculate_stats_similarity, calculate_overall_score
except ImportError:
    # Fallback to absolute imports (when imported from API)
    from scout_feed import get_scout_feed
    from athlete_feed import get_athlete_feed
    from coach_feed import get_coach_feed
    from rec_utils import calculate_distance, calculate_stats_similarity, calculate_overall_score

class RecommendationEngine:
    """
    Main recommendation engine.
    
    Provides a simple interface for getting personalized feeds.
    """
    
    def __init__(self):
        """Initialize the engine."""
        print("Recommendation Engine ready! ✅\n")
    
    def get_feed(self, user_type: str, **kwargs):
        """
        Get personalized feed for any user type.
        
        Args:
            user_type: 'scout', 'athlete', or 'coach'
            **kwargs: Parameters specific to user type
            
        Returns:
            Personalized feed/recommendations
        """
        # **kwargs = pass arguments through without knowing/caring what they are
        if user_type == 'scout':
            return get_scout_feed(**kwargs)
        elif user_type == 'athlete':
            return get_athlete_feed(**kwargs)
        elif user_type == 'coach':
            return get_coach_feed(**kwargs)
        else:
            raise ValueError(f"Unknown user type: {user_type}")
    
    # Expose utility functions for direct use
    calculate_distance = staticmethod(calculate_distance)
    calculate_stats_similarity = staticmethod(calculate_stats_similarity)
    calculate_overall_score = staticmethod(calculate_overall_score)
