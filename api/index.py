"""
Vercel Serverless API Handler for Smallie

This file implements a proper serverless handler for Flask applications on Vercel.
"""

from http.server import BaseHTTPRequestHandler
import json
import os
import sys

# Add the parent directory to the path
root_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, root_path)

# We'll avoid importing from app.py directly
# This prevents issues with Flask initialization in a serverless context

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        """Handle GET requests by forwarding to Flask app"""
        self._handle_request()

    def do_POST(self):
        """Handle POST requests by forwarding to Flask app"""
        self._handle_request()

    def _handle_request(self):
        """Shared request handling logic"""
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        
        # Return a simple success message
        # In a real deployment, you'll need to set up proper serverless-to-Flask routing
        response = {
            "status": "ok",
            "message": "Serverless function running correctly",
            "path": self.path,
            "project_id": os.environ.get("FIREBASE_PROJECT_ID", "Not set")
        }
        
        self.wfile.write(json.dumps(response).encode())

# This is the function Vercel calls
def handler(event, context):
    """Serverless function handler for Vercel"""
    # Log the event for debugging
    print(f"Received event: {event}")
    
    return {
        "statusCode": 200,
        "headers": {
            "Content-Type": "text/html",
        },
        "body": """
<!DOCTYPE html>
<html>
<head>
    <title>Smallie - Nigerian Livestreaming Competition</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            text-align: center;
        }
        h1 {
            color: #D32F2F;
            margin-top: 40px;
        }
        .message {
            background-color: #f8f9fa;
            border-radius: 5px;
            padding: 20px;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .smallie-logo {
            font-size: 2.5rem;
            font-weight: bold;
            color: #D32F2F;
            margin-bottom: 10px;
        }
        .tagline {
            font-style: italic;
            color: #666;
            margin-bottom: 30px;
        }
        .success {
            color: #28a745;
            font-weight: bold;
        }
        .instructions {
            text-align: left;
            max-width: 600px;
            margin: 0 auto;
        }
        code {
            background-color: #f1f1f1;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: Monaco, monospace;
        }
    </style>
</head>
<body>
    <div class="smallie-logo">Smallie</div>
    <div class="tagline">Nigeria's Premier Livestreaming Competition</div>
    
    <h1>Serverless Function Running!</h1>
    
    <div class="message">
        <p class="success">✓ Your Vercel deployment is working correctly at the API level</p>
        <p>The serverless function has been deployed successfully.</p>
    </div>
    
    <div class="instructions">
        <h2>Next Steps:</h2>
        <ol>
            <li>Verify that all environment variables are set in Vercel's project settings</li>
            <li>Configure Firebase authorized domains to include your Vercel URL</li>
            <li>If using a custom domain, make sure to add it to Firebase as well</li>
        </ol>
        
        <h2>Troubleshooting:</h2>
        <p>If you're seeing this page but not the full application, check:</p>
        <ul>
            <li>Your vercel.json configuration (proper rewrites setup)</li>
            <li>Firebase credentials (properly base64-encoded)</li>
            <li>Vercel build logs for specific error messages</li>
        </ul>
    </div>
</body>
</html>
        """
    }