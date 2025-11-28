import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3300';

export default function ReminderNotification() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socket.on('reminder', (data) => {
      setReminders((prev) => [...prev, data]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  if (reminders.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
      {reminders.map((rem, idx) => (
        <div key={rem.id || idx} style={{ background: '#fffbe6', border: '1px solid #ffe58f', padding: 12, marginBottom: 8, borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <strong>Reminder:</strong> {rem.message}<br />
          <small>Time: {new Date(rem.triggerAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
