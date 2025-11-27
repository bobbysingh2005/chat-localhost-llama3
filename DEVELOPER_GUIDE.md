# Developer Guide: Chat Localhost Llama3

## 📚 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Development Workflow](#development-workflow)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Function Calling & Tools](#function-calling--tools)
8. [API Documentation](#api-documentation)
9. [Database Schema](#database-schema)
10. [Testing](#testing)
11. [Deployment](#deployment)
12. [Contributing](#contributing)

---

## 🏗️ Project Overview

### Tech Stack

**Backend:**
- **Runtime**: Node.js v22.21.1
- **Framework**: Fastify (TypeScript)
- **Database**: MongoDB
- **Authentication**: JWT (fastify-jwt) + bcrypt
- **LLM Integration**: Ollama (local)
- **Tools**: Axios for HTTP requests

**Frontend:**
- **Framework**: React 19.1.0
- **Build Tool**: Vite 7.2.4
- **Styling**: Bootstrap 5 + Custom CSS
- **Code Editor**: Monaco Editor
- **Markdown**: react-markdown with syntax highlighting

**Infrastructure:**
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Voice Services**: Kaldi (STT), Browser API (TTS/STT)
- **GPU**: AMD ROCm support for Ollama

---

## 🏛️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chat Interface  │  Voice Mode  │  Code Editor  │  UI  │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              │ HTTP/REST                     │
│                              ▼                               │
├─────────────────────────────────────────────────────────────┤
│                       Backend (Fastify)                      │
│  ┌─────────────────┬──────────────┬──────────────────────┐ │
│  │   Auth Routes   │ Chat Routes  │  Generate Routes     │ │
│  │   /auth/*       │  /api/chat   │  /api/generate       │ │
│  └─────────────────┴──────────────┴──────────────────────┘ │
│                              │                               │
│  ┌──────────────────────────┴──────────────────────────┐   │
│  │            Function Calling & Tools Layer           │   │
│  │  ┌─────────┬────────┬────────────┬────────────┐    │   │
│  │  │ Weather │  Time  │ Web Search │    News    │    │   │
│  │  └─────────┴────────┴────────────┴────────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                               │
├─────────────────────────────┼───────────────────────────────┤
│              ┌───────────────┴─────────────┐                │
│              │        MongoDB Database      │                │
│              │  ┌────────┬──────────────┐  │                │
│              │  │ Users  │ Conversations│  │                │
│              │  └────────┴──────────────┘  │                │
│              └─────────────────────────────┘                │
├──────────────────────────────────────────────────────────────┤
│                       Ollama (LLM Engine)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Models: llama3.2, mistral, phi, etc.                  │ │
│  │  Endpoints: /api/chat, /api/generate                   │ │
│  │  GPU: AMD ROCm                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Request Flow

**Chat Mode with Function Calling:**
```
User Input → Frontend
    ↓
    ├─ Detect geolocation
    ├─ Add to messages array
    └─ POST /api/chat
        ↓
Backend receives request
    ├─ Inject system message with location context
    ├─ Add tool definitions to payload
    └─ Send to Ollama /api/chat
        ↓
Ollama processes message
    ├─ Determines if tool needed
    └─ Returns tool_calls[]
        ↓
Backend executes tools
    ├─ getWeather(location)
    ├─ getCurrentTime(timezone)
    ├─ etc.
    └─ Add tool results to messages
        ↓
Send updated messages back to Ollama
    ↓
Ollama formats final response
    ↓
Backend returns to Frontend
    ↓
Frontend displays response
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 22.x
- MongoDB >= 5.x
- Docker & Docker Compose (optional)
- Ollama with models pulled
- AMD GPU with ROCm (optional, for GPU acceleration)

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/bobbysingh2005/chat-localhost-llama3.git
cd chat-localhost-llama3
```

2. **Install Dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. **Configure Environment Variables**

**Backend `.env`** (`backend/.env`):
```env
NODE_ENV=development
PORT=3300
MONGO_URL=mongodb://localhost:27017/chatApp
OLLAMA_HOST=http://localhost:11434
SECRET_KEY=your-secret-key-here

ADMIN_USER=admin
ADMIN_PASSWORD=Admin@123
ADMIN_EMAIL=your-email@example.com

ALLOWED_ORIGINS=http://localhost:3301,http://localhost:8080,http://localhost:5173

# Optional API Keys for Tools
OPENWEATHER_API_KEY=your-openweather-key
NEWS_API_KEY=your-newsapi-key
```

**Frontend `.env`** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3300
```

4. **Start Services**

**Option A: Using Docker Compose**
```bash
docker-compose up -d
```

**Option B: Manual Start**
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Ollama
ollama serve

# Terminal 3: Start Backend
cd backend
npm run dev

# Terminal 4: Start Frontend
cd frontend
npm run dev
```

5. **Access Application**
- Frontend: http://localhost:3301
- Backend API: http://localhost:3300
- MongoDB: localhost:27017

---

## 🔧 Development Workflow

### Backend Development

**File Structure:**
```
backend/
├── src/
│   ├── app.ts                 # Fastify app setup
│   ├── index.ts               # Entry point
│   ├── config/
│   │   ├── index.ts           # Configuration loader
│   │   └── db.ts              # MongoDB connection
│   ├── models/
│   │   ├── user.ts            # User schema
│   │   └── conversation.ts    # Conversation schema
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── chat.ts            # Chat mode endpoint
│   │   ├── generate.ts        # Generate mode endpoint
│   │   ├── conversations.ts   # Conversation management
│   │   └── tags.ts            # Tag management
│   └── tools/
│       ├── index.ts           # Tool registry & executor
│       ├── weather.ts         # Weather tool
│       ├── time.ts            # Time tool
│       ├── news.ts            # News tool
│       └── web-search.ts      # Web search tool
├── package.json
├── tsconfig.json
└── .env
```

**Running Backend:**
```bash
cd backend
npm run dev          # Development with nodemon
npm run build        # Compile TypeScript
npm start            # Production
```

**Adding New Routes:**
```typescript
// backend/src/routes/my-route.ts
import { FastifyInstance } from 'fastify';

export async function myRoutes(fastify: FastifyInstance) {
  fastify.get('/api/my-endpoint', async (req, reply) => {
    return { success: true, data: 'Hello' };
  });
}

// Register in app.ts
import { myRoutes } from './routes/my-route';
fastify.register(myRoutes);
```

---

### Frontend Development

**File Structure:**
```
frontend/
├── src/
│   ├── main.jsx               # Entry point
│   ├── App.jsx                # Root component
│   ├── index.css              # Global styles
│   ├── components/
│   │   ├── loader.jsx         # Loading spinner
│   │   ├── STTButton.jsx      # Speech-to-text button
│   │   ├── MonacoEditorWrapper.jsx  # Code editor
│   │   └── app-status.jsx     # API status indicator
│   └── views/
│       ├── App-setting.jsx    # Context provider
│       ├── main-header.jsx    # Header with controls
│       ├── chat-app.jsx       # Main chat interface
│       ├── login.jsx          # Login page
│       └── register.jsx       # Register page
├── public/
│   └── sounds/                # Sound effects
├── package.json
├── vite.config.js
└── .env
```

**Running Frontend:**
```bash
cd frontend
npm run dev          # Development server (port 3301)
npm run build        # Production build
npm run preview      # Preview production build
```

**Adding New Components:**
```jsx
// frontend/src/components/MyComponent.jsx
import { useState } from 'react';

export default function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState('');
  
  return (
    <div>
      <h1>{prop1}</h1>
      <p>{prop2}</p>
    </div>
  );
}

// Use in chat-app.jsx
import MyComponent from '../components/MyComponent';
<MyComponent prop1="Hello" prop2="World" />
```

---

## 🔧 Function Calling & Tools

### How Function Calling Works

The system uses Ollama's built-in function calling capability to enable the AI to use external tools.

### Tool Architecture

**1. Tool Definition** (`backend/src/tools/index.ts`):
```typescript
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  execute: (params: any) => Promise<any>;
}
```

**2. Tool Registration**:
```typescript
export const tools: Tool[] = [
  {
    name: 'getWeather',
    description: 'Get current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name',
        },
      },
      required: ['location'],
    },
    execute: getWeather,
  },
];
```

**3. Tool Execution Flow**:
```typescript
// In chat.ts
const tools = getToolDefinitions();

// Send to Ollama with tools
const payload = {
  model: 'llama3.2',
  messages: [...messages],
  tools,  // Tool definitions
};

// If AI returns tool_calls
if (assistantMessage?.tool_calls) {
  for (const toolCall of assistantMessage.tool_calls) {
    const result = await executeTool(
      toolCall.function.name,
      JSON.parse(toolCall.function.arguments)
    );
    
    // Add result back to conversation
    messages.push({
      role: 'tool',
      content: JSON.stringify(result),
    });
  }
}
```

### Adding a New Tool

**Step 1: Create Tool File** (`backend/src/tools/my-tool.ts`):
```typescript
interface MyToolParams {
  param1: string;
  param2?: number;
}

export async function myTool(params: MyToolParams) {
  const { param1, param2 } = params;
  
  // Your tool logic here
  const result = await doSomething(param1, param2);
  
  return {
    success: true,
    data: result,
  };
}
```

**Step 2: Register Tool** (`backend/src/tools/index.ts`):
```typescript
import { myTool } from './my-tool';

export const tools: Tool[] = [
  // ... existing tools
  {
    name: 'myTool',
    description: 'What this tool does',
    parameters: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: 'Description of param1',
        },
        param2: {
          type: 'number',
          description: 'Description of param2',
        },
      },
      required: ['param1'],
    },
    execute: myTool,
  },
];
```

**Step 3: Test Tool**:
```bash
# Start backend
cd backend && npm run dev

# Ask in chat: "Can you use myTool with param1=test?"
```

### Built-in Tools

#### 1. Weather Tool
```typescript
// Location: backend/src/tools/weather.ts
getWeather({ location: 'Tokyo' })
// Returns: temperature, conditions, humidity, wind speed
```

#### 2. Time Tool
```typescript
// Location: backend/src/tools/time.ts
getCurrentTime({ timezone: 'America/New_York' })
// Returns: date, time, day of week, timezone
```

#### 3. News Tool
```typescript
// Location: backend/src/tools/news.ts
getNews({ category: 'technology', country: 'us' })
// Returns: latest news articles
```

#### 4. Web Search Tool (Placeholder)
```typescript
// Location: backend/src/tools/web-search.ts
searchWeb({ query: 'AI advancements 2025' })
// TODO: Integrate with search API
```

---

## 📡 API Documentation

### Authentication Endpoints

**POST `/auth/register`**
```json
Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "message": "User registered successfully",
  "user": { "id": "...", "username": "...", "email": "..." }
}
```

**POST `/auth/login`**
```json
Request:
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "token": "jwt-token-here",
  "user": { "id": "...", "username": "...", "email": "..." }
}
```

### Chat Endpoints

**POST `/api/chat`** (Conversational Mode)
```json
Request:
{
  "model": "llama3.2",
  "messages": [
    { "role": "system", "content": "You are a helpful assistant" },
    { "role": "user", "content": "What's the weather?" }
  ],
  "stream": false,
  "temperature": 0.3,
  "max_tokens": 500,
  "userLocation": {
    "city": "San Francisco",
    "country": "USA",
    "latitude": 37.7749,
    "longitude": -122.4194
  }
}

Response:
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "The weather in San Francisco is..."
  },
  "toolsUsed": true
}
```

**POST `/api/generate`** (Long-form Mode)
```json
Request:
{
  "model": "llama3.2",
  "prompt": "Write a Python function to sort a list",
  "stream": false,
  "temperature": 0.6,
  "max_tokens": 2000,
  "system": "You are an expert programmer"
}

Response:
{
  "success": true,
  "response": "Here's a Python function...",
  "context": [...]
}
```

### Conversation Endpoints

**GET `/conversations`**
- Requires authentication
- Returns list of user's conversations

**GET `/conversations/:id`**
- Requires authentication
- Returns specific conversation with messages

**POST `/conversations`**
- Requires authentication
- Creates new conversation

**DELETE `/conversations/:id`**
- Requires authentication
- Deletes conversation

---

## 🗄️ Database Schema

### User Model
```typescript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed with bcrypt
  createdAt: { type: Date, default: Date.now },
}
```

### Conversation Model
```typescript
{
  user: { type: ObjectId, ref: 'User', required: true },
  title: { type: String, default: 'New Chat' },
  messages: [
    {
      sender: { type: String, enum: ['user', 'assistant'] },
      text: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }
  ],
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}
```

---

## 🧪 Testing

### Manual Testing

**Test Chat Mode:**
```bash
# Start backend and frontend
# Navigate to http://localhost:3301
# Send message: "What's the weather?"
# Verify: Tool executed, response contains weather data
```

**Test Generate Mode:**
```bash
# Switch to Generate mode
# Send: "Write a Python function to calculate fibonacci"
# Verify: Longer response, code block with syntax highlighting
```

**Test Voice Mode:**
```bash
# Click "Voice Off" to enable
# Speak: "Hello AI"
# Verify: Speech converted to text, sent, response read aloud
```

### API Testing

**Using curl:**
```bash
# Test chat endpoint
curl -X POST http://localhost:3300/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2",
    "messages": [{"role": "user", "content": "Hello"}],
    "temperature": 0.3,
    "max_tokens": 500
  }'
```

---

## 🚀 Deployment

### Production Build

**Backend:**
```bash
cd backend
npm run build        # Compiles to dist/
npm start            # Runs from dist/
```

**Frontend:**
```bash
cd frontend
npm run build        # Creates dist/ folder
# Serve with Nginx or static hosting
```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# Check logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3300
MONGO_URL=mongodb://mongo:27017/chatApp
OLLAMA_HOST=http://ollama:11434
SECRET_KEY=<strong-random-secret>
ALLOWED_ORIGINS=https://yourdomain.com
```

---

## 🤝 Contributing

### Code Style
- Use TypeScript for backend
- Follow ESLint rules
- Use Prettier for formatting
- Write meaningful commit messages

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes
git add .
git commit -m "feat: add my feature"

# Push and create PR
git push origin feature/my-feature
```

### Pull Request Guidelines
1. Describe your changes clearly
2. Include screenshots for UI changes
3. Test thoroughly before submitting
4. Update documentation if needed

---

## 📝 Additional Resources

- **Ollama Docs**: https://ollama.ai/docs
- **Fastify Docs**: https://www.fastify.io/docs/latest/
- **React Docs**: https://react.dev/
- **MongoDB Docs**: https://docs.mongodb.com/

---

## 🆕 Architecture & New Features

### Tool System
- All tools (weather, news, time, location, math, finance, reminders, HTTP) are implemented in `backend/src/tools/tools.ts`.
- Universal/local support: Tools auto-select sources based on context.
- Heavy tools run in child processes (`tools-runner.ts`, `tools-child.js`).
- Fastify route `/api/tool` exposes all tools for function calling.

### Environment Validation
- All API keys and secrets are managed in `.env` and `.env.example`.
- Environment variables are strictly validated in `backend/src/config/index.ts` using `env-schema`.
- The config object is used throughout the backend for environment access.

### Adding New Tools
- Add tool logic to `tools.ts`.
- Register tool in Fastify route and update types as needed.
- Add new environment variables to `.env.example` with comments and example values.
- Validate new variables in `config/index.ts`.

### Dependency Management
- Use `yarn install --frozen-lockfile` for reproducible builds.
- Check outdated packages with `yarn outdated`.
- All dependencies are frozen for stability.

### Troubleshooting
- For Windows file lock errors, delete `node_modules`, `yarn.lock`, and `package-lock.json`, then restart and run install again.
- If environment validation fails, check `.env` for missing or invalid values.

---

**Happy Coding! 🚀**
