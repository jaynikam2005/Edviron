@echo off
REM Edviron Vercel Deployment Script for Windows
REM Make sure you have Vercel CLI installed: npm i -g vercel

echo 🚀 Starting Edviron deployment to Vercel...

REM Check if vercel CLI is installed
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Vercel CLI is not installed. Installing...
    npm install -g vercel
)

REM Check if we're in the right directory
if not exist "vercel.json" (
    echo ❌ vercel.json not found. Make sure you're in the project root directory.
    exit /b 1
)

REM Build the project locally first (optional check)
echo 🔨 Building project locally for validation...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Backend build failed. Please fix the errors before deploying.
    exit /b 1
)

cd edviron-frontend
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Frontend build failed. Please fix the errors before deploying.
    cd ..
    exit /b 1
)

cd ..

REM Deploy to Vercel
echo 🚀 Deploying to Vercel...
vercel --prod

echo ✅ Deployment completed!
echo 📱 Your app should be live at the URL provided by Vercel
echo 🔧 Don't forget to set your environment variables in the Vercel dashboard