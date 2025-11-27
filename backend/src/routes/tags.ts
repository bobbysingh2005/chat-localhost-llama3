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
        // Map to expected shape: [{ name, model, size }]
        const models = await json.models.map((item: any) => {
          const size = item.details?.parameter_size || '';
          return { 
            name: item.name, 
            model: item.model,
            size: size // e.g., "1.2B", "2B"
          }
        });
        console.log('models: ', models,'\n\n')
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
