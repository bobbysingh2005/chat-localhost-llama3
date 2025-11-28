# Project Features & Functionality: Chat Localhost Llama3

## Core Features
- AI-powered personal assistant with function calling
- Dual-mode system: Chat and Generate
- Real-time tool usage for weather, news, search, scrape, time, location, finance, reminders
- Voice interaction (STT/TTS)
- Code editing and syntax highlighting
- Conversation history and management
- Role templates for specialized AI personas
- JWT authentication and guest mode
- Responsive, accessible UI
- Dockerized deployment and Nginx reverse proxy

## Endpoints Overview
- `/api/chat`: Conversational chat with function calling
- `/api/generate`: Long-form creative generation
- `/api/search`: Web search tool
- `/api/scrape`: Web scraping tool
- `/api/news`: News headlines tool
- `/api/tool`: Universal tool calls for AI

## Tool System
- Tools are modular, registered for AI function calling
- Each tool: name, description, parameters, execute function
- Fallback logic for APIs and mock data
- Strict environment validation for reliability

## Usage Examples
- "What's the weather in Mumbai?" → Weather tool
- "Show me tech news" → News tool
- "Search for AI advancements" → Search tool
- "Scrape details from example.com" → Scrape tool
- "What time is it in Tokyo?" → Time tool

## Security & Privacy
- JWT authentication, bcrypt password encryption
- CORS protection, secure API keys
- Location and conversation data privacy

## Extensibility
- Add new tools in `backend/src/tools`
- Register new endpoints in `backend/src/routes`
- Update docs for new features

## Troubleshooting & Support
- See USER_GUIDE.md and DEVELOPER_GUIDE.md for help
- API keys required for live data; mock data used if missing
- Issues and support via GitHub

---

**For full usage and development instructions, see USER_GUIDE.md and DEVELOPER_GUIDE.md.**
