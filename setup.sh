#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Customer Support Chatbot - Setup Script${NC}\n"

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}\n"

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v)${NC}\n"

# Backend setup
echo -e "${YELLOW}Setting up Backend...${NC}"
cd backend
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please fill in MongoDB, Redis, and JWT_SECRET in backend/.env${NC}"
fi
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}\n"

# Frontend setup
cd ../frontend
echo -e "${YELLOW}Setting up Frontend...${NC}"
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo -e "${GREEN}✓ Frontend .env.local created${NC}"
fi
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}\n"

# Summary
echo -e "${GREEN}✓ Setup Complete!${NC}\n"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Edit backend/.env:"
echo "   MONGO_URI=mongodb://localhost:27017/chatbot"
echo "   REDIS_URL=redis://localhost:6379"
echo "   JWT_SECRET=your-secret-key"
echo ""
echo "2. Start MongoDB: mongod"
echo "3. Start Redis: redis-server"
echo "4. Run: npm run dev:all (from root)"
echo ""
echo -e "${BLUE}Or use Docker:${NC}"
echo "docker-compose up -d"
echo ""
echo -e "${BLUE}See QUICK_START.md for more details${NC}"
