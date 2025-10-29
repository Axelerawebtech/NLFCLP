# Manual Commands to Run in PowerShell Terminal

# 1. Navigate to project directory
cd "C:\Users\Admin\Documents\Axelera Projects\NLFCP-updated\NLFCLP"

# 2. Check if you're in the right directory
Get-ChildItem | Select-Object Name | Where-Object { $_.Name -match "package.json|components|pages" }

# 3. Kill any existing Node processes
taskkill /F /IM node.exe

# 4. Install dependencies (if needed)
npm install

# 5. Start the development server
npm run dev

# Expected output:
# > cancer-care-app@0.1.0 dev
# > next dev
# 
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
# event - compiled client and server successfully