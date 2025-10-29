## Development Server Restart Guide

### Issue
After cleaning the `.next` directory, the development server needs to be completely restarted to rebuild the application.

### Solution Steps

1. **Kill All Node Processes**
   ```bash
   taskkill /F /IM node.exe
   ```

2. **Clean Install Dependencies** (if needed)
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   Or alternatively:
   ```bash
   npx next dev
   ```

### Expected Output
When the server starts successfully, you should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
event - compiled client and server successfully in XXXms
```

### Testing Schema Fix
Once the server is running:

1. **Navigate to Admin Panel**
   - Go to `http://localhost:3000`
   - Login as admin
   - Navigate to Program Configuration

2. **Test Day 1 Configuration**
   - Go to "Day 1" section
   - Verify burden test questions display properly
   - Configure videos for mild/moderate/severe levels
   - Click "Save Day 1 Configuration"
   - **Expected Result**: No validation errors, successful save

3. **Verify Data Structure**
   - Questions should have `questionText.english` field
   - Multi-language support (English, Kannada, Hindi)
   - All burden levels configurable

### Schema Validation Fix Status
✅ **COMPLETED**: 
- Component uses proper `questionText.english` structure
- API handler supports new format with backward compatibility
- Multi-language support implemented
- Validation error should be resolved

### If Server Won't Start
Try these steps:
1. Check port 3000 is not in use: `netstat -ano | findstr :3000`
2. Clean node_modules: `rm -rf node_modules && npm install`
3. Check for syntax errors in recent changes
4. Try different port: `npx next dev --port 3001`

### Manual Verification
You can manually verify the schema fix by checking:
- `components/ProgramConfigManager.js` - burdenTestQuestions structure
- `pages/api/admin/program/config/day1.js` - questionText handling
- Both files now use the correct MongoDB schema format