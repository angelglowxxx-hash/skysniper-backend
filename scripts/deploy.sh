#!/bin/bash
# SkySniper Deploy Script — Render CLI or local

echo "🔧 Installing dependencies..."
npm install

echo "🧼 Cleaning old builds..."
rm -rf dist

echo "🚀 Starting SkySniper backend..."
npm start
