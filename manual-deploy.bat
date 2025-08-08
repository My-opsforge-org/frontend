@echo off
echo Manual Deployment Instructions
echo =============================
echo.
echo Since VM connection is timing out, here are manual steps:
echo.
echo 1. BUILD LOCALLY:
echo    cd frontend
echo    npm ci
echo    npm run build
echo.
echo 2. WHEN VM IS ACCESSIBLE:
echo    - Copy the 'build' folder to your VM
echo    - SSH into your VM
echo    - Copy files: scp -r build/* username@vm-ip:/home/username/frontend/
echo.
echo 3. CONFIGURE NGINX ON VM:
echo    sudo tee /etc/nginx/sites-available/frontend << 'EOF'
echo    server {
echo        listen 80;
echo        server_name _;
echo        root /home/username/frontend;
echo        index index.html;
echo        location / {
echo            try_files $uri /index.html;
echo        }
echo    }
echo    EOF
echo.
echo 4. ENABLE SITE AND RESTART:
echo    sudo ln -sf /etc/nginx/sites-available/frontend /etc/nginx/sites-enabled/
echo    sudo rm -f /etc/nginx/sites-enabled/default
echo    sudo systemctl restart nginx
echo.
echo 5. OR USE GITHUB ACTIONS:
echo    - Push to master branch
echo    - GitHub Actions will auto-deploy when VM is accessible
echo.
echo Press any key to continue...
pause
