"""
Routes Package
Registers all API routes.
"""

from .health import health_bp
from .nlp import nlp_bp
from .recommendations import recommendations_bp
from .computer_vision import cv_bp


def register_routes(app):
    """Register all routes with the Flask app"""
    app.register_blueprint(health_bp)
    app.register_blueprint(nlp_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(cv_bp)
