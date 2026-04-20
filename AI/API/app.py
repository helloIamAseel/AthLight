"""
Athlight AI API
Flask API that wraps AI modules:
- Computer Vision (tracking, identification, stats)
- NLP (feedback analysis)
- Recommendations (feed algorithm)
"""

from flask import Flask, jsonify
from routes import register_routes

app = Flask(__name__)

# Register all routes
register_routes(app)


# ERROR HANDLERS
@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return {"error": "Endpoint not found"}, 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return {"error": "Internal server error"}, 500


# RUN SERVER
if __name__ == '__main__':
    print("\n" + "="*70)
    print("Starting Athlight AI API...")
    print("="*70)
    print("Endpoints available:")
    print("  GET  /                          - Health check")
    print("  POST /api/track-video           - Track players in video")
    print("  POST /api/identify-player       - Identify user from clicks")
    print("  POST /api/calculate-stats       - Calculate player stats")
    print("  POST /api/analyze-feedback      - Analyze coach feedback")
    print("  POST /api/get-recommendations   - Get personalized feed")
    print("="*70)
    print("Server running on: http://localhost:5000")
    print("Press CTRL+C to stop")
    print("="*70 + "\n")
    
    app.run(debug=True, port=5000)
