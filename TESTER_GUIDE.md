# Tester Guide: Chat Localhost Llama3

## Test Environment Setup
1. Clone the repository and install dependencies for both frontend and backend.
2. Start all services using Docker Compose:
   ```bash
   docker compose up -d
   ```
3. Access the app at http://localhost:8000 (nginx) or http://localhost:5173 (dev).

## What to Test
- User authentication (register, login, logout, guest mode)
- Chat functionality (send/receive messages, REST and MCP modes)
- Voice mode (STT/TTS, browser compatibility)
- Conversation history (save, load, delete)
- Accessibility (keyboard navigation, screen reader support)
- Error handling (invalid input, network issues)

## How to Test
- Use different browsers and devices for compatibility.
- Try all user flows: login, guest, chat, voice, history.
- Check for clear error messages and UI feedback.
- Report bugs with steps to reproduce and screenshots if possible.

## Automated Testing
- Run backend and frontend tests (see `DOCS.md` for commands).
- Ensure all tests pass before approving changes.

## Reporting Issues
- Use GitHub Issues to report bugs or suggest improvements.
- Include environment details and steps to reproduce.
