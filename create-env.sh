#!/bin/bash

# Frontend Environment Setup Script
# Creates .env file with correct backend IP configuration

echo "🔧 Creating frontend .env file with correct backend IP..."

cat > .env << 'EOF'
# Frontend Environment Configuration

# Backend Server Configuration
# Update this to your actual backend IP
REACT_APP_BASE_URL=http://4.206.104.171:5002/api
REACT_APP_BACKEND_URL=http://4.206.104.171:5002

# Client Configuration
REACT_APP_CLIENT_URL=http://4.205.228.59

# Environment
NODE_ENV=production

# Development Server Configuration
PORT=3000
HTTPS=false

# Build Configuration
GENERATE_SOURCEMAP=false
REACT_APP_VERSION=1.0.0

# Debug Configuration
REACT_APP_DEBUG=true
REACT_APP_LOG_LEVEL=info

# Feature Flags
REACT_APP_ENABLE_SOCKET_IO=true
REACT_APP_ENABLE_REAL_TIME_CHAT=true
REACT_APP_ENABLE_AVATAR_CHAT=true
REACT_APP_ENABLE_COMMUNITY_CHAT=true

# External Services
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyDMOv3ucij8PQPtVLPvFZ88arhaRfl0lEA
REACT_APP_GOOGLE_PLACES_API_KEY=AIzaSyDMOv3ucij8PQPtVLPvFZ88arhaRfl0L0

# Firebase Configuration
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
EOF

echo "✅ Frontend .env file created successfully!"
echo "🌐 Frontend will now connect to backend at: http://4.206.104.171:5002"
echo "📍 Frontend URL: http://4.205.228.59"
echo ""
echo "To apply changes:"
echo "1. Run: npm run build"
echo "2. Deploy the new build to your frontend VM"
echo ""
echo "Or run: git add . && git commit -m 'Fix API endpoints' && git push origin master"















