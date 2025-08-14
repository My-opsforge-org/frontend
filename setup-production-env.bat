@echo off
echo Setting up production environment variables for frontend...
echo.

echo Creating .env.local file with production configuration...
echo.

echo # Frontend Environment Configuration for Production > .env.local
echo. >> .env.local
echo # Backend Server Configuration >> .env.local
echo # Primary configuration - use this for all backend calls >> .env.local
echo REACT_APP_BASE_URL=https://api.opsforge.me/api >> .env.local
echo. >> .env.local
echo # Alternative configurations (if needed) >> .env.local
echo # Production backend URL (without /api suffix) >> .env.local
echo REACT_APP_BACKEND_URL=https://api.opsforge.me >> .env.local
echo. >> .env.local
echo # Client Configuration >> .env.local
echo REACT_APP_CLIENT_URL=https://opsforge.me >> .env.local
echo. >> .env.local
echo # Environment >> .env.local
echo NODE_ENV=production >> .env.local
echo. >> .env.local
echo # Feature Flags >> .env.local
echo REACT_APP_ENABLE_SOCKET_IO=true >> .env.local
echo REACT_APP_ENABLE_REAL_TIME_CHAT=true >> .env.local
echo REACT_APP_ENABLE_AVATAR_CHAT=true >> .env.local
echo REACT_APP_ENABLE_COMMUNITY_CHAT=true >> .env.local
echo. >> .env.local
echo # Build Configuration >> .env.local
echo GENERATE_SOURCEMAP=false >> .env.local
echo REACT_APP_VERSION=1.0.0 >> .env.local
echo. >> .env.local
echo # Debug Configuration >> .env.local
echo REACT_APP_DEBUG=false >> .env.local
echo REACT_APP_LOG_LEVEL=warn >> .env.local

echo.
echo .env.local file created successfully!
echo.
echo Please restart your development server for the changes to take effect.
echo.
pause
