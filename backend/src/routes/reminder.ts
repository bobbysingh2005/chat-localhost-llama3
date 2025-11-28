import { FastifyInstance } from 'fastify';
import Reminder, { IReminder } from '../models/reminder';

export default async function reminderRoutes(fastify: FastifyInstance) {
  // Create reminder
  fastify.post('/api/reminder', async (request, reply) => {
    const { user, message, triggerAt } = request.body as { user: string; message: string; triggerAt: string };
    try {
      const reminder = await Reminder.create({ user, message, triggerAt });
      reply.send({ success: true, id: reminder._id });
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message });
    }
  });

  // List reminders
  fastify.get('/api/reminder', async (request, reply) => {
    const { user } = request.query as { user?: string };
    try {
      const query = user ? { user } : {};
      const reminders = await Reminder.find(query).sort({ triggerAt: 1 });
      reply.send({ success: true, reminders });
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Mark reminder as done
  fastify.patch('/api/reminder/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const reminder = await Reminder.findByIdAndUpdate(id, { done: true }, { new: true });
      reply.send({ success: !!reminder });
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message });
    }
  });

  // Delete reminder
  fastify.delete('/api/reminder/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const result = await Reminder.findByIdAndDelete(id);
      reply.send({ success: !!result });
    } catch (err) {
      reply.status(500).send({ success: false, error: err.message });
    }
  });
}
