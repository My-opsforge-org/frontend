#!/bin/bash

echo "Cleaning up Git repository..."

# Remove node_modules from Git tracking (if it exists)
echo "Removing node_modules from Git tracking..."
git rm -r --cached node_modules 2>/dev/null || echo "node_modules not tracked in current commit"

# Remove any other large files that might be tracked
echo "Checking for large files..."
git ls-files | grep -E "\.(pack|tar|gz|zip|rar|7z)$" | while read file; do
    echo "Found large file: $file"
    git rm --cached "$file" 2>/dev/null || echo "Could not remove $file"
done

# Add the updated .gitignore
echo "Adding updated .gitignore..."
git add .gitignore

# Commit the changes
echo "Committing changes..."
git commit -m "Remove node_modules from tracking and update .gitignore"

echo "Cleanup completed!"
echo "You can now try: git push origin master"
