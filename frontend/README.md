# Pro Chat Frontend

## Overview

This is a modern, accessible, developer-friendly chat application frontend built with React. It features advanced code/file rendering, copy/edit, screen reader support, and a hands-free voice mode (STT/TTS) for accessibility.

## Features

- Robust chat UI with role-based system prompts
- Advanced Markdown/code rendering (with copy/edit)
- Monaco Editor for code editing
- Sound feedback for user and AI actions
- Full browser-based voice mode (auto listen, send, TTS, repeat)
- Accessibility: screen reader support, keyboard navigation, aria-live regions
- Conversation history and management

## Voice Mode (STT/TTS)

- Uses browser Web Speech API for speech-to-text (STT) and text-to-speech (TTS)
- Hands-free loop: auto listen, send, TTS, repeat
- Sound feedback for actions
- **Current Limitation:** Only supports English (en-US) reliably. Hindi and other languages are not yet supported.

## Next Targets

- Add multi-language support for STT/TTS (Hindi, etc.)
- Modularize for easy switching between browser and server-based voice features
- Add server-based TTS/STT (Docker: coqui-ai/tts, whisper, kaldi, etc.)
- UI toggle for "Browser" vs "Server" voice mode

## How to Use

1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Use the chat interface, code blocks, and voice mode as needed

## Folder Structure

- `src/views/` — Main chat app and UI logic
- `src/components/` — Reusable UI components
- `src/assets/` — Static assets
- `archive/` — Old/duplicate/unused files (for reference)

## Developer Notes

- Only keep current, working files in `src/` for clarity
- Archive old/duplicate files in the project root `archive/` folder
- See code comments for future upgrade plans

---
