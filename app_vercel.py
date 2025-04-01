"""
Modified version of app.py for Vercel deployment
This file contains optimizations specific to serverless environments
"""

# Import standard modules
import os
import json
import logging
import datetime
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="VERCEL: %(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

# Try to import Firebase and other dependencies
try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    from flask import Flask, render_template, redirect, url_for
except ImportError as e:
    logging.error(f"Failed to import required modules: {e}")
    sys.exit(1)

# Create Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "smallie-vercel-secret-key")

# Initialize Firebase
db = None
try:
    # Get Firebase credentials from environment variable
    firebase_creds_json = os.environ.get("FIREBASE_CREDENTIALS")
    
    if firebase_creds_json:
        try:
            # For Vercel, credentials are stored as base64-encoded JSON
            import base64
            try:
                decoded_creds = base64.b64decode(firebase_creds_json).decode("utf-8")
                cred_dict = json.loads(decoded_creds)
                logging.info("Successfully decoded base64 Firebase credentials")
            except Exception as base64_err:
                logging.error(f"Failed to decode base64 credentials: {base64_err}")
                try:
                    # Fallback: try parsing as direct JSON
                    cred_dict = json.loads(firebase_creds_json)
                    logging.info("Successfully parsed Firebase credentials as JSON string")
                except Exception as json_err:
                    logging.error(f"Failed to parse JSON credentials: {json_err}")
                    cred_dict = None
            
            if cred_dict:
                # Initialize Firebase with the credentials
                if not firebase_admin._apps:
                    cred = credentials.Certificate(cred_dict)
                    firebase_admin.initialize_app(cred)
                db = firestore.client()
                logging.info("Firebase initialized successfully")
            else:
                logging.error("Could not parse Firebase credentials")
        except Exception as e:
            logging.error(f"Error initializing Firebase: {e}")
    else:
        logging.error("FIREBASE_CREDENTIALS not found in environment variables")
except Exception as e:
    logging.error(f"Unexpected error initializing Firebase: {e}")

# Log Firebase environment variables (without revealing sensitive data)
logging.info(f"Firebase Project ID: {os.environ.get('FIREBASE_PROJECT_ID', 'Not Set')}")
logging.info(f"Firebase App ID available: {'Yes' if os.environ.get('FIREBASE_APP_ID') else 'No'}")
logging.info(f"Firebase API Key available: {'Yes' if os.environ.get('FIREBASE_API_KEY') else 'No'}")

# Import the routes and other components from the main app
from app import get_current_task, get_hardcoded_task, index, admin

# Add a simple health check endpoint for Vercel
@app.route("/api/health")
def health_check():
    """Simple health check for Vercel"""
    return {"status": "healthy", "timestamp": datetime.datetime.now().isoformat()}