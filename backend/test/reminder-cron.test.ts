import Reminder from '../src/models/reminder';
import { startReminderCron } from '../src/jobs/reminder-cron';
import { io } from '../src/ws';
import mongoose from 'mongoose';

describe('Reminder Cron Job', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/testdb');
    await Reminder.deleteMany({});
  });
  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should trigger reminders and emit notification', async () => {
    const emit = jest.fn();
    (io as any) = { emit };
    const now = new Date();
    await Reminder.create({ user: 'testuser', message: 'Test', triggerAt: now, done: false });
    await startReminderCron({});
    // Wait for cron to run
    await new Promise(res => setTimeout(res, 2000));
    expect(emit).toHaveBeenCalledWith('reminder', expect.objectContaining({ message: 'Test' }));
  });
});
