AI Agent Instruction File
=========================

PROJECT: Local AI Chat App with Authentication and MCP

DESCRIPTION:
-------------
This is a secure local AI chat application. It allows users to log in first. After login success, it enables two modes:
1. REST API mode: sends direct requests to Ollama on http://localhost:11434
2. MCP mode: uses Model Connection Protocol to connect with AI model like DeepSeek, LLaMA 3, etc.

PROJECT STRUCTURE:
------------------
ai-chat-agent/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── auth.js
│   │   └── chatRest.js     ← Direct Ollama REST chat
│   │   └── chatMcp.js      ← MCP-based communication
│   └── middleware/
│       └── auth.js
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── Login.jsx
│   │   │   └── Chat.jsx
│   │   ├── components/
│   │   │   └── ChatBox.jsx
│   │   └── api.js
├── mcp/
│   └── mcp-agent.js         ← MCP server (Node.js based)
└── .env (for backend)
└── README.txt (this file)

SETUP INSTRUCTIONS:
===================

STEP 1: REQUIREMENTS
--------------------
- Node.js version 18 or higher
- Ollama installed and running locally
- At least one model pulled using:
  ollama pull llama3
- Port 11434 must be open (default for Ollama)

STEP 2: BACKEND SETUP
---------------------
1. Navigate to backend folder
2. Run: npm install
3. Create a `.env` file with the following content:

PORT=3000
JWT_SECRET=yourSecretKey

4. Start backend:
   node server.js

This will run login, register, and chat endpoints

STEP 3: FRONTEND SETUP
----------------------
1. Navigate to frontend folder
2. Run: npm install
3. Create a `.env` file with:

VITE_API_URL=http://localhost:3000

4. Start frontend:
   npm run dev

Frontend runs at: http://localhost:5173

STEP 4: OLLAMA SETUP
--------------------
1. Run the Ollama server:
   ollama serve
2. Ensure at least one model is pulled:
   ollama pull llama3

STEP 5: MCP AGENT SETUP
------------------------
1. Go to mcp/ folder
2. Run: npm install
3. Start MCP agent:
   node mcp-agent.js

The MCP agent should accept JSON messages and send chat messages to Ollama's REST API internally.

USAGE FLOW:
===========
1. User visits frontend and logs in
2. JWT or cookie is set
3. User is redirected to /chat
4. Chat interface lets user send messages
5. Based on setting:
   - If REST mode is on → messages go to /chat-rest → Ollama
   - If MCP mode is on → messages go to /chat-mcp → local MCP handler

6. Responses are streamed or returned to frontend
7. UI shows both input and output clearly

SECURITY NOTES:
===============
- Login is required before chat
- JWT is verified in middleware
- CORS is allowed for frontend port only
- No database is used (for demo)
- Use HTTPS and strong secrets in production

ACCESSIBILITY NOTES:
====================
- All fields have text labels
- No mouse required, all keyboard shortcuts supported
- Screen reader-friendly using semantic HTML
- No animations or visual-only cues

API ENDPOINTS:
==============
POST /auth/login        → Login with email and password
POST /auth/register     → Register new user
POST /chat-rest         → Send prompt to Ollama (REST)
POST /chat-mcp          → Send prompt to MCP server

DEPENDENCIES:
=============
- Backend uses Express, JWT, dotenv
- MCP agent uses Node.js with fetch or axios
- Frontend uses React with simple form components

SUGGESTIONS:
============
- For real projects, use MongoDB or PostgreSQL for user storage
- Add rate limiting and logging
- Add chat history saving per user

END OF INSTRUCTION FILE
