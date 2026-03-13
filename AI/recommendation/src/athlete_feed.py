"""
Athlete Recommendations
Feed algorithm for athletes discovering others and networking.
"""

from typing import List, Dict
from rec_utils import calculate_distance, calculate_stats_similarity, calculate_overall_score


def get_athlete_feed(athlete: Dict,
                     all_athletes: List[Dict],
                     max_distance_km: float = 100,
                     limit: int = 20) -> Dict:
    """
    Generate personalized feed for an ATHLETE.
    
    What athletes want:
    - Athletes like them (same level, relatable, potential friends)
    - Athletes better nearby (local inspiration, reachable goals)
    - Platform legends (best overall, role models)
    
    Feed composition:
    - 35% similar athletes (like them)
    - 35% better athletes nearby (local inspiration)
    - 30% global best (platform legends)
    
    Args:
        athlete: The athlete requesting feed
        all_athletes: All other athletes
        max_distance_km: Search radius for nearby recommendations
        limit: Total items to return
        
    Returns:
        Dictionary with categorized recommendations
    """
    athlete_location = athlete['location']
    athlete_stats = athlete['stats']
    athlete_overall = calculate_overall_score(athlete)
    
    print("Building personalized feed for athlete...")
    
    # ===== CATEGORY 1: Similar Athletes (Like Them) =====
    similar_athletes = []
    for other in all_athletes:
        # Don't recommend yourself!
        if other['id'] == athlete['id']:
            continue
        
        similarity = calculate_stats_similarity(athlete_stats, other['stats'])
        distance = calculate_distance(athlete_location, other['location'])
        other_overall = calculate_overall_score(other)
        
        # Include if:
        # - Nearby (within radius)
        # - Similar stats (70%+ similarity)
        # - Similar skill level (within ±10 points overall)
        if (distance <= max_distance_km and 
            similarity > 0.7 and
            abs(other_overall - athlete_overall) <= 10):
            
            similar_athletes.append({
                'athlete': other,
                'distance_km': distance,
                'similarity_score': similarity,
                'overall_score': other_overall,
                'relevance_reason': f"Similar level ({similarity:.0%} match), {distance}km away"
            })
    
    # Sort by similarity (most similar first)
    similar_athletes.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    # ===== CATEGORY 2: Better Athletes Nearby (Local Inspiration) =====
    better_nearby = []
    for other in all_athletes:
        if other['id'] == athlete['id']:
            continue
        
        distance = calculate_distance(athlete_location, other['location'])
        other_overall = calculate_overall_score(other)
        
        # Include if:
        # - Nearby (within radius)
        # - Better than current athlete (+10 points minimum)
        if distance <= max_distance_km and other_overall > athlete_overall + 10:
            better_nearby.append({
                'athlete': other,
                'distance_km': distance,
                'overall_score': other_overall,
                'score_gap': other_overall - athlete_overall,
                'relevance_reason': f"Higher level (+{other_overall - athlete_overall:.0f} points), {distance}km away"
            })
    
    # Sort by score (best first)
    better_nearby.sort(key=lambda x: x['overall_score'], reverse=True)
    
    # ===== CATEGORY 3: Global Best (Platform Legends) =====
    global_best = []
    for other in all_athletes:
        if other['id'] == athlete['id']:
            continue
        
        distance = calculate_distance(athlete_location, other['location'])
        other_overall = calculate_overall_score(other)
        
        # Include top performers (75+ score)
        if other_overall >= 75:
            global_best.append({
                'athlete': other,
                'distance_km': distance,
                'overall_score': other_overall,
                'relevance_reason': f"Top athlete on platform (score: {other_overall:.0f})"
            })
    
    # Sort by score (absolute best first)
    global_best.sort(key=lambda x: x['overall_score'], reverse=True)
    
    print(f"✅ Found:")
    print(f"   - {len(similar_athletes)} similar athletes")
    print(f"   - {len(better_nearby)} better athletes nearby")
    print(f"   - {len(global_best)} global top athletes\n")
    
    # ===== MIX CATEGORIES (35/35/30 split) =====
    similar_count = int(limit * 0.35)
    better_count = int(limit * 0.35)
    global_count = int(limit * 0.30)
    
    feed = []
    feed.extend(similar_athletes[:similar_count])
    feed.extend(better_nearby[:better_count])
    feed.extend(global_best[:global_count])
    
    return {
        'total_items': len(feed),
        'similar_athletes': similar_athletes[:similar_count],
        'better_nearby': better_nearby[:better_count],
        'global_best': global_best[:global_count],
        'mixed_feed': feed[:limit]
    }