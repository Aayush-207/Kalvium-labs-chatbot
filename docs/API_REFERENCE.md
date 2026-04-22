# API Reference

## Base URL
```
http://localhost:5000
```

## Authentication
All endpoints (except `/health` and `/api/auth/register`/`/api/auth/login`) require JWT token in header:
```
Authorization: Bearer {jwtToken}
```

---

## Authentication Endpoints

### 1. Register User
Create a new user account.

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "607f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Status Codes:**
- `201` - User registered successfully
- `400` - Invalid request
- `409` - User already exists
- `500` - Server error

---

### 2. Login User
Authenticate and get JWT token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "607f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

**Status Codes:**
- `200` - Login successful
- `400` - Invalid request
- `401` - Invalid credentials
- `500` - Server error

---

### 3. Get Current User Profile
```http
GET /api/auth/me
Authorization: Bearer {jwtToken}
```

**Response:**
```json
{
  "_id": "607f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-04-20T10:30:00.000Z",
  "lastActivityAt": "2024-04-21T15:45:00.000Z",
  "updatedAt": "2024-04-21T15:45:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - User not found
- `500` - Server error

---

### 4. Update User Profile
```http
PUT /api/auth/profile
Authorization: Bearer {jwtToken}
Content-Type: application/json

{
  "name": "Jane Doe"
}
```

**Response:**
```json
{
  "_id": "607f1f77bcf86cd799439011",
  "name": "Jane Doe",
  "email": "john@example.com"
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Invalid request
- `401` - Unauthorized
- `500` - Server error

---

### 5. Delete Account
Deletes user and all associated messages.

```http
DELETE /api/auth/account
Authorization: Bearer {jwtToken}
```

**Response:**
```json
{
  "message": "Account deleted successfully"
}
```

**Status Codes:**
- `200` - Deleted successfully
- `401` - Unauthorized
- `500` - Server error

---

## Chat Endpoints

### 1. Send Message
Send a message to the chatbot. Subject to rate limiting and anti-ban checks.

```http
POST /api/chat/send
Authorization: Bearer {jwtToken}
Content-Type: application/json

{
  "text": "Hello, what is your pricing?"
}
```

**Request Body:**
```javascript
{
  text: string  // Required, 1-1000 characters
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": {
    "_id": "607f1f77bcf86cd799439012",
    "userId": "607f1f77bcf86cd799439011",
    "sender": "user",
    "text": "Hello, what is your pricing?",
    "timestamp": "2024-04-21T15:45:00.000Z",
    "status": "sent"
  },
  "queueJobId": "msg-user-123-1713699900000",
  "info": {
    "rateLimitRemaining": 4,
    "delayEstimate": "3s"
  }
}
```

**Response (Rate Limited - 429):**
```json
{
  "error": "Too many messages. Please wait.",
  "remaining": 0,
  "resetIn": 35000
}
```

**Response (Cooldown - 429):**
```json
{
  "error": "Too many messages. Please wait.",
  "retryAfter": 25000
}
```

**Response (Duplicate - 400):**
```json
{
  "error": "Please avoid sending duplicate messages"
}
```

**Response (Invalid - 400):**
```json
{
  "error": "Invalid message"
}
```

**Status Codes:**
- `201` - Message sent successfully
- `400` - Invalid message or duplicate
- `429` - Rate limited or in cooldown
- `401` - Unauthorized
- `500` - Server error

---

### 2. Get Chat History
Retrieve paginated chat history for current user.

```http
GET /api/chat/history?limit=50&skip=0
Authorization: Bearer {jwtToken}
```

**Query Parameters:**
- `limit` (optional, default: 50) - Number of messages to return
- `skip` (optional, default: 0) - Number of messages to skip

**Response:**
```json
{
  "messages": [
    {
      "_id": "607f1f77bcf86cd799439012",
      "userId": "607f1f77bcf86cd799439011",
      "sender": "user",
      "text": "Hi",
      "timestamp": "2024-04-21T15:40:00.000Z",
      "status": "sent"
    },
    {
      "_id": "607f1f77bcf86cd799439013",
      "userId": "607f1f77bcf86cd799439011",
      "sender": "bot",
      "text": "Hello! How can I help you?",
      "timestamp": "2024-04-21T15:40:05.000Z",
      "status": "sent"
    }
  ],
  "total": 100,
  "limit": 50,
  "skip": 0
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `500` - Server error

---

### 3. Get Single Message
Retrieve a specific message by ID.

```http
GET /api/chat/message/607f1f77bcf86cd799439012
Authorization: Bearer {jwtToken}
```

**Response:**
```json
{
  "_id": "607f1f77bcf86cd799439012",
  "userId": "607f1f77bcf86cd799439011",
  "sender": "user",
  "text": "What's your pricing?",
  "timestamp": "2024-04-21T15:40:00.000Z",
  "status": "sent"
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `404` - Message not found
- `500` - Server error

---

## Health & Stats Endpoints

### 1. Health Check
Simple health check endpoint (no authentication required).

```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-04-21T15:45:00.000Z"
}
```

**Status Codes:**
- `200` - Server is healthy

---

### 2. Server Stats
Get server statistics.

```http
GET /api/stats
Authorization: Bearer {jwtToken}
```

**Response:**
```json
{
  "server": "running",
  "uptime": 3600.5,
  "timestamp": "2024-04-21T15:45:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `500` - Server error

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error message describing what went wrong"
}
```

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Invalid message | Message empty or too long |
| 400 | Please avoid sending duplicate messages | Same message sent 3+ times |
| 401 | Unauthorized | Missing or invalid token |
| 429 | Too many messages. Please wait. | Rate limit exceeded or in cooldown |
| 404 | Message not found | Message ID doesn't exist |
| 500 | Internal server error | Server-side error |

---

## Rate Limiting Headers

Responses include rate limit info:
```javascript
{
  remaining: 4,      // Messages left in this window
  resetIn: 35000     // Milliseconds until limit resets
}
```

---

## Examples

### Using cURL

**Login and get JWT token**
```bash
# Register new user
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123"}' \
  http://localhost:5000/api/auth/register

# Or login with existing credentials
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}' \
  http://localhost:5000/api/auth/login

# Store the returned token
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Get current user
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/me

# Send message
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello!"}' \
  http://localhost:5000/api/chat/send

# Get chat history
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/chat/history?limit=10"
```

### Using JavaScript/Axios

```javascript
import axios from 'axios';

const API_URL = 'http://localhost:5000';
const token = localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Register new user
const registerResponse = await api.post('/api/auth/register', {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secure-password',
});
const token = registerResponse.data.token;
localStorage.setItem('token', token);

// Send message
const response = await api.post('/api/chat/send', {
  text: 'Hello!',
});

// Get history
const history = await api.get('/api/chat/history', {
  params: { limit: 50, skip: 0 },
});

// Update profile
const updated = await api.put('/api/auth/profile', {
  name: 'New Name',
});
```

---

## Rate Limiting Details

### Configuration
- **Window**: 60 seconds
- **Max Messages**: 5 per window per user
- **Response**: 429 Too Many Requests

### Anti-Ban Features

| Feature | Trigger | Action |
|---------|---------|--------|
| Duplicate Detection | 3+ same messages | Block 4th+ |
| Message Delay | Every response | 2-5 second delay |
| Velocity Check | 10+ messages/min | Trigger cooldown |
| Cooldown | After velocity check | 30 second block |

---

## Pagination

Chat history supports cursor-based pagination:
```javascript
// First 50 messages
GET /api/chat/history?limit=50&skip=0

// Next 50 messages
GET /api/chat/history?limit=50&skip=50

// Last 10 messages
GET /api/chat/history?limit=10&skip=990
```

---

## Response Times

- Auth endpoints: <50ms
- Chat endpoints: <100ms
- Message processing: 2-5 seconds (intentional)
- Rate limit check: <10ms

---

## Webhooks / Polling

Since WebSockets are not used, frontend polls for new messages:

```javascript
// Poll every 500ms for bot responses
const pollForResponse = setInterval(async () => {
  const history = await api.get('/api/chat/history?limit=10');
  // Check if new bot message exists
  // If yes, update UI and clear polling
}, 500);
```

---

**For more details, see [docs/LLD.md](../docs/LLD.md)**
