"""
Scout Recommendations
Feed algorithm for scouts looking for talent.
"""

from typing import List, Dict
from rec_utils import calculate_distance, calculate_overall_score


def get_scout_feed(scout: Dict, 
                   all_athletes: List[Dict],
                   max_distance_km: float = 100,
                   limit: int = 20) -> List[Dict]:
    """
    Generate personalized feed for a SCOUT.
    
    What scouts want:
    - Top athletes in their area
    - Sorted by performance (best first)
    
    Args:
        scout: Scout's data (must have 'location')
        all_athletes: List of all athletes
        max_distance_km: Maximum search radius (default: 100km)
        limit: How many to return (default: 20)
        
    Returns:
        List of recommended athletes (sorted best to worst)
    """
    scout_location = scout['location']
    recommendations = []
    
    print(f"Finding athletes within {max_distance_km}km of scout...")
    
    # Filter by location and calculate scores
    for athlete in all_athletes:
        athlete_location = athlete['location']
        distance = calculate_distance(scout_location, athlete_location)
        
        # Only include if within range
        if distance <= max_distance_km:
            overall_score = calculate_overall_score(athlete)
            
            recommendations.append({
                'athlete': athlete,
                'distance_km': distance,
                'overall_score': overall_score,
                'relevance_reason': f"Top athlete {distance}km away"
            })
    
    # Sort by overall score (highest first)
    recommendations.sort(key=lambda x: x['overall_score'], reverse=True)
    
    # Return top N
    recommendations = recommendations[:limit]
    
    print(f"✅ Found {len(recommendations)} athletes\n")
    
    return recommendations
