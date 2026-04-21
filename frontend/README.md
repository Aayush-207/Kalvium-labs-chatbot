# Frontend README

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in your Firebase config:
```bash
cp .env.example .env.local
```

Get your Firebase config from [Firebase Console](https://console.firebase.google.com/):
1. Go to Project Settings
2. Copy web SDK configuration
3. Fill in `.env.local`

### 3. Start Development Server
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Build for Production
```bash
npm run build
npm start
```

## Features

✓ Google Sign-In with Firebase
✓ Real-time chat UI
✓ Auto-scrolling messages
✓ Typing indicator for bot
✓ Rate limit status display
✓ Toast notifications
✓ Loading states
✓ Polling for bot responses
✓ Responsive design

## Pages

- `/login` - Google authentication page
- `/chat` - Chat interface (protected route)

## Components

- `LoginForm` - Google sign-in form
- `ChatWindow` - Main chat interface
- `Toast` - Notification component

## Architecture

### Services
- **firebase**: Firebase authentication setup
- **api**: Axios instance with auth interceptors
- **chatService**: Chat API calls

### Context
- **AuthContext**: Global authentication state

## Error Handling

- 401 Unauthorized → Redirect to login
- 429 Rate Limited → Show retry timer
- Network errors → Toast notification
- Timeout → Show warning

## Polling Strategy

After sending a message:
1. Shows typing indicator
2. Polls for bot response every 500ms
3. Times out after 30 seconds
4. Shows success toast when response arrives
