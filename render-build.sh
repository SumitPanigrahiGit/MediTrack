#!/bin/bash

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Move build to root directory for serving
echo "Moving build to root..."
cp -r build ../build

cd ..

echo "Build complete! Frontend will be served from /build"
