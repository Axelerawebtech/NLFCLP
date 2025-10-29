#!/bin/bash

echo "🚀 Starting NLFCP Development Server..."
cd "C:/Users/Admin/Documents/Axelera Projects/NLFCP-updated/NLFCLP"
echo "📁 Current directory: $(pwd)"

echo "🔍 Checking Node.js installation..."
node --version
npm --version

echo "📦 Installing dependencies..."
npm install

echo "🔧 Starting Next.js development server..."
npm run dev