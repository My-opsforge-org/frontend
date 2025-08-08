@echo off
echo Building and testing frontend locally...

echo Step 1: Installing dependencies...
npm ci

echo Step 2: Building the React app...
npm run build

echo Step 3: Testing the build...
if exist "build\index.html" (
    echo ✅ Build successful! Frontend is ready for deployment.
    echo 📁 Build files are in the 'build' folder
    echo 🌐 You can serve the build locally with: npx serve -s build
) else (
    echo ❌ Build failed! Check the error messages above.
    pause
    exit 1
)

echo.
echo 🎉 Local build completed successfully!
echo.
echo Next steps when VM is accessible:
echo 1. Copy the 'build' folder to your VM
echo 2. Configure nginx to serve the files
echo 3. Or use the GitHub Actions workflow
echo.
pause
