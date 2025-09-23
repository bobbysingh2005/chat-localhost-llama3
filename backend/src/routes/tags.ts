import { FastifyInstance } from 'fastify';
import config from '../config';

export async function tagsRoutes(fastify: FastifyInstance) {
  // Returns a list of available models. If Ollama is available, try to fetch from it.
  fastify.get('/api/tags', async (req, reply) => {
    try {
      const ollama = config.ollamaHost;
      // Try Ollama models endpoint
      const url = `${ollama}/api/tags`;
      const res = await fetch(url).catch(() => null);

      if (res && res.ok) {
        const json = await res.json();
        console.log('json: ', json.models[0],'\n\n')
        // process.exit(1)
        // Map to expected shape: [{ name, model }]
        // const models = (json || []).map((m: any) => ({ name: m.name || m.id || m.model, model: m.id || m.name || m.model }));
        const models = await json.models.map((item: any) => {
          return { name: item.name, model: item.model}
        });
        console.log('models: ', models,'\n\n')
        // process.exit(1)
        return reply.send({ models });
        // return reply.send({ models: json });
      }
    } catch (e) {
      // ignore
    }

    // Fallback static list
    const fallback = [
      { name: 'llama3.2', model: 'llama3.2' },
      { name: 'llama2', model: 'llama2' },
      { name: 'gpt-like', model: 'gpt-like' },
    ];

    return reply.send({ models: fallback });
  });
}
