"""
Recommendation System Package
"""

from .recommendation_engine import RecommendationEngine
from .rec_utils import calculate_distance, calculate_stats_similarity, calculate_overall_score
from .scout_feed import get_scout_feed
from .athlete_feed import get_athlete_feed
from .coach_feed import get_coach_feed

# A list of what's "public" (what users should import)
__all__ = [
    'RecommendationEngine',
    'calculate_distance',
    'calculate_stats_similarity',
    'calculate_overall_score',
    'get_scout_feed',
    'get_athlete_feed',
    'get_coach_feed',
]
