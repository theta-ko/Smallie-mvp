"""
Vercel Serverless API Handler for Smallie
"""

from flask import Flask
import sys
import os

# Add the parent directory to the path so we can import from app.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import the Flask app from app.py
from app import app

# Export the Flask app as 'app'
# Vercel will automatically detect this variable and use it as the handler