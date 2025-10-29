# PowerShell script to start NLFCP development server
Write-Host "🚀 Starting NLFCP Development Server..." -ForegroundColor Green

# Navigate to project directory
Set-Location "C:\Users\Admin\Documents\Axelera Projects\NLFCP-updated\NLFCLP"
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check Node.js installation
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    $npmVersion = npm --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Kill any existing Node processes
Write-Host "🔄 Stopping any existing servers..." -ForegroundColor Yellow
try {
    taskkill /F /IM node.exe 2>$null
} catch {
    # Ignore errors if no processes found
}

# Start development server
Write-Host "🌟 Starting Next.js development server..." -ForegroundColor Green
npm run dev