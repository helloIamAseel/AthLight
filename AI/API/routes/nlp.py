"""
NLP Routes
Endpoints for feedback sentiment analysis.
"""

from flask import Blueprint, request
from config import nlp_analyzer

nlp_bp = Blueprint('nlp', __name__)


@nlp_bp.route('/api/analyze-feedback', methods=['POST'])
def analyze_feedback():
    """
    Analyze coach feedback sentiment.
    
    Expected input (JSON):
    {
        "feedbacks": [
            "Great player with excellent skills!",
            "أداء ممتاز",
            "Needs to work on speed"
        ],
        "player_name": "Ahmed"  // Optional
    }
    
    Returns:
    {
        "status": "success",
        "analysis": {
            "overall_sentiment": {"score": 0.75, "label": "positive"},
            "total_feedbacks": 3,
            "sentiment_breakdown": {...}
        }
    }
    """
    data = request.json
    feedbacks = data.get('feedbacks', [])
    player_name = data.get('player_name', 'You')
    
    # Validate input
    if not feedbacks:
        return {"error": "No feedbacks provided"}, 400
    
    # Call NLP module
    result = nlp_analyzer.analyze_feedbacks(feedbacks)
    
    # Generate summary if player name provided
    if player_name:
        summary = nlp_analyzer.generate_summary_text(result, player_name)
        result['summary'] = summary
    
    return {
        "status": "success",
        "analysis": result
    }
