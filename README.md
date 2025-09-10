# Chat Localhost Llama3

Self-hosted chat application using Ollama for LLM inference, Fastify backend, and React frontend.

Core features implemented
- Fastify backend with user auth and conversation storage (MongoDB)
- Backend proxy to Ollama (`POST /api/generate`)
- React frontend with unified Chat/Generate UI and Guest mode
- Docker Compose configuration for local development

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

## Guest mode & accessibility

- "Continue as Guest" allows anonymous usage; guest conversations are saved to `localStorage` under `guest_conversation`.
- Chat/Generate UI includes `aria-live` announcements and focus management for screen reader accessibility.

## Usage

After login, you are redirected to the unified chat/generate interface where you can chat or generate as you wish.

## Testing & next steps

Planned items:
- Add backend tests (vitest/jest + supertest) and frontend tests (vitest + testing-library)
- Add CI (GitHub Actions) to run tests and lint
- Accessibility audit and keyboard navigation improvements

If you want, I'll implement tests next and finish a developer guide with detailed API docs.
cd my-chat
```

1. Install Dependencies
(Optional: Only if you need to modify the React code)
Install the required npm packages for the React frontend:
```bash
npm install
```

1. Start the Application
* Development Mode:
Start the React development server and open the application in your browser:
```bash
npm run dev
```
The application will be available at: http://localhost:8080.
* Production Mode:
To run both the React frontend and the Ollama backend as Docker services, use:
```bash
npm start
```
The application will be accessible at: http://localhost:8080.
* Verify the status of the Docker containers with:
```bash
docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
```

1. Initial Setup
On first run, you will be prompted to enter your name. This information is saved in localStorage, so you won't need to re-enter it in future sessions.
2. Initially, there will be no Llama model available in the chat app. To get the latest Llama models, run the following command:
```bash
docker exec -it chatApi ollama pull llama3.1
```
3. Using Other Llama Models
• If you want to use a different Llama model, use the same command to pull the desired model into the `chatApi` container. For example, replace `llama3.1` with the specific model name or version you wish to use

###### Usage Tips
* Interact with the chat application through the React frontend, which communicates with the Llama3 module via the Ollama REST API.
* Ensure the Docker container for Llama3 is running and properly configured before starting the React application.

##### Contributing
Contributions are welcome! To contribute to this project:
1. Fork the repository.
2. Create a new branch for your changes.
3. Make your modifications.
4. Submit a pull request with a description of your changes.

##### License
This project is licensed under the MIT License. See the LICENSE file for details.
This version includes improved descriptions and formatting, ensuring that it is easy to read and follow.