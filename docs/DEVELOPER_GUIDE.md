# Developer Guide: Chat Localhost Llama3

## 📚 Table of Contents
1. Project Overview
2. Architecture
3. Setup & Installation
4. Development Workflow
5. Backend Development
6. Frontend Development
7. Function Calling & Tools
8. API Documentation
9. Database Schema
10. Testing
11. Deployment
12. Contributing

---

## 🏗️ Project Overview

### Tech Stack
- Backend: Node.js, Fastify (TypeScript), MongoDB, JWT, Ollama, Axios
- Frontend: React, Vite, Bootstrap, Monaco Editor
- Infrastructure: Docker, Nginx, Voice Services, GPU (ROCm)

---

## 🏛️ Architecture

- Fastify backend exposes endpoints for chat, generate, search, scrape, news, and tool calls
- Ollama LLM integration for AI responses and function calling
- Tools layer for weather, time, news, search, scrape, etc.
- MongoDB for user and conversation storage
- Frontend React app for chat UI, voice, and code editing

---

## 🛠️ Setup & Installation

1. Clone repository and install dependencies
2. Configure `.env` files for backend and frontend
3. Start services (Docker or manual)
4. Pull Ollama models

---

## 🔧 Development Workflow

- Backend: `npm run dev`, `npm run build`, `npm start`
- Frontend: `npm run dev`, `npm run build`, `npm run preview`
- Add new routes/tools in `backend/src/routes` and `backend/src/tools`

---

## Backend Endpoints

- `/api/chat` - Conversational chat (function calling)
- `/api/generate` - Long-form generation
- `/api/search` - Web search (tool)
- `/api/scrape` - Web scraping (tool)
- `/api/news` - News headlines (tool)
- `/api/tool` - Universal tool calls

---

## Function Calling & Tools

- Tools are defined in `backend/src/tools` and registered for AI function calling
- Each tool has a name, description, parameters, and execute function
- Tools: getWeather, getCurrentTime, getNews, searchWeb, scrapeWebsite, etc.
- Add new tools by creating a file, exporting the function, and registering in the tool index

---

## API Documentation

### `/api/news` (GET)
- Query: `category`, `country` (optional)
- Response: `{ success, category, country, articles: [{ title, description, url, source, publishedAt }], totalResults }`

### `/api/search` (GET)
- Query: `q` (search term)
- Response: `{ results: [{ title, url, snippet, source }] }`

### `/api/scrape` (GET)
- Query: `url` (webpage URL)
- Response: `{ title, description, headings, text }`

### `/api/chat` (POST)
- Conversational chat with function calling

### `/api/generate` (POST)
- Long-form creative generation

### `/api/tool` (POST)
- Universal tool calls for AI function calling

---

## Database Schema
- User: username, email, password, createdAt
- Conversation: user, title, messages, tags, createdAt, updatedAt

---

## Testing
- Manual: Test endpoints via frontend and curl
- Automated: `npm test` in backend/frontend

---

## Deployment
- Docker Compose for full stack
- Manual start for individual services

---

## Contributing
- Fork, branch, commit, PR
- Follow code style and update docs for new features

---

## Adding New Features
- Add new tools in `backend/src/tools`
- Register new endpoints in `backend/src/routes`
- Update environment variables and documentation

---

**See USER_GUIDE.md for user instructions.**
