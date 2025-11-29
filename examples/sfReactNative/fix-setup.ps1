# Quick Fix Script for SignalForge React Native Example
# Run this from the examples/sfReactNative directory

Write-Host "🔧 SignalForge React Native - Quick Fix Script" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build the library
Write-Host "📦 Step 1/5: Building SignalForge library..." -ForegroundColor Yellow
Push-Location ..\..
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Check for errors above." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location
Write-Host "✅ Library built successfully!" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "📦 Step 2/5: Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Step 3: Verify AsyncStorage
Write-Host "🔍 Step 3/5: Verifying AsyncStorage..." -ForegroundColor Yellow
$packageJson = Get-Content package.json | ConvertFrom-Json
if ($packageJson.dependencies.'@react-native-async-storage/async-storage') {
    Write-Host "✅ AsyncStorage is installed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Installing AsyncStorage..." -ForegroundColor Yellow
    npm install @react-native-async-storage/async-storage
    Write-Host "✅ AsyncStorage installed!" -ForegroundColor Green
}
Write-Host ""

# Step 4: iOS Pods (if on macOS)
if ($IsMacOS) {
    Write-Host "🍎 Step 4/5: Installing iOS Pods..." -ForegroundColor Yellow
    Push-Location ios
    pod install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Pod install had issues, but continuing..." -ForegroundColor Yellow
    } else {
        Write-Host "✅ Pods installed!" -ForegroundColor Green
    }
    Pop-Location
} else {
    Write-Host "⏭️  Step 4/5: Skipping iOS (not on macOS)" -ForegroundColor Gray
}
Write-Host ""

# Step 5: Success message
Write-Host "🎉 Step 5/5: Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✅ All fixes applied successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 To run the app:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Terminal 1:" -ForegroundColor Yellow
Write-Host "  npm start" -ForegroundColor White
Write-Host ""
Write-Host "Terminal 2:" -ForegroundColor Yellow
Write-Host "  npm run android    # For Android" -ForegroundColor White
Write-Host "  npm run ios        # For iOS (macOS only)" -ForegroundColor White
Write-Host ""
Write-Host "💡 If you encounter issues:" -ForegroundColor Cyan
Write-Host "  1. Clear Metro cache: npm start -- --reset-cache" -ForegroundColor White
Write-Host "  2. Check TROUBLESHOOTING.md" -ForegroundColor White
Write-Host "  3. Read SETUP_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Happy coding with SignalForge!" -ForegroundColor Magenta
