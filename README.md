## Code Quality & Standards

This project enforces high code quality and maintainability:
- All code is linted and auto-formatted using ESLint and Prettier (frontend: JavaScript/React, backend: TypeScript)
- TypeScript is used for backend for type safety and clarity
- All methods and variables are documented with meaningful comments
- No unused variables or functions are allowed in production code
- Prop types are enforced in React components
- Code is reviewed for readability, maintainability, and accessibility

To check or fix code style, run:
```bash
# Frontend
cd frontend
npx eslint src/**/*.jsx --fix
npx prettier --write .

# Backend
cd backend
npx eslint src/**/*.ts --fix
npx prettier --write .
```

Contributions must follow these standards for acceptance.
# Chat Localhost Llama3


Modern, accessible, and secure self-hosted chat application using Ollama for LLM inference, Fastify backend, and React frontend.

## Features
- Secure login/register with JWT authentication (guest mode supported)
- Unified chat/generate UI (React, accessible, role-based prompts)
- Advanced Markdown/code rendering with copy/edit (Monaco Editor)
- Conversation history and management (MongoDB for main app, localStorage for guests)
- Sound feedback for user and AI actions
- Hands-free browser-based voice mode (STT/TTS loop, English only for now)
- Accessibility: screen reader support, keyboard navigation, aria-live regions
- Docker Compose for full stack (frontend, backend, MongoDB, Ollama, Nginx)
- REST and MCP (Model Connection Protocol) chat modes (switchable)
- API endpoints for auth, chat, and conversation management

## Planned/Recent Updates
- Multi-language support for STT/TTS (Hindi, etc.)
- Modular voice mode: browser/server toggle
- Server-based TTS/STT via Docker
- Improved accessibility and code UX
- Rate limiting, logging, and input validation for security
- Health checks and CI/testing setup

## Environment & configuration

Copy `.env.example` to `.env` and set values for each environment. Key variables:

- `PORT` — backend port (default 3000)
- `NODE_ENV` — development|staging|production
- `SECRET_KEY` — JWT secret
- `MONGO_URL` — MongoDB connection string
- `OLLAMA_HOST` — Ollama host (e.g. http://localhost:11434)

## Run (development)

1. Install frontend/backend deps (optional if using Docker):

```powershell
cd frontend
npm install

cd ..\backend
npm install
```

2. Start services with Docker Compose (recommended):

```powershell
# from repo root
git clone https://github.com/bobbysingh2005/chat-localhost-llama3.git my-chat
```

3. Frontend dev server (optional):

```powershell
cd frontend
npm run dev
```

4. Backend local run (optional):

```powershell
cd backend
npm run dev
```

## API routes

- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- LLM: `POST /api/generate` (backend proxies to Ollama `/v1/generate`)
- Conversations: `POST /conversations`, `GET /conversations`, `GET /conversations/:id`, `PUT /conversations/:id`, `DELETE /conversations/:id`


## Guest Mode & Accessibility
- "Continue as Guest" allows anonymous usage; guest conversations are saved to `localStorage` under `guest_conversation`.
- Chat/Generate UI includes `aria-live` announcements, focus management, and semantic HTML for screen reader accessibility.
- All fields have text labels, keyboard shortcuts supported, and no visual-only cues.


## Usage
After login (or as guest), you are redirected to the unified chat/generate interface where you can chat, generate, and manage conversations. Use voice mode for hands-free chat. REST and MCP chat modes are supported.


## Testing & Next Steps
- Add backend tests (vitest/jest + supertest) and frontend tests (vitest + testing-library)
- Add CI (GitHub Actions) to run tests and lint
- Accessibility audit and keyboard navigation improvements
- Multi-language and server-based voice features
```


## Quick Start
1. Install dependencies for frontend and backend (or use Docker Compose):
	```powershell
	cd frontend
	npm install
	cd ../backend
	npm install
	```
2. Start all services with Docker Compose (recommended):
	```powershell
	docker compose up -d
	```
3. Access the app:
	- Web UI: http://localhost:8000 (nginx)
	- Frontend (dev): http://localhost:5173
	- Backend (dev): http://localhost:3000

## Llama Model Setup
To use the latest Llama models, run:
```powershell
docker exec -it ollama ollama pull llama3
```
Replace `llama3` with the desired model name/version as needed.

## Contributing
Contributions are welcome! Fork, branch, and submit a pull request.

## License
MIT License. See LICENSE file for details.