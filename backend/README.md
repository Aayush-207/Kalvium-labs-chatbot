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

### 5. Firebase Setup
1. Create a Firebase project
2. Enable Google authentication
3. Get your credentials from Firebase Console
4. Add to `.env`:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

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
- `POST /api/auth/verify` - Verify Firebase token
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
✓ Firebase Google Authentication
✓ Message Queue with artificial delays
✓ Rate Limiting (5 msgs/min per user)
✓ Anti-ban protection
✓ Duplicate message detection
✓ Cooldown periods for rapid sending
✓ Comprehensive logging
