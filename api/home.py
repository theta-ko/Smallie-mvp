"""
Home page handler for the Smallie application on Vercel

This function acts as a bridge between Vercel's serverless functions
and our Flask application's home page.
"""

import os
import sys
import json

# Add the parent directory to the path
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root_path)

# For serverless functions, we'll avoid importing from app.py directly
# This eliminates potential issues with Flask initialization in a serverless context

def handler(event, context):
    """
    Serverless handler for the home page
    
    This simulates what happens in the app.py index() function,
    but adapted for a serverless context.
    """
    # Log environment variables (without sensitive data)
    print(f"Firebase Project ID: {os.environ.get('FIREBASE_PROJECT_ID', 'Not Set')}")
    print(f"Firebase App ID available: {'Yes' if os.environ.get('FIREBASE_APP_ID') else 'No'}")
    print(f"Firebase API Key available: {'Yes' if os.environ.get('FIREBASE_API_KEY') else 'No'}")
    
    try:
        # Try to render the home page
        # For this demo, provide a static HTML response to test deployment
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "text/html",
            },
            "body": """
<!DOCTYPE html>
<html>
<head>
    <title>Smallie - Nigeria's Premier Livestreaming Competition</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Playfair Display', 'Lato', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            color: #000000;
            margin: 0;
            padding: 0;
            background-color: #FFFFFF;
        }
        header {
            background-color: #D32F2F;
            color: #FFFFFF;
            padding: 20px;
            text-align: center;
        }
        h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2.5rem;
            margin: 0;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        .message {
            background-color: #f8f9fa;
            border-left: 4px solid #D32F2F;
            padding: 15px;
            margin: 20px 0;
        }
        .success {
            color: #28a745;
            font-weight: bold;
        }
        .section {
            margin: 40px 0;
        }
    </style>
</head>
<body>
    <header>
        <h1>Smallie</h1>
        <p>Nigeria's Premier Livestreaming Competition</p>
    </header>
    
    <div class="container">
        <div class="message">
            <p class="success">✓ Your Vercel deployment is working correctly</p>
            <p>This is a simplified version of the Smallie application homepage to verify deployment.</p>
        </div>
        
        <div class="section">
            <h2>Daily Challenge</h2>
            <p>Each day from April 15-21, 2025, contestants complete a new Nigerian-themed challenge.</p>
            <p>Today's challenge: <strong>Nollywood Skit Showdown</strong></p>
            <p>2-minute Nollywood skit (e.g., Cheating Husband)</p>
        </div>
        
        <div class="section">
            <h2>Contestants</h2>
            <p>10 talented Nigerian content creators competing for the grand prize</p>
        </div>
        
        <div class="section">
            <h2>How It Works</h2>
            <ul>
                <li>Daily tasks released at 9 AM WAT</li>
                <li>Voting closes at 9 PM WAT each day</li>
                <li>The contestant with the lowest votes is eliminated daily</li>
                <li>Votes cost $0.50 each</li>
                <li>9% of vote revenue goes to contestants, 1% to platform, 90% to final prize pool</li>
            </ul>
        </div>
    </div>
</body>
</html>
            """
        }
    except Exception as e:
        # Log and return error info
        error_message = str(e)
        print(f"Error in home handler: {error_message}")
        
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
            },
            "body": json.dumps({"error": error_message})
        }