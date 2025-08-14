#!/bin/bash

echo "Setting up production environment variables for frontend..."
echo

echo "Creating .env.local file with production configuration..."
echo

cat > .env.local << 'EOF'
# Frontend Environment Configuration for Production

# Backend Server Configuration
# Primary configuration - use this for all backend calls
REACT_APP_BASE_URL=https://api.opsforge.me/api

# Alternative configurations (if needed)
# Production backend URL (without /api suffix)
REACT_APP_BACKEND_URL=https://api.opsforge.me

# Client Configuration
REACT_APP_CLIENT_URL=https://opsforge.me

# Environment
NODE_ENV=production

# Feature Flags
REACT_APP_ENABLE_SOCKET_IO=true
REACT_APP_ENABLE_REAL_TIME_CHAT=true
REACT_APP_ENABLE_AVATAR_CHAT=true
REACT_APP_ENABLE_COMMUNITY_CHAT=true

# Build Configuration
GENERATE_SOURCEMAP=false
REACT_APP_VERSION=1.0.0

# Debug Configuration
REACT_APP_DEBUG=false
REACT_APP_LOG_LEVEL=warn
EOF

echo
echo ".env.local file created successfully!"
echo
echo "Please restart your development server for the changes to take effect."
echo
