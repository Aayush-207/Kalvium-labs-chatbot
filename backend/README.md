# Backend README

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### 3. Start Redis
```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or using local Redis
redis-server
```

### 4. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 mongo:latest

# Or using local MongoDB
mongod
```

### 5. Environment Setup
Add to `.env`:
   - `MONGO_URI` - MongoDB connection string
   - `REDIS_URL` - Redis connection string
   - `JWT_SECRET` - Secret key for JWT tokens

### 6. Start Backend Server
```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 7. Start Message Worker (in separate terminal)
```bash
npm run worker:dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account

### Chat
- `POST /api/chat/send` - Send message
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/message/:messageId` - Get single message

### Health
- `GET /health` - Health check
- `GET /api/stats` - Server stats

## Architecture

### Core Services
- **chatbotService**: Rule-based chatbot logic
- **rateLimiter**: 5 messages/minute per user
- **antiBanService**: Spam detection, cooldown, duplicate prevention
- **queueService**: Message queue management (Bull/BullMQ)

### Message Flow
1. User sends message → Rate limit check
2. Anti-ban checks (duplicate, velocity, cooldown)
3. Message saved to DB
4. Job added to queue
5. Worker processes with 2-5s delay
6. Bot response generated and saved

## Features
✓ JWT Authentication
✓ Message Queue with artificial delays
✓ Rate Limiting (5 msgs/min per user)
✓ Anti-ban protection
✓ Duplicate message detection
✓ Cooldown periods for rapid sending
✓ Comprehensive logging
