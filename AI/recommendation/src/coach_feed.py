"""
Coach Recommendations
Feed algorithm for coaches looking for athletes to train.
"""

from typing import List, Dict
from rec_utils import calculate_distance, calculate_overall_score


def get_coach_feed(coach: Dict,
                   all_athletes: List[Dict],
                   max_distance_km: float = 100,
                   limit: int = 20) -> List[Dict]:
    """
    Generate personalized feed for a COACH.
    
    What coaches want:
    - Athletes in their area
    - Rising talents (good but not perfect yet)
    - Athletes with room for improvement

    Args:
        coach: Coach's data
        all_athletes: All athletes
        max_distance_km: Search radius
        limit: How many to return
        
    Returns:
        List of recommended athletes
    """
    coach_location = coach['location']
    recommendations = []
    
    print(f"Finding athletes for coach within {max_distance_km}km...")
    
    for athlete in all_athletes:
        distance = calculate_distance(coach_location, athlete['location'])
        
        if distance <= max_distance_km:
            overall_score = calculate_overall_score(athlete)
            
            # Target: Athletes in the 50-75 range (rising talents)
            if 50 <= overall_score <= 75:
                # Calculate potential: How much room for improvement?
                # More room = higher potential
                potential_score = 75 - overall_score
                
                recommendations.append({
                    'athlete': athlete,
                    'distance_km': distance,
                    'overall_score': overall_score,
                    'potential_score': potential_score,
                    'relevance_reason': f"Rising talent, {distance}km away"
                })
    
    # Sort by potential (most room for improvement first)
    recommendations.sort(key=lambda x: x['potential_score'], reverse=True)
    
    recommendations = recommendations[:limit]
    
    print(f"✅ Found {len(recommendations)} athletes\n")
    
    return recommendations
