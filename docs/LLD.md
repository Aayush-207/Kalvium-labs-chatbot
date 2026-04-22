# Low-Level Design (LLD) - Customer Support Chatbot

## Table of Contents
1. [Architecture](#architecture)
2. [API Endpoints](#api-endpoints)
3. [4 Anti-Ban Mechanisms](#4-anti-ban-mechanisms)
4. [Database](#database)
5. [Security](#security)

---

## Architecture

**Frontend**: Next.js 14 + React 18 + Tailwind CSS (port 3000)
**Backend**: Express.js (port 5000)
**Database**: lowdb (file-based JSON at `backend/db.json`)
**Optional**: Redis (port 6379) for rate limiting & cooldowns

### Response Flow
1. User sends message → Save instantly to lowdb
2. Add 2-5 second artificial delay (simulates thinking)
3. Generate bot response synchronously
4. Save bot message → Return both messages in single response

### Key Services
- **chatbotService**: Keyword-based responses
- **antiBanService**: 4-layer spam prevention
- **rateLimiter**: 5 msgs/min per user (Redis with fallback)
- **queueService**: Message queue (Bull/Redis or sync mode)

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `DELETE /api/auth/account` - Delete account

### Chat (Requires JWT)
- `POST /api/chat/send` - Send message → Returns user + bot messages
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/message/:id` - Get single message

### Response Example
```json
{
  "success": true,
  "message": { "_id": "...", "sender": "user", "text": "Hello" },
  "botMessage": { "_id": "...", "sender": "bot", "text": "Hello! How can I help you?" }
}
```

### Chatbot Keywords
- **"hi" / "hello"** → "Hello! How can I help you?"
- **"price" / "pricing"** → "Our pricing starts at $10/month"
- **"help"** → "How can I assist you today?"
- **"thanks" / "thank"** → "You are welcome!"
- **Default** → "I'm not sure, our team will contact you soon"

---

## 4 Anti-Ban Mechanisms

### 1. Artificial Message Delay (2-5 seconds)
Simulates natural response time to prevent instant bot detection.
```javascript
getRandomDelay() {
  return Math.random() * 3000 + 2000;  // 2-5 seconds
}
```

### 2. Duplicate Message Detection (3-message threshold)
Blocks spam using MD5 hash with 5-minute window.
- **Key**: `duplicate_check:{userId}:{MD5Hash}`
- **Threshold**: 3 identical messages → HTTP 400
- **Window**: 5 minutes (auto-expire)

### 3. Message Velocity Tracking (10 msgs/60sec)
Detects rapid bursts and triggers cooldown.
- **Key**: `message_velocity:{userId}`
- **Window**: 60 seconds (sliding)
- **Threshold**: 10+ messages → Activate 30-second cooldown

### 4. Cooldown Period (30 seconds)
Enforces wait period after velocity exceeded.
- **Key**: `cooldown:{userId}`
- **Duration**: 30 seconds
- **Response**: HTTP 429 (Too Many Requests)

---

## Database

### Users Collection (lowdb)
```json
{
  "_id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SHA256_HASH",
  "createdAt": "2026-04-22T10:00:00Z",
  "lastActivityAt": "2026-04-22T10:05:00Z"
}
```

### Messages Collection (lowdb)
```json
{
  "_id": "uuid",
  "userId": "uuid",
  "sender": "user|bot",
  "text": "Message content",
  "messageHash": "MD5_HASH",
  "timestamp": "2026-04-22T10:00:00Z",
  "status": "sent|delivered"
}
```

---

## Security

- **Auth**: JWT (HS256) stored in localStorage, attached to all /api/chat requests
- **Passwords**: SHA256 hashing, never returned in API responses
- **Rate Limiting**: 5 msgs/min per user, graceful fallback without Redis
- **Validation**: Message length 1-1000 chars, email format validation
- **Error Handling**: Global middleware, no stack traces leaked, proper HTTP codes (400, 401, 429, 500)
- **CORS**: Restricted to frontend origin
- **Input**: Lowdb protects against SQL injection; React escapes XSS

---


