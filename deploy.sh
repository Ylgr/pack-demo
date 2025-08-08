#!/bin/bash

echo "🚀 Starting deployment to GitHub Pages..."

# Build the application
echo "📦 Building the application..."
npm run build

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npx gh-pages -d out

echo "✅ Deployment completed!"
echo "🌍 Your app should be available at: https://ylgr.github.io/pack-demo/"
