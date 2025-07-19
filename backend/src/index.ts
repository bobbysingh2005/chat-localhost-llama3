import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { connectToDB } from './db';
import { authRoutes } from './routes/auth';
import mongoose from 'mongoose';
import config from './config';

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors, { origin: '*' });

fastify.register(jwt, {
  secret: config.secretKey,
});

// ✅ Define authenticate decorator for protected routes
fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  }
);//end

// Optional: log incoming request headers
fastify.addHook('onRequest', async (req, reply) => {
  console.log('Headers:', req.headers);
});

// Connect DB and register routes
connectToDB();
authRoutes(fastify);

// Health check route
fastify.get('/health', async () => ({ status: 'ok' }));

// Start server
const start = async () => {
  mongoose.set('debug', true);
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log('🚀 Server running on port ' + config.port);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
