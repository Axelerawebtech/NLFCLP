@echo off
echo Starting NLFCP Development Server...
cd /d "C:\Users\Admin\Documents\Axelera Projects\NLFCP-updated\NLFCLP"
echo Current directory: %cd%

echo Checking if Node.js is available...
node --version
npm --version

echo Installing dependencies...
npm install

echo Starting Next.js development server...
npm run dev

pause