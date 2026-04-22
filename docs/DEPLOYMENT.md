# Deployment Guide

Deploy your chatbot to production with this guide.

---

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB Atlas account created
- [ ] Redis Cloud account created
- [ ] Backend tested locally
- [ ] Frontend tested locally
- [ ] All tests passing
- [ ] Code reviewed and committed

---

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Recommended** for ease of use.

#### Backend Deployment (Railway)

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up / Sign in
   - Create new project

2. **Add Services**
   - Add MongoDB service
   - Add Redis service
   - Add Node.js application

3. **Configure Environment**
   - Go to Variables tab
   - Add all variables from `.env`:
     ```
     MONGO_URI=...
     REDIS_URL=...
     JWT_SECRET=...
     PORT=5000
     NODE_ENV=production
     ```

4. **Connect GitHub**
   - Connect your repository
   - Select `backend` directory as root
   - Deploy on push

5. **Start Services**
   - Click "Deploy"
   - Monitor logs
   - Get backend URL

#### Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up / Sign in

2. **Import Project**
   - Click "Import Git Repository"
   - Select your repo
   - Select `frontend` as root directory

3. **Configure Environment**
   - Add environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend.railway.app
     ```

4. **Deploy**
   - Click "Deploy"
   - Monitor build
   - Get frontend URL

---

### Option 2: Heroku (Backend) + Netlify (Frontend)

#### Backend (Heroku)

```bash
# 1. Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# 2. Login
heroku login

# 3. Create app
heroku create your-app-name

# 4. Add MongoDB & Redis
heroku addons:create mongolab:sandbox
heroku addons:create heroku-redis:premium-0

# 5. Set environment variables
heroku config:set FIREBASE_PROJECT_ID=your-id
heroku config:set FIREBASE_PRIVATE_KEY=your-key
# ... add all variables

# 6. Deploy
git push heroku main

# 7. Monitor
heroku logs --tail
```

#### Frontend (Netlify)

```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Deploy
netlify deploy --prod --dir=.next

# Or connect GitHub:
# - Go to netlify.com
# - Connect repository
# - Set build command: npm run build
# - Set publish directory: .next
```

---

### Option 3: Google Cloud Platform

#### Cloud Run (Backend)

```bash
# 1. Deploy to Cloud Run
gcloud run deploy chatbot-backend \
  --source . \
  --region us-central1 \
  --set-env-vars MONGO_URI=...,REDIS_URL=...,JWT_SECRET=...

# 3. Get URL
gcloud run services list
```

#### Firebase Hosting (Frontend)

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize
firebase init hosting

# 4. Build and deploy
npm run build
firebase deploy
```

---

## 🔧 Environment Setup

### Backend Production Variables

```env
# Production
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/chatbot
REDIS_URL=redis://default:password@host:port

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-service-account-email

# Server
PORT=5000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_MESSAGES=5

# Anti-Ban
ANTI_BAN_DELAY_MIN=2000
ANTI_BAN_DELAY_MAX=5000
ANTI_BAN_MESSAGE_THRESHOLD=10
ANTI_BAN_COOLDOWN_DURATION=30000
```

### Frontend Production Variables

```env
# Backend
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

---

## 🚀 Post-Deployment

### Verify Deployment

```bash
# Test health endpoint
curl https://your-backend-domain.com/health

# Test API
curl -X POST https://your-backend-domain.com/api/auth/verify \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test frontend
Visit https://your-frontend-domain.com
Login with Google
Send test message
```

### Monitoring

#### Backend Logs
- **Railway**: Logs tab in dashboard
- **Heroku**: `heroku logs --tail`
- **AWS**: CloudWatch Logs
- **GCP**: Cloud Logging

#### Metrics to Monitor
```
- Request latency (avg, p95, p99)
- Error rate (4xx, 5xx)
- Database connection pool
- Redis memory usage
- Queue depth
- Active workers
- User sessions
```

### Alerting Setup

#### Datadog
```python
# Send metrics
import datadog
datadog.initialize(api_key="your-key", app_key="your-app-key")

datadog.api.Metric.send(
  metric="chatbot.messages_sent",
  points=1,
  tags=["env:production"]
)
```

#### New Relic
```javascript
// Automatic monitoring for Node.js
// Just add license key to environment
```

---

## 🔒 Security Checklist

- [ ] HTTPS/SSL enabled
- [ ] Firebase security rules configured
- [ ] MongoDB IP whitelist set
- [ ] Redis password configured
- [ ] Environment variables not exposed
- [ ] CORS properly configured
- [ ] Rate limits enabled
- [ ] Error messages don't leak sensitive data
- [ ] Database backups configured
- [ ] Monitoring alerts set

---

## 📈 Performance Optimization

### Frontend
```javascript
// Enable caching
Cache-Control: public, max-age=3600

// Use CDN
Cloudflare, AWS CloudFront

// Image optimization
Next.js Image component
```

### Backend
```javascript
// Database indexing
db.messages.createIndex({ userId: 1, timestamp: -1 })

// Connection pooling
MongoDB: 50-100 connections
Redis: 10-20 connections

// Rate limiting
Redis-based (production-ready)

// Compression
Enable gzip compression
```

---

## 🚨 Troubleshooting Production

### Backend Connection Issues
```bash
# Check MongoDB Atlas
- Verify IP whitelist includes your server
- Check connection string
- Verify credentials

# Check Redis
- Verify endpoint
- Check password
- Verify port
```

### Frontend Showing Blank
```bash
# Check Next.js build
npm run build
# Fix any build errors

# Check environment variables
echo $NEXT_PUBLIC_API_URL
# Should output correct backend URL

# Check CORS
# Verify backend allows frontend domain
```

### Rate Limiting Not Working
```bash
# Check Redis connection
redis-cli ping
# Should return PONG

# Check env variables
cat .env | grep RATE_LIMIT
```

---

## 📊 Scalability

### Horizontal Scaling
```
Load Balancer
    ├─ Backend 1
    ├─ Backend 2
    └─ Backend N
        ↓
    MongoDB Replica Set
    Redis Cluster
```

### Steps for Production Scale
1. Switch to managed MongoDB (Atlas)
2. Switch to Redis Cluster (Redis Cloud)
3. Add load balancer (nginx, HAProxy)
4. Run multiple backend instances
5. Enable auto-scaling
6. Set up monitoring/alerting

---

## 💰 Cost Estimates (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **MongoDB Atlas** | 512MB | $57+ |
| **Redis Cloud** | Free | $10+/month |
| **Vercel Frontend** | Free | Pay as you go |
| **Railway/Heroku** | Free | $5-100+/month |
| **Firebase Auth** | 50K sign-ups | Free after |
| **CDN** | - | $20-100+/month |
| **Total** | Free | $100-300+/month |

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Backend)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install & Test
        run: |
          cd backend
          npm install
          npm run lint
      
      - name: Deploy to Railway
        run: |
          npm install -g @railway/cli
          railway link ${{ secrets.RAILWAY_PROJECT_ID }}
          railway deploy
```

---

## 📚 Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [Heroku Docs](https://devcenter.heroku.com)
- [AWS Docs](https://docs.aws.amazon.com)
- [GCP Docs](https://cloud.google.com/docs)
- [MongoDB Atlas](https://docs.atlas.mongodb.com)
- [Redis Cloud](https://docs.redis.com/latest/cloud)

---

**Ready to go live! 🚀**
