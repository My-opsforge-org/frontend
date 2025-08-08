@echo off
echo Cleaning up Git repository...

REM Remove node_modules from Git tracking (if it exists)
echo Removing node_modules from Git tracking...
git rm -r --cached node_modules 2>nul || echo node_modules not tracked in current commit

REM Remove any other large files that might be tracked
echo Checking for large files...
git ls-files | findstr /R "\.pack$ \.tar$ \.gz$ \.zip$ \.rar$ \.7z$" > temp_files.txt
for /f "tokens=*" %%i in (temp_files.txt) do (
    echo Found large file: %%i
    git rm --cached "%%i" 2>nul || echo Could not remove %%i
)
del temp_files.txt 2>nul

REM Add the updated .gitignore
echo Adding updated .gitignore...
git add .gitignore

REM Commit the changes
echo Committing changes...
git commit -m "Remove node_modules from tracking and update .gitignore"

echo Cleanup completed!
echo You can now try: git push origin main
pause
