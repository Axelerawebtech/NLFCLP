# Git Bash Terminal Fix Guide

## Issue: Exit Code 256
The error "terminal process terminated with exit code: 256" typically occurs due to:
- Git Bash configuration issues
- Path conflicts
- Windows permission problems

## Quick Fixes:

### Fix 1: Reset VS Code Terminal Settings
1. Open VS Code Settings (Ctrl + ,)
2. Search for "terminal.integrated.shell.windows"
3. Change to PowerShell: `"terminal.integrated.shell.windows": "powershell.exe"`

### Fix 2: Use Command Prompt
1. In VS Code, press Ctrl + Shift + `
2. Click the dropdown next to the + icon
3. Select "Command Prompt"
4. Run: `cd "C:\Users\Admin\Documents\Axelera Projects\NLFCP-updated\NLFCLP"`
5. Run: `npm run dev`

### Fix 3: Use Windows Terminal
1. Open Windows Terminal or Command Prompt outside VS Code
2. Navigate to project: `cd "C:\Users\Admin\Documents\Axelera Projects\NLFCP-updated\NLFCLP"`
3. Run: `npm run dev`

### Fix 4: Reinstall Git Bash
If nothing works, reinstall Git for Windows:
1. Download from: https://git-scm.com/download/win
2. During installation, choose "Use Windows' default console window"

## Alternative: Use Node.js Command Prompt
1. Search for "Node.js command prompt" in Windows Start menu
2. Navigate to project directory
3. Run npm commands directly