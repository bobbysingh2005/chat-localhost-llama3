# Pro Chat Frontend — Developer & User Guide

## Current Status
- Modern, accessible chat app with robust code/file rendering
- Copy/edit for code blocks, Monaco Editor integration
- Hands-free browser-based voice mode (STT/TTS loop)
- Sound feedback for user/AI actions
- All old/duplicate files archived in `/archive`

## Usage Guide
- **Chat:** Type or use voice mode to interact with the AI
- **Code Blocks:** Copy or edit code directly in the chat
- **Voice Mode:** Toggle voice mode for hands-free chat (English only for now)
- **Accessibility:** Screen reader and keyboard navigation supported

## Developer Guide
- Main entry: `src/views/chat-app.jsx`, `src/views/default-layout.jsx`
- Components: `src/components/`
- Archive: All `bk-*` and old files are in `/archive` (project root)
- To add new features, work in `src/` and keep it clean

## Future Plans
- Add multi-language support for STT/TTS (Hindi, etc.)
- Add server-based TTS/STT (REST endpoints, Docker services)
- UI toggle for browser/server voice mode
- Continue improving accessibility and code UX

## Known Limitations
- STT/TTS only supports English (en-US) in browser mode
- Hindi and other languages: not yet supported (next target)
- Server-based voice features require backend and Docker setup

## Contributing
- Keep `src/` clean and focused on current features
- Archive unused/old files in `/archive`
- Document all new features and changes

---
