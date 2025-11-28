# Reminder Hot Notification System

## Overview
This system delivers real-time reminder notifications to users via WebSocket (socket.io) and supports persistent scheduling using MongoDB. The frontend (React, WPA) displays notifications instantly when reminders are triggered.

## Backend
- Reminders are stored in MongoDB (`Reminder` model).
- Cron job checks for due reminders every minute and emits notifications via WebSocket.
- WebSocket server is set up in `src/ws.ts` and integrated in `src/index.ts`.
- API endpoints for creating, listing, updating, and deleting reminders: `/api/reminder`.

## Frontend
- Uses `socket.io-client` to connect to backend WebSocket.
- `ReminderNotification` component displays notifications in real time.
- WPA compatible: notifications appear even if the app is installed as a PWA.

## Usage
1. Start backend and frontend servers.
2. Create reminders via `/api/reminder` endpoint.
3. When a reminder is due, backend emits a `reminder` event.
4. Frontend receives and displays the notification instantly.

## Testing
- Backend: See `test/reminder-cron.test.ts` for cron and notification tests.
- Frontend: See `src/__tests__/ReminderNotification.test.jsx` for notification UI tests.

## Notes
- Only logged-in users receive personalized notifications.
- Anonymous users can see generic notifications if subscribed.
- For production, restrict CORS and WebSocket origins.

---
For further details, see code comments and API docs.
