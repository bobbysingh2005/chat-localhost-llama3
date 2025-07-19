import 'fastify';
import mongoose from 'mongoose';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    user?: {
      userId: string;
    };
  }
};//end
