"""
Recommendation Routes
Endpoints for personalized feed recommendations.
"""

from flask import Blueprint, request
from config import recommendation_engine

recommendations_bp = Blueprint('recommendations', __name__)


@recommendations_bp.route('/api/get-recommendations', methods=['POST'])
def get_recommendations():
    """
    Get personalized feed recommendations.
    
    Expected input (JSON):
    
    For Scout:
    {
        "user_type": "scout",
        "scout": {
            "id": "scout_001",
            "location": [33.5731, -7.6598]
        },
        "all_athletes": [...],
        "max_distance_km": 100,
        "limit": 20
    }
    
    For Athlete:
    {
        "user_type": "athlete",
        "athlete": {
            "id": "athlete_001",
            "location": [33.5731, -7.6598],
            "stats": {"speed": 85, "distance": 75, "agility": 80}
        },
        "all_athletes": [...],
        "max_distance_km": 100,
        "limit": 20
    }
    
    For Coach:
    {
        "user_type": "coach",
        "coach": {
            "id": "coach_001",
            "location": [33.5731, -7.6598]
        },
        "all_athletes": [...],
        "max_distance_km": 100,
        "limit": 20
    }
    
    Returns:
    {
        "status": "success",
        "recommendations": [...]
    }
    """
    data = request.json
    
    # Validate input
    if 'user_type' not in data:
        return {"error": "user_type is required"}, 400
    
    # Call recommendation engine
    try:
        recommendations = recommendation_engine.get_feed(**data)
        
        return {
            "status": "success",
            "recommendations": recommendations
        }
    except Exception as e:
        return {"error": str(e)}, 400
