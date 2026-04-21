# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Docker (Recommended)

```bash
# 1. Start services with Docker Compose
docker-compose up -d

# 2. Backend will be at: http://localhost:5000
# 3. Frontend will be at: http://localhost:3000
```

**Stop services:**
```bash
docker-compose down
```

---

### Option 2: Local Setup

#### Prerequisites
- Node.js 18+
- MongoDB running locally
- Redis running locally

#### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env

# 4. Fill in Firebase credentials in .env

# 5. Terminal 1: Start Express server
npm run dev

# 6. Terminal 2: Start message worker
npm run worker:dev

# Backend at http://localhost:5000
```

#### Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file
cp .env.example .env.local

# 4. Fill in Firebase config in .env.local

# 5. Start Next.js dev server
npm run dev

# Frontend at http://localhost:3000
```

---

## 🧪 Test the Application

### 1. Open Browser
Go to `http://localhost:3000`

### 2. Login with Google
- Click "Sign in with Google"
- Use any Google account
- You'll be redirected to `/chat`

### 3. Send Messages
- Type: "hi" → Bot responds with greeting
- Type: "price" → Bot responds with pricing
- Type: "help" → Bot responds with help message
- Send 6+ messages in 1 minute → Get rate limit error
- Send 10+ messages in 60 seconds → Cooldown activated

### 4. View Console Logs
- **Backend**: Watch logs for message processing
- **Worker**: Watch for job processing
- **Frontend**: Check browser DevTools for API calls

---

## 🔍 Verify Everything Works

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Expected:
# {"status":"OK","timestamp":"2024-04-21T10:30:00.000Z"}
```

### API Test

```bash
# Get chat history (requires Firebase token)
curl -H "Authorization: Bearer {YOUR_TOKEN}" \
  http://localhost:5000/api/chat/history
```

---

## 📊 View Database

### MongoDB

```bash
# Using MongoDB Compass (GUI)
# Connection: mongodb://localhost:27017/chatbot

# Or using CLI
mongosh
> use chatbot
> db.users.find()
> db.messages.find()
```

### Redis

```bash
# Using Redis CLI
redis-cli

> KEYS *
> GET rate_limit:user123
> LRANGE message-processing 0 -1
```

---

## 🐛 Debugging

### Backend Issues

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check if Redis is running
redis-cli ping

# View backend logs
tail -f backend/logs/*.log

# Test MongoDB connection
curl http://localhost:5000/health
```

### Frontend Issues

```bash
# Check if port 3000 is available
lsof -i :3000

# Clear Next.js cache
rm -rf frontend/.next

# Reinstall dependencies
cd frontend && npm install
```

### Firebase Issues

```bash
# Verify Firebase config
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
# Must match Firebase Console project

# Check Firebase credentials
cat backend/.env | grep FIREBASE
```

---

## 📝 Common Commands

```bash
# Backend
npm run dev          # Start server (with auto-reload)
npm run worker:dev   # Start message worker
npm start            # Production server

# Frontend
npm run dev          # Start dev server (with hot reload)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Check code quality

# Database
mongosh              # Connect to MongoDB
redis-cli            # Connect to Redis

# Docker
docker-compose up    # Start all services
docker-compose down  # Stop all services
docker logs -f {container-name}  # View logs
```

---

## 🎯 What to Explore

1. **Chat Flow**: Send a message and watch the logs
2. **Rate Limiting**: Send 6+ messages in 1 minute
3. **Queue Processing**: Check Redis for pending jobs
4. **Database**: Browse MongoDB for saved messages
5. **Logging**: Check backend console for action logs

---

## 🚀 Next Steps

- Read [README.md](../README.md) for full documentation
- Check [docs/LLD.md](../docs/LLD.md) for architecture
- Customize chatbot responses in `backend/src/services/chatbotService.js`
- Deploy to production (Vercel + Railway)

---

## 💡 Tips

- **Hot Reload**: Backend uses nodemon, frontend uses Next.js HMR
- **CORS**: Configured for localhost:3000 → localhost:5000
- **Rate Limit**: 5 messages per 60 seconds per user
- **Response Delay**: Random 2-5 seconds (anti-ban)
- **Cooldown**: 30 seconds after 10+ rapid messages

---

**Happy coding! 🎉**
