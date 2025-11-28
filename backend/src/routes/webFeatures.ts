import { FastifyInstance } from 'fastify';
import { searchWeb, scrapeWebsite, searchAndScrape } from '../tools/webTools';

export default async function webFeatureRoutes(fastify: FastifyInstance) {
  // GET /api/search?q=keyword
  fastify.get('/api/search', async (request, reply) => {
    const { q } = request.query as { q?: string };
    if (!q) return reply.status(400).send({ error: 'Missing search query.' });
    const results = await searchWeb(q);
    return reply.send({ results });
  });

  // GET /api/scrape?url=someurl
  fastify.get('/api/scrape', async (request, reply) => {
    const { url } = request.query as { url?: string };
    if (!url) return reply.status(400).send({ error: 'Missing URL.' });
    const result = await scrapeWebsite(url);
    return reply.send(result);
  });

  // GET /api/search-and-scrape?q=keyword
  fastify.get('/api/search-and-scrape', async (request, reply) => {
    const { q } = request.query as { q?: string };
    if (!q) return reply.status(400).send({ error: 'Missing search query.' });
    const result = await searchAndScrape(q);
    return reply.send(result);
  });
}
