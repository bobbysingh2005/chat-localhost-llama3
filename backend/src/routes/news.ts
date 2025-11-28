import { FastifyInstance } from 'fastify';
import { getNews } from '../tools/news';

export default async function newsRoutes(fastify: FastifyInstance) {
  fastify.get('/api/news', async (request, reply) => {
    const { category, country } = request.query as { category?: string; country?: string };
    try {
      const result = await getNews({ category, country });
      reply.send({ success: true, ...result });
    } catch (err: any) {
      reply.status(500).send({ success: false, error: err.message || 'Failed to fetch news.' });
    }
  });
}
