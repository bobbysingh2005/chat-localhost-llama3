import { FastifyInstance } from 'fastify';
import { Meeting } from '../models/meeting';

export default async function meetingRoutes(fastify: FastifyInstance) {
  // Create meeting/reminder
  fastify.post('/api/meetings', async (request, reply) => {
    try {
      const meeting = new Meeting(request.body);
      await meeting.save();
      reply.code(201).send(meeting);
    } catch (err: any) {
      reply.code(400).send({ error: err.message });
    }
  });

  // Get all meetings for user
  fastify.get('/api/meetings', async (request, reply) => {
    try {
      const userId = request.query.user;
      const meetings = await Meeting.find({ user: userId }).sort({ datetime: 1 });
      reply.send(meetings);
    } catch (err: any) {
      reply.code(400).send({ error: err.message });
    }
  });

  // Get today's meetings
  fastify.get('/api/meetings/today', async (request, reply) => {
    try {
      const userId = request.query.user;
      const start = new Date();
      start.setHours(0,0,0,0);
      const end = new Date();
      end.setHours(23,59,59,999);
      const meetings = await Meeting.find({ user: userId, datetime: { $gte: start, $lte: end } }).sort({ datetime: 1 });
      reply.send(meetings);
    } catch (err: any) {
      reply.code(400).send({ error: err.message });
    }
  });

  // Get next meeting
  fastify.get('/api/meetings/next', async (request, reply) => {
    try {
      const userId = request.query.user;
      const now = new Date();
      const meeting = await Meeting.findOne({ user: userId, datetime: { $gte: now } }).sort({ datetime: 1 });
      reply.send(meeting);
    } catch (err: any) {
      reply.code(400).send({ error: err.message });
    }
  });

  // Update meeting/reminder
  fastify.put('/api/meetings/:id', async (request, reply) => {
    try {
      const meeting = await Meeting.findByIdAndUpdate(request.params.id, request.body, { new: true });
      reply.send(meeting);
    } catch (err: any) {
      reply.code(400).send({ error: err.message });
    }
  });

  // Delete meeting/reminder
  fastify.delete('/api/meetings/:id', async (request, reply) => {
    try {
      await Meeting.findByIdAndDelete(request.params.id);
      reply.code(204).send();
    } catch (err: any) {
      reply.code(400).send({ error: err.message });
    }
  });
}
