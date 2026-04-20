"""
Health Check Route
Simple endpoint to verify API is running.
"""

from flask import Blueprint

health_bp = Blueprint('health', __name__)


@health_bp.route('/', methods=['GET'])
def health_check():
    """
    Check if API is running.
    
    Test in browser: http://localhost:5000/
    """
    return {
        "status": "online",
        "message": "Athlight AI API is alive",
        "version": "1.0.0"
    }
