import cron from 'node-cron';
import { FastifyInstance } from 'fastify';
import Reminder from '../models/reminder';
import { io } from '../ws';

// This cron job runs every minute and checks for reminders to trigger
export function startReminderCron(fastify: FastifyInstance) {
  cron.schedule('* * * * *', async () => {
    const now = new Date();
    const dueReminders = await Reminder.find({ done: false, triggerAt: { $lte: now } });
    for (const reminder of dueReminders) {
      // Trigger notification (WebSocket + log)
      console.log(`🔔 Reminder for ${reminder.user}: ${reminder.message} (at ${reminder.triggerAt})`);
      if (io) {
        io.emit('reminder', {
          user: reminder.user,
          message: reminder.message,
          triggerAt: reminder.triggerAt,
          id: reminder._id,
        });
      }
      reminder.done = true;
      await reminder.save();
    }
  });
}
