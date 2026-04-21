# Low-Level Design (LLD) - Customer Support Chatbot

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Component Breakdown](#component-breakdown)
3. [Chat Flow Diagram](#chat-flow-diagram)
4. [Message Queue System](#message-queue-system)
5. [Rate Limiting Strategy](#rate-limiting-strategy)
6. [Ban Avoidance Mechanisms](#ban-avoidance-mechanisms)
7. [Database Schema](#database-schema)
8. [API Specification](#api-specification)
9. [Security Considerations](#security-considerations)
10. [Scalability & Performance](#scalability--performance)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Login Page          │ Chat Page                      │   │
│  │ - Google Auth       │ - Message Display              │   │
│  │ - Firebase SignIn   │ - Input Box                    │   │
│  │                     │ - Polling for Bot Response     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬──────────────────────────────────────┘
                      │ Axios (HTTP/HTTPS)
┌─────────────────────▼──────────────────────────────────────┐
│               Backend (Express.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │  Auth Routes │  │  Chat Routes │  │  Error Handler    │ │
│  ├──────────────┤  ├──────────────┤  ├───────────────────┤ │
│  │ /verify      │  │ /send        │  │  Global Error     │ │
│  │ /me          │  │ /history     │  │  Middleware       │ │
│  │ /profile     │  │ /message/:id │  │                   │ │
│  │ /account     │  │              │  │                   │ │
│  └──────────────┘  └──────────────┘  └───────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Services Layer                          │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ - chatbotService: Rule-based responses              │  │
│  │ - rateLimiter: 5 messages/min per user              │  │
│  │ - antiBanService: Spam detection & throttling       │  │
│  │ - queueService: Bull/Redis job management           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────┐     ┌────────────────────────┐  │
│  │   MongoDB Driver       │     │   Redis Client         │  │
│  │  (Mongoose ORM)        │     │  (for cache/queue)     │  │
│  └────────────────────────┘     └────────────────────────┘  │
└─────────────────┬────────────────────┬──────────────────────┘
                  │                    │
        ┌─────────▼────────┐  ┌────────▼──────────┐
        │    MongoDB       │  │     Redis         │
        │  - Users         │  │  - Rate Limits    │
        │  - Messages      │  │  - Message Queue  │
        │                  │  │  - Cooldowns      │
        └──────────────────┘  └───────────────────┘
                  
        ┌──────────────────────────────────┐
        │   Message Worker (Bull Queue)    │
        │  - Process jobs one by one       │
        │  - Add delays (2-5 sec)          │
        │  - Generate bot responses        │
        │  - Save to database              │
        └──────────────────────────────────┘
```

---

## Component Breakdown

### Frontend Components

#### 1. **LoginForm Component**
- **Location**: `src/components/LoginForm.js`
- **Responsibility**: Handle Google authentication via Firebase
- **Features**:
  - Google Sign-In button
  - Token management
  - Error handling
  - Redirect to chat on success
- **Flow**:
  ```
  User clicks "Sign in with Google"
  → Firebase popup
  → Get ID token
  → Save to localStorage
  → Verify with backend
  → Redirect to /chat
  ```

#### 2. **ChatWindow Component**
- **Location**: `src/components/ChatWindow.js`
- **Responsibility**: Main chat interface
- **Features**:
  - Message display (user vs bot)
  - Input field with send button
  - Auto-scroll to latest
  - Typing indicator
  - Rate limit display
  - Polling for bot response
  - Toast notifications
- **State Management**:
  ```javascript
  messages[]        // All messages in conversation
  inputValue        // Current input text
  sending          // Boolean: message being sent
  isTyping         // Boolean: waiting for bot response
  loading          // Boolean: loading chat history
  rateLimit        // {remaining, resetIn} info
  ```

#### 3. **Toast Component**
- **Location**: `src/components/Toast.js`
- **Responsibility**: Display notifications
- **Types**: success, error, warning, info
- **Duration**: Auto-hide after 3 seconds

### Backend Services

#### 1. **chatbotService.js**
```javascript
// Rule-based response generation
const chatbotResponses = {
  "hi": "Hello! How can I help you?",
  "price": "Our pricing starts at $10/month",
  ...
}

// Functions:
generateBotResponse(userMessage) // → string
isValidMessage(message)           // → boolean
```

#### 2. **rateLimiter.js**
```javascript
// Redis-based rate limiting
// Key structure: rate_limit:{userId}
// Config: 5 messages per 60 seconds

// Functions:
checkRateLimit(userId)   // → {allowed, remaining, resetIn}
resetRateLimit(userId)   // Admin function
```

#### 3. **antiBanService.js**
```javascript
// Multi-layer spam/ban prevention
// 1. Duplicate message detection
// 2. Message velocity tracking
// 3. Cooldown periods
// 4. Action logging

// Functions:
getRandomDelay()                    // → 2-5 sec random
checkDuplicateMessages(userId, msg) // → {isDuplicate, count}
trackMessageVelocity(userId)        // → {shouldCooldown, count}
isUserInCooldown(userId)            // → boolean
getCooldownRemaining(userId)        // → milliseconds
logMessageAction(userId, action)    // Monitoring
```

#### 4. **queueService.js**
```javascript
// Bull/BullMQ message queue
// Config: 3 retries, exponential backoff
// Job concurrency: 5 parallel jobs

// Functions:
addMessageToQueue(messageData)  // → Job
getQueueStats()                 // → {active, waiting, completed}
clearQueue()                    // Admin function
```

---

## Chat Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Sends Message                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Frontend       │
                    │  sendMessage()  │
                    └────────┬────────┘
                             │
                    ┌────────▼──────────────┐
                    │  POST /api/chat/send  │
                    │  + Firebase ID Token  │
                    └────────┬──────────────┘
                             │
        ┌────────────────────▼──────────────────────┐
        │        Backend Route Handler              │
        └────────────────────┬──────────────────────┘
                             │
        ┌────────────────────▼──────────────────────┐
        │  1. Verify Firebase Token                 │
        │  2. Validate message (not empty, <1000)   │
        │  3. Check cooldown status                 │
        │  4. Check rate limit (5/min)              │
        │  5. Check duplicate messages              │
        └────────────────────┬──────────────────────┘
                             │
                    ┌────────▼────────────┐
                    │  All checks pass?   │
                    └────┬──────────┬─────┘
                         │ YES      │ NO (429/400)
                    ┌────▼────┐    │
                    │  Save   │    └─→ Return Error
                    │  User   │
                    │ Message │
                    └────┬────┘
                         │
                    ┌────▼──────────────┐
                    │  Add Job to Queue  │
                    │  (Bull/Redis)      │
                    └────┬──────────────┘
                         │
                    ┌────▼───────────┐
                    │  Return 201    │
                    │  + Job ID      │
                    └────┬───────────┘
                         │
        ┌────────────────▼──────────────────┐
        │  Frontend: Show Typing Indicator   │
        │  Start Polling /api/chat/history   │
        └────────────────┬──────────────────┘
                         │
        ┌────────────────▼──────────────────────┐
        │   Message Worker (Separate Process)   │
        │   Bull Worker listening on queue      │
        └────────────────┬──────────────────────┘
                         │
        ┌────────────────▼──────────────────────┐
        │  1. Get job: {userId, messageText}    │
        │  2. Random delay (2-5 seconds)        │
        │  3. Generate bot response             │
        │  4. Save bot message to DB            │
        │  5. Job completed                     │
        └────────────────┬──────────────────────┘
                         │
        ┌────────────────▼──────────────────────┐
        │  Frontend receives bot message        │
        │  1. Update messages array             │
        │  2. Hide typing indicator             │
        │  3. Auto-scroll to bottom             │
        │  4. Show success toast                │
        └───────────────────────────────────────┘
```

---

## Message Queue System

### Bull/BullMQ Configuration

```javascript
{
  connection: redisClient,
  concurrency: 5,              // 5 parallel workers
  attempts: 3,                 // Retry 3 times
  backoff: {
    type: 'exponential',       // 2s, 4s, 8s...
    delay: 2000
  }
}
```

### Job Structure

```javascript
{
  id: "msg-{userId}-{timestamp}",
  data: {
    messageId: ObjectId,       // Original user message
    userId: string,            // User ID
    text: string,              // Message content
    userMessageId: ObjectId
  },
  status: "active|completed|failed",
  progress: 0-100,
  attempts: 0-3,
  timestamp: Date
}
```

### Worker Processing

```
Job Received
  ↓
Update Progress (20%)
  ↓
Wait Random Delay (2-5s)
  ↓
Update Progress (50%)
  ↓
Generate Bot Response
  ↓
Save Bot Message (MongoDB)
  ↓
Update Progress (100%)
  ↓
Job Completed ✓
```

---

## Rate Limiting Strategy

### Configuration

```javascript
RATE_LIMIT_WINDOW_MS = 60000     // 1 minute window
RATE_LIMIT_MAX_MESSAGES = 5      // 5 messages max
```

### Redis Key Structure

```
rate_limit:{userId}
├─ Value: number (current count)
├─ TTL: 60 seconds (auto-expire)
└─ Increment: 1 per message
```

### Logic Flow

```
User sends message
  ↓
Get key "rate_limit:{userId}"
  ↓
INCR (increment by 1)
  ↓
First message?
  ├─ YES: EXPIRE key in 60s
  └─ NO: Get TTL
  ↓
count ≤ 5?
  ├─ YES: Allowed ✓
  └─ NO: 429 Too Many Requests ✗
```

### Response Format

```json
{
  "allowed": true/false,
  "remaining": 3,
  "resetIn": 45000
}
```

---

## Ban Avoidance Mechanisms

### 1. **Artificial Message Delay**

```javascript
getRandomDelay() {
  const MIN = 2000;  // 2 seconds
  const MAX = 5000;  // 5 seconds
  return Math.random() * (MAX - MIN) + MIN;
}
```

**Purpose**: Simulate natural human response time, prevent instant bot responses that trigger ban detection.

### 2. **Duplicate Message Detection**

```javascript
// Hash message to lowercase
messageHash = MD5(message.toLowerCase())

// Key: duplicate_check:{userId}:{hash}
// Action: INCR count
// Threshold: 3 duplicate messages → Block
```

**Purpose**: Prevent spam of identical messages.

### 3. **Message Velocity Tracking**

```javascript
// Key: message_velocity:{userId}
// Window: 60 seconds (sliding)
// Threshold: 10+ messages in 60s → Trigger cooldown

if (messageCount >= 10) {
  Set cooldown key: cooldown:{userId}
  Duration: 30 seconds
  Status: User blocked from sending
}
```

**Purpose**: Detect burst attacks and enforce cooldown.

### 4. **Cooldown Period**

```javascript
// Key: cooldown:{userId}
// TTL: 30 seconds
// During cooldown: All messages rejected with 429

if (user in cooldown) {
  return 429 "Too many messages. Please wait."
}
```

**Purpose**: Force user to wait after rapid message sending.

### 5. **Action Logging**

```javascript
logMessageAction(userId, action, details) {
  // Timestamp, user ID, action, details
  // Local: console.log
  // Production: Send to ELK, Splunk, CloudWatch
}

// Actions logged:
// - send_attempt
// - rate_limited
// - blocked_cooldown
// - duplicate_detected
// - processing_started
// - bot_response_sent
// - processing_error
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  firebaseUid: String,          // Firebase unique identifier
  name: String,                 // User display name
  email: String,                // Email (unique)
  photoURL: String,             // Google profile picture
  createdAt: Date,              // Account creation
  lastActivityAt: Date,         // Last message activity
  updatedAt: Date               // Last profile update
}

// Indexes:
// - firebaseUid (unique)
// - email (unique)
```

### Message Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId,             // Reference to User
  sender: String,               // "user" | "bot"
  text: String,                 // Message content
  messageHash: String,          // MD5 hash for duplicates
  timestamp: Date,              // Message sent time
  status: String,               // "pending" | "sent" | "failed"
  createdAt: Date,              // DB creation time
  updatedAt: Date               // DB update time
}

// Indexes:
// - userId + timestamp (composite for history)
// - userId (for user filtering)
// - timestamp (for time-based queries)
```

---

## API Specification

### Authentication Endpoints

#### 1. Verify Firebase Token
```
POST /api/auth/verify
Headers: Authorization: Bearer {idToken}
Response: {
  success: boolean,
  user: {
    _id: ObjectId,
    firebaseUid: string,
    name: string,
    email: string
  }
}
Status: 200 | 401 | 500
```

#### 2. Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer {idToken}
Response: {
  _id: ObjectId,
  firebaseUid: string,
  name: string,
  email: string,
  photoURL: string,
  createdAt: Date,
  lastActivityAt: Date
}
Status: 200 | 401 | 404 | 500
```

#### 3. Update Profile
```
PUT /api/auth/profile
Headers: Authorization: Bearer {idToken}
Body: {
  name?: string
}
Response: Updated user object
Status: 200 | 400 | 401 | 500
```

#### 4. Delete Account
```
DELETE /api/auth/account
Headers: Authorization: Bearer {idToken}
Response: { message: "Account deleted successfully" }
Status: 200 | 401 | 500
```

### Chat Endpoints

#### 1. Send Message
```
POST /api/chat/send
Headers: Authorization: Bearer {idToken}
Body: {
  text: string (required, 1-1000 chars)
}
Response: {
  success: true,
  message: {
    _id: ObjectId,
    sender: "user",
    text: string,
    timestamp: Date
  },
  queueJobId: string,
  info: {
    rateLimitRemaining: number,
    delayEstimate: string (e.g., "3s")
  }
}
Status: 201 | 400 | 429 | 500

// Errors:
400: Invalid message
429: Rate limited or cooldown active
500: Server error
```

#### 2. Get Chat History
```
GET /api/chat/history?limit=50&skip=0
Headers: Authorization: Bearer {idToken}
Response: {
  messages: [
    {
      _id: ObjectId,
      sender: "user" | "bot",
      text: string,
      timestamp: Date
    }
  ],
  total: number,
  limit: number,
  skip: number
}
Status: 200 | 401 | 500
```

#### 3. Get Single Message
```
GET /api/chat/message/:messageId
Headers: Authorization: Bearer {idToken}
Response: {
  _id: ObjectId,
  sender: string,
  text: string,
  timestamp: Date,
  status: string
}
Status: 200 | 401 | 404 | 500
```

### Health Endpoints

#### Health Check
```
GET /health
Response: {
  status: "OK",
  timestamp: Date
}
Status: 200
```

#### Stats
```
GET /api/stats
Response: {
  server: "running",
  uptime: number (seconds),
  timestamp: Date
}
Status: 200 | 500
```

---

## Security Considerations

### 1. **Firebase Authentication**
- ID tokens verified server-side
- Tokens have 1-hour expiration
- Refresh tokens handled by SDK
- Tokens included in all requests

### 2. **Authorization**
- All chat/auth routes require valid token
- Users can only access own messages
- User ID verified from token, not request body

### 3. **Input Validation**
- Message length: 1-1000 characters
- SQL injection: MongoDB parameterized queries
- XSS: Sanitization on display (React escapes)

### 4. **Rate Limiting**
- Per-user limits prevent brute force
- Redis TTL auto-cleanup
- Cooldown prevents bulk spam

### 5. **Data Privacy**
- No passwords stored
- Firebase handles sensitive auth data
- Messages encrypted in transit (HTTPS)
- Database encryption at rest (MongoDB Atlas)

### 6. **CORS Configuration**
```javascript
cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})
```

---

## Scalability & Performance

### Current Capacity

```
Assumptions:
- Redis: 100K concurrent connections
- MongoDB: 10K concurrent connections
- Node.js process: 4GB RAM
- Worker concurrency: 5 jobs

Estimated throughput:
- Peak: 500-1000 messages/second
- Average: 100-200 messages/second
```

### Optimization Strategies

#### 1. **Database**
```javascript
// Indexes optimize queries:
- userId + timestamp: Chat history queries
- firebaseUid: User lookup
- TTL index on audit logs: Auto-cleanup
```

#### 2. **Caching**
```javascript
// Redis caching:
- Rate limit counters (hot data)
- Message velocity tracking
- Cooldown flags
- Session tokens (optional)
```

#### 3. **Queue Optimization**
```javascript
- Concurrency: 5 workers (tune based on load)
- Batch processing: Optional for burst loads
- Job expiry: 24 hours cleanup
- Priority: High-priority jobs first
```

#### 4. **Frontend Optimization**
```javascript
- Message virtualization: Display only visible messages
- Lazy loading: Load history on scroll
- Code splitting: Separate route bundles
- Image optimization: Firebase lazy-load
```

### Horizontal Scaling

```
Load Balancer
    ├─ Backend 1 (Express)
    ├─ Backend 2 (Express)
    ├─ Backend 3 (Express)
    └─ Backend N (Express)

Shared Resources:
    ├─ MongoDB (Replica Set)
    ├─ Redis Cluster
    └─ Firebase (Global)

Workers:
    ├─ Worker 1 (Bull)
    ├─ Worker 2 (Bull)
    └─ Worker N (Bull)
```

### Monitoring & Alerting

```javascript
// Metrics to track:
- Queue depth (jobs waiting)
- Worker error rate
- Message processing time
- Rate limit hits
- Database connection pool
- Redis memory usage
- API response times
- User concurrent sessions
```

---

## Summary

This architecture provides:
- ✅ **Real-time chat** with message queue
- ✅ **Rate limiting** (5 msgs/min per user)
- ✅ **Ban prevention** (multi-layer protection)
- ✅ **Scalable** (horizontal expansion ready)
- ✅ **Secure** (Firebase auth, input validation)
- ✅ **Maintainable** (modular services)
- ✅ **Observable** (comprehensive logging)
