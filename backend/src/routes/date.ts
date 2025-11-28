import { FastifyInstance } from 'fastify';
import { getCurrentDate, getNextWeekday, addDaysToDate } from '../tools/date';

export default async function dateRoutes(fastify: FastifyInstance) {
  fastify.get('/api/date', async (request, reply) => {
    const { location, timezone } = request.query as { location?: string; timezone?: string };
    const result = getCurrentDate({ location, timezone });
    reply.send({ success: true, ...result });
  });

  fastify.get('/api/next-weekday', async (request, reply) => {
    const { date, weekday, timezone } = request.query as { date?: string; weekday?: string; timezone?: string };
    const result = getNextWeekday({ date, weekday, timezone });
    reply.send({ success: true, ...result });
  });

  fastify.get('/api/add-days', async (request, reply) => {
    const { date, daysToAdd, timezone } = request.query as { date?: string; daysToAdd?: number; timezone?: string };
    const result = addDaysToDate({ date, daysToAdd: Number(daysToAdd), timezone });
    reply.send({ success: true, ...result });
  });
}
