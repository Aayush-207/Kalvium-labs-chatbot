# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+
- MongoDB (connection string in `.env`)
- Redis (connection string in `.env`)

### Setup Steps

#### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB and Redis connection strings
# Example:
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
# REDIS_URL=redis://localhost:6379
# JWT_SECRET=your-secret-key
```

#### 2. Terminal 1: Start Backend

```bash
cd backend
npm run dev
```

Backend will be at: `http://localhost:5000`

#### 3. Terminal 2: Start Message Worker

```bash
cd backend
npm run worker:dev
```

#### 4. Terminal 3: Start Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Create .env.local file
cp .env.example .env.local

# Start dev server
npm run dev
```

Frontend will be at: `http://localhost:3000`

---

## 🧪 Test the Application

### 1. Open Browser
Go to `http://localhost:3000`

### 2. Create Account or Login
- Click "Sign up" to register with email/password OR
- Click "Sign in" with existing credentials
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
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Use returned JWT token for other endpoints
curl -H "Authorization: Bearer {JWT_TOKEN}" \
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
# Check if MongoDB is running (test connection)
curl http://localhost:5000/health

# View backend logs
tail -f backend/logs/*.log

# Check JWT_SECRET is set
cat backend/.env | grep JWT_SECRET
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

### MongoDB Connection Issues

```bash
# If using local MongoDB
mongosh --eval "db.adminCommand('ping')"

# If using MongoDB Atlas
# Verify MONGO_URI in .env is correct
# Check IP whitelist in MongoDB Atlas
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
