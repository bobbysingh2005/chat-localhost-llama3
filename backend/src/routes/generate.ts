import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import config from '../config';

interface GenerateBody {
  model?: string;
  prompt?: string;
  stream?: boolean;
  context?: any[];
  system?: string;
}

export async function generateRoutes(fastify: FastifyInstance) {
  fastify.post('/api/generate', async (req: FastifyRequest<{ Body: GenerateBody }>, reply: FastifyReply) => {
    const body = req.body as GenerateBody;

  // Use configured Ollama host (set via OLLAMA_HOST or config)
  const ollamaHost = config.ollamaHost || 'http://localhost:11434';

    const payload: any = {
      model: body.model || 'llama3.2',
      prompt: body.prompt || '',
      stream: !!body.stream,
    };

    if (body.system) payload.system = body.system;
    if (body.context) payload.context = body.context;

    try {
      // If streaming requested, proxy the raw response stream
      if (payload.stream) {
        const res = await fetch(`${ollamaHost}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        reply.code(res.status);
        if (!res.body) return reply.send({ success: false, message: 'No stream from ollama' });

        const PassThrough = require('stream').PassThrough;
        const pass = new PassThrough();
        const reader = res.body.getReader();

        (async () => {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              pass.write(value);
            }
          } catch (e) {
            fastify.log.error(e);
          } finally {
            pass.end();
          }
        })();

        reply.type('application/octet-stream');
        return reply.send(pass);
      }

      // Non-streaming
      const res = await fetch(`${ollamaHost}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      const responseText = json.output?.[0]?.content || json.response || (typeof json === 'string' ? json : JSON.stringify(json));

      return reply.send({ success: true, response: responseText, raw: json });
    } catch (err: any) {
      fastify.log.error('Generate proxy error:', err);
      return reply.code(500).send({ success: false, message: String(err?.message || err) });
    }
  });
}
