"""
Core Recommendation Utilities
Basic functions used by all recommendation types.
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from geopy.distance import geodesic
from typing import Tuple, Dict


def calculate_distance(location1: Tuple[float, float], 
                      location2: Tuple[float, float]) -> float:
    """
    Calculate distance between two locations in kilometers.
    
    Args:
        location1: (latitude, longitude) of first place
        location2: (latitude, longitude) of second place
        
    Returns:
        Distance in kilometers
    """
    distance = geodesic(location1, location2).kilometers
    return round(distance, 2)


def calculate_stats_similarity(stats1: Dict, stats2: Dict) -> float:
    """
    Calculate how similar two athletes' stats are (0-1 scale).
    
    Uses cosine similarity - measures angle between stat vectors.
    
    Args:
        stats1: First athlete's stats
        stats2: Second athlete's stats
        
    Returns:
        Similarity score (0-1)
    """
    # Extract stats as numbers
    vec1 = [
        stats1.get('speed', 0),
        stats1.get('distance', 0),
        stats1.get('agility', 0)
    ]
    
    vec2 = [
        stats2.get('speed', 0),
        stats2.get('distance', 0),
        stats2.get('agility', 0)
    ]
    
    # Convert to numpy arrays for formula
    vec1 = np.array(vec1).reshape(1, -1)
    vec2 = np.array(vec2).reshape(1, -1)
    
    # Calculate similarity
    similarity = cosine_similarity(vec1, vec2)[0][0]
    
    return round(similarity, 3)


def calculate_overall_score(athlete: Dict) -> float:
    """
    Calculate athlete's overall quality score.
    
    Simple average of all three stats.
    
    Args:
        athlete: Athlete data with stats
        
    Returns:
        Overall score (0-100)
    """
    stats = athlete.get('stats', {})
    
    speed = stats.get('speed', 0)
    distance = stats.get('distance', 0)
    agility = stats.get('agility', 0)
    
    overall = (speed + distance + agility) / 3
    
    return round(overall, 1)
