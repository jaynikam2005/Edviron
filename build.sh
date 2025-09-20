#!/bin/bash

# Render Build Script for Edviron Backend
echo "Starting Render build process..."

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Build backend
echo "Building NestJS backend..."
npm run build

# Install frontend dependencies and build
echo "Installing frontend dependencies..."
cd edviron-frontend
npm install

echo "Building React frontend..."
npm run build:prod

cd ..

echo "Build process completed successfully!"
echo "Backend built to: dist/"
echo "Frontend built to: edviron-frontend/dist/"