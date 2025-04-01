# Deployment Instructions for Smallie

## 1. Pushing to GitHub

Since pushing directly from Replit might be timing out, follow these steps:

1. From the Replit interface, download the project as a ZIP file
2. Extract the ZIP file on your local machine
3. Initialize a Git repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   ```
4. Connect to your GitHub repository:
   ```
   git remote add origin https://github.com/theta-ko/Smallie-mvp.git
   git push -u origin main
   ```

If prompted for credentials, enter your GitHub username and personal access token.

## 2. Deploying to Vercel

### Option A: Deploy from GitHub

1. Sign up or log in to Vercel (https://vercel.com)
2. Click "Add New" → "Project"
3. Select the "Smallie-mvp" repository from the list
4. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: Leave blank (using vercel.json)
   - Output Directory: Leave blank

5. Set up the following Environment Variables:
   - `FIREBASE_API_KEY`: Your Firebase API key
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - `FIREBASE_APP_ID`: Your Firebase app ID
   - `FIREBASE_CREDENTIALS`: Base64-encoded Firebase service account JSON
   - `FLUTTERWAVE_PUBLIC_KEY`: Your Flutterwave public key
   - `FLUTTERWAVE_SECRET_KEY`: Your Flutterwave secret key
   - `SOLANA_PROJECT_ID`: Your Solana project ID

6. Click "Deploy"

### Option B: Deploy from CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```
   vercel login
   ```

3. Deploy the project:
   ```
   vercel
   ```

4. Follow the prompts and set up the environment variables as listed above.

## 3. Post-Deployment Setup

1. In the Firebase Console, go to Authentication → Settings → Authorized domains
2. Add your Vercel deployment URL (e.g., `smallie-mvp.vercel.app`) to the list of authorized domains
3. Test the application by visiting your Vercel deployment URL

## 4. Setting up a Custom Domain (Optional)

1. In the Vercel dashboard, go to your project settings
2. Click on "Domains"
3. Add your custom domain (e.g., smallie.com)
4. Follow Vercel's instructions to configure your DNS settings
5. Remember to add the custom domain to Firebase authorized domains list

## 5. Troubleshooting Serverless Function Issues

### Completely Revised Vercel Configuration

We've implemented a fully serverless approach designed specifically for Vercel:

1. The project now uses a dedicated serverless handler in the `/api` directory
2. Each function in `/api` directory is an independent serverless endpoint
3. The `vercel.json` file configures routing and resource allocation
4. Static files are served directly from the `/static` directory

#### Important Deployment Steps

1. **Project Settings in Vercel Dashboard**
   - When importing the project, select:
     - Framework Preset: "Other" (not Flask or Python)
     - Root Directory: `.` (the repository root)
     - Build Command: (leave empty)
     - Output Directory: (leave empty)

2. **Environment Variables**
   - All environment variables must be configured in Vercel's project settings
   - Firebase credentials must be base64-encoded using the provided script

### Common Deployment Issues

1. **Serverless Function Failed**
   - Make sure the `/api/index.py` file correctly imports your Flask app
   - Ensure your Firebase credentials are correctly formatted (base64-encoded JSON)
   - Check the Vercel deployment logs for specific errors

2. **Missing Environment Variables**
   - Double-check that all required environment variables are set in the Vercel project settings
   - For Firebase credentials, ensure you've used the prepare_credentials.py script to convert your service account JSON to base64

3. **Firebase Authentication Issues**
   - Verify that your deployed URL has been added to the authorized domains list in Firebase Console

4. **Static Assets Not Loading**
   - Check that all asset paths in your HTML are relative to the root (starting with '/')
   - Vercel will automatically serve static files from the `/static` directory

### Redeploying After Changes

After making any changes to fix issues:

1. Commit your changes to your GitHub repository 
2. Vercel will automatically redeploy if you've set up continuous deployment
3. Alternatively, trigger a manual deployment from the Vercel dashboard