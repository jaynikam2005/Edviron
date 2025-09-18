#!/bin/bash

# Edviron Vercel Deployment Script
# Make sure you have Vercel CLI installed: npm i -g vercel

echo "🚀 Starting Edviron deployment to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    echo "❌ vercel.json not found. Make sure you're in the project root directory."
    exit 1
fi

# Build the project locally first (optional check)
echo "🔨 Building project locally for validation..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed. Please fix the errors before deploying."
    exit 1
fi

cd edviron-frontend
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed. Please fix the errors before deploying."
    exit 1
fi

cd ..

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "📱 Your app should be live at the URL provided by Vercel"
echo "🔧 Don't forget to set your environment variables in the Vercel dashboard"