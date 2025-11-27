// routes/tool.ts
// Fastify route for universal tool calls
// Receives toolName and arguments, runs via tools-runner, returns result
// All tools are accessible for AI model function calling

import { FastifyInstance } from 'fastify';
import { runTool, toolList } from '../tools/tools-runner';

export default async function toolRoutes(fastify: FastifyInstance) {
  fastify.post('/api/tool', async (request, reply) => {
    const { tool, arguments: args } = request.body as { tool: string, arguments: any };
    if (!toolList[tool]) {
      return reply.code(400).send({ error: 'Unknown tool', tool });
    }
    try {
      const result = await runTool(tool, args);
      return reply.send({ result });
    } catch (err) {
      return reply.code(500).send({ error: err.message, tool });
    }
  });
}

// Usage: Register in your main Fastify app
// import toolRoutes from './routes/tool';
// toolRoutes(fastify);
