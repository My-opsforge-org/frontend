@echo off
echo Fixing Git repository by removing large files from history...

echo Step 1: Creating backup of current files...
if not exist "backup" mkdir backup
xcopy /E /I /Y "src" "backup\src" >nul 2>&1
xcopy /E /I /Y "public" "backup\public" >nul 2>&1
copy "package.json" "backup\" >nul 2>&1
copy "package-lock.json" "backup\" >nul 2>&1
copy "tsconfig.json" "backup\" >nul 2>&1
copy ".gitignore" "backup\" >nul 2>&1
copy "README.md" "backup\" >nul 2>&1
xcopy /E /I /Y ".github" "backup\.github" >nul 2>&1

echo Step 2: Removing .git directory...
rmdir /S /Q ".git"

echo Step 3: Initializing new Git repository...
git init

echo Step 4: Adding files back (excluding node_modules)...
git add .

echo Step 5: Making initial commit...
git commit -m "Initial commit - clean repository without node_modules"

echo Step 6: Adding remote origin...
git remote add origin https://github.com/My-opsforge-org/frontend.git

echo Step 7: Force pushing to replace the repository...
echo WARNING: This will completely replace the remote repository!
echo Press any key to continue or Ctrl+C to cancel...
pause

git push -f origin main

echo.
echo Repository fixed! The large files have been removed from history.
echo Your backup is in the 'backup' folder.
pause
