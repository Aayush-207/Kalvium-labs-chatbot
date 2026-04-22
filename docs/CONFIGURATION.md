# Configuration Guide

This guide explains how to customize the chatbot for your needs.

---

## 🤖 Chatbot Responses

### Add New Commands

Edit: `backend/src/services/chatbotService.js`

```javascript
const chatbotResponses = {
  "hello": "Hello! How can I help you?",
  "hi": "Hello! How can I help you?",
  "price": "Our pricing starts at $10/month",
  "pricing": "Our pricing starts at $10/month",
  "help": "How can I assist you today?",
  "thanks": "You are welcome! Feel free to ask anything else.",
  "thank": "You are welcome! Feel free to ask anything else.",
  
  // ADD YOUR COMMANDS HERE
  "support": "We have 24/7 customer support available.",
  "hours": "We're open 24/7",
  "faq": "Visit our FAQ at example.com/faq",
};
```

### Command Matching

Commands are matched case-insensitively and work with partial text:
```
User: "HI THERE"     → Matches "hi"
User: "What's help?" → Matches "help"
User: "Thanks!"      → Matches "thanks"
```

### Change Default Response

```javascript
// Current default
"I'm not sure, but our team will contact you soon."

// Modify in generateBotResponse() function
return "Custom default message";
```

---

## 🚦 Rate Limiting

### Change Limits

Edit: `backend/.env`

```env
# Current: 5 messages per 60 seconds
RATE_LIMIT_WINDOW_MS=60000        # Window duration (milliseconds)
RATE_LIMIT_MAX_MESSAGES=5         # Max messages per window

# Examples:
# 3 messages per 30 seconds:
RATE_LIMIT_WINDOW_MS=30000
RATE_LIMIT_MAX_MESSAGES=3

# 10 messages per 2 minutes:
RATE_LIMIT_WINDOW_MS=120000
RATE_LIMIT_MAX_MESSAGES=10

# Unlimited (not recommended):
RATE_LIMIT_MAX_MESSAGES=999999
```

### Impact
- **Stricter limits**: Better ban prevention, but frustrates users
- **Looser limits**: Better UX, but higher ban risk
- **Recommended**: 3-5 messages per minute

---

## ⏱️ Anti-Ban Settings

### Message Delays

Edit: `backend/.env`

```env
# Current: 2-5 seconds random delay
ANTI_BAN_DELAY_MIN=2000          # Minimum delay (milliseconds)
ANTI_BAN_DELAY_MAX=5000          # Maximum delay (milliseconds)

# Examples:
# Instant response (not recommended):
ANTI_BAN_DELAY_MIN=0
ANTI_BAN_DELAY_MAX=100

# Longer delays (more realistic):
ANTI_BAN_DELAY_MIN=3000
ANTI_BAN_DELAY_MAX=10000

# Very realistic (WhatsApp-like):
ANTI_BAN_DELAY_MIN=1000
ANTI_BAN_DELAY_MAX=15000
```

### Duplicate Detection

Edit: `backend/.env`

```env
# Current: Block on 3rd duplicate
ANTI_BAN_DUPLICATE_THRESHOLD=3    # Number of duplicates before block

# Examples:
# Strict: Block on 2nd duplicate
ANTI_BAN_DUPLICATE_THRESHOLD=2

# Lenient: Allow up to 5 duplicates
ANTI_BAN_DUPLICATE_THRESHOLD=5

# Disable: Allow unlimited
ANTI_BAN_DUPLICATE_THRESHOLD=999
```

### Velocity Tracking

Edit: `backend/.env`

```env
# Current: Cooldown after 10+ messages in 60 seconds
ANTI_BAN_MESSAGE_THRESHOLD=10     # Messages before cooldown
ANTI_BAN_COOLDOWN_DURATION=30000  # Cooldown duration (milliseconds)

# Examples:
# Aggressive protection: 5 messages, 60s cooldown
ANTI_BAN_MESSAGE_THRESHOLD=5
ANTI_BAN_COOLDOWN_DURATION=60000

# Lenient: 20 messages, 10s cooldown
ANTI_BAN_MESSAGE_THRESHOLD=20
ANTI_BAN_COOLDOWN_DURATION=10000
```

---

## 🎨 Frontend Customization

### Change Colors

Edit: `frontend/tailwind.config.js`

```javascript
theme: {
  extend: {
    colors: {
      primary: '#007AFF',      // Blue
      secondary: '#5AC8FA',    // Light blue
      
      // Add custom colors:
      brand: {
        dark: '#0A1428',
        light: '#E7F1FF',
      }
    },
  },
},
```

Then use in components:
```jsx
<button className="bg-brand-dark text-brand-light">
  Send
</button>
```

### Change Chat Bubble Colors

Edit: `frontend/src/components/ChatWindow.js`

```javascript
// User message (currently blue)
className="bg-blue-500 text-white"

// Bot message (currently gray)
className="bg-gray-200 text-gray-800"

// Change to your colors:
className="bg-green-500 text-white"    // Green for user
className="bg-orange-100 text-orange-900"  // Orange for bot
```

### Change UI Text

Search and replace text in components:
```javascript
// In LoginForm.js
"Sign in with Google" → Your text
"Get instant help from our support team" → Your text

// In ChatWindow.js
"Customer Support" → Your brand name
"Type your message..." → Your placeholder
```

---

## 📱 Customize Chat UI

### Message Display Format

Edit: `frontend/src/components/ChatWindow.js`

```javascript
// Show user name with message
<p className="text-xs font-semibold">{message.user?.name}</p>

// Show read receipts
{message.status === 'sent' && '✓'}
{message.status === 'failed' && '✗'}

// Add emoji reactions
<div className="flex space-x-2">
  👍 😂 ❤️ 😢
</div>
```

### Add Features

**Typing Indicator Position:**
```javascript
// Currently shows during message processing
// Change timing to match your logic
```

**Message Timestamps:**
```javascript
// Show full timestamp
new Date(message.timestamp).toLocaleString()

// Show relative time
"5 minutes ago"
```

**Read Receipts:**
```javascript
// Add seen/unseen status
message.read ? '✓✓' : '✓'
```

---

## 🔐 Security Settings

### JWT Authentication

Edit: `backend/.env`

```env
# Secret key for JWT token generation
# Use a strong random string for production
JWT_SECRET=your-super-secret-key-min-32-chars

# Token expiration (set in authController.js)
# Default: 7 days (expiresIn: '7d')
```

### API Keys & Secrets

Best practices:
- Never commit `.env` files
- Use different secrets for dev/production
- Rotate secrets regularly
- Use strong random strings (min 32 characters)


### CORS Settings

Edit: `backend/src/server.js`

```javascript
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend URL
  credentials: true,
}));

// For production:
app.use(cors({
  origin: process.env.FRONTEND_URL,  // Set in .env
  credentials: true,
}));
```

---

## 📊 Logging & Monitoring

### Enable Verbose Logging

Edit: `backend/.env`

```env
NODE_ENV=development    # Shows all logs
# NODE_ENV=production   # Shows only errors
```

### Custom Logging

Edit: `backend/src/services/antiBanService.js`

```javascript
export const logMessageAction = (userId, action, details = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] User ${userId}: ${action}`, details);
  
  // Send to monitoring service (optional):
  // sendToCloudWatch({ userId, action, details });
  // sendToDatadog({ event: action, tags: { user: userId } });
};
```

---

## 🗄️ Database Configuration

### MongoDB Connection

Edit: `backend/.env`

```env
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/chatbot

# MongoDB Atlas (Cloud)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true
```

### Redis Connection

Edit: `backend/.env`

```env
# Local Redis
REDIS_URL=redis://localhost:6379

# Redis Cloud
REDIS_URL=redis://default:password@host:port
```

---

## 👥 User Management

### Customize User Fields

Edit: `backend/src/models/User.js`

```javascript
const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    
    // Add custom fields:
    phone: String,
    companyName: String,
    role: { type: String, enum: ['user', 'admin'] },
    subscriptionPlan: String,
    preferences: {
      notificationsEnabled: Boolean,
      darkMode: Boolean,
    }
  }
);
```

### Update Frontend to Display

Edit: `frontend/src/app/chat/page.js`

```javascript
<div className="bg-white shadow rounded-lg px-4 py-2">
  <span className="text-sm text-gray-700">{user.name}</span>
  {user.phone && <span className="text-xs text-gray-500">{user.phone}</span>}
  <button>Settings</button>
</div>
```

---

## 🚀 Performance Tuning

### Queue Concurrency

Edit: `backend/src/workers/messageWorker.js`

```javascript
const messageWorker = new Worker('message-processing', handler, {
  connection: redisClient,
  concurrency: 5,  // Change this
});

// Examples:
// concurrency: 1    → Process one at a time (slow)
// concurrency: 5    → Current (balanced)
// concurrency: 20   → Process many in parallel (fast, high resource)
```

### Database Indexes

Add indexes in `backend/src/models/User.js` and `Message.js`:

```javascript
// Optimize frequently searched fields
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

messageSchema.index({ userId: 1, timestamp: -1 });
```

---

## 🧪 Testing Configuration

### Change Test Parameters

Create `backend/test.env`:

```env
# Override for testing
RATE_LIMIT_MAX_MESSAGES=100    # Allow more for testing
ANTI_BAN_DELAY_MIN=100         # Faster for tests
ANTI_BAN_DELAY_MAX=200
```

---

## Summary of Common Customizations

| Customization | File | Key Variable |
|---------------|------|--------------|
| Chatbot responses | `chatbotService.js` | `chatbotResponses` |
| Rate limit | `.env` | `RATE_LIMIT_MAX_MESSAGES` |
| Response delay | `.env` | `ANTI_BAN_DELAY_MIN/MAX` |
| Colors | `tailwind.config.js` | `theme.colors` |
| UI text | Component `.js` files | String literals |
| Database | `.env` | `MONGO_URI`, `REDIS_URL` |
| JWT Auth | `.env` | `JWT_SECRET` |

---

## 🆘 Need Help?

- Check [README.md](../README.md) for overview
- See [docs/LLD.md](../docs/LLD.md) for architecture
- Review [docs/API_REFERENCE.md](./API_REFERENCE.md) for API details
- Check component comments in code

---

**Happy customizing! 🎉**
