import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import mongoose from 'mongoose';
import config from './config';
import { connectToDB } from './db';
import { authRoutes } from './routes/auth';
import { generateRoutes } from './routes/generate';
import { conversationRoutes } from './routes/conversations';
import { tagsRoutes } from './routes/tags';

// Create and configure Fastify instance without listening
export function buildApp() {
  const fastify = Fastify({ logger: true });

  // Register plugins
  // CORS whitelist — allow requests from frontend dev server and the production domain.
  const allowedOrigins = (config.allowedOrigins || '').split(',').map(s => s.trim());

  fastify.register(cors, {
    origin: function (origin, cb) {
      // Allow requests with no origin (like curl, server-to-server)
      if (!origin) return cb(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        // Reflect the allowed origin
        return cb(null, true);
      }
      // Not allowed
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return cb(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  fastify.register(fastifyCookie);

  fastify.register(fastifyJWT, {
    secret: config.secretKey,
    sign: { algorithm: 'HS256' },
    cookie: {
      cookieName: 'access_token',
      signed: false,
    },
  });

  // Auth decorator
  // Using `any` for request/reply here to avoid implicit-any issues during runtime in ts-node.
  fastify.decorate('authenticate', async function (request: any, reply: any) {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({ success: false, message: 'Unauthorized' });
    }
  });

  mongoose.set('debug', true);

  // Register routes
  fastify.register(authRoutes, { prefix: '/auth' });
  fastify.register(generateRoutes);
  fastify.register(conversationRoutes);
  fastify.register(tagsRoutes);

  // Health
  fastify.get('/health', async () => ({ status: 'ok', db: { connected: mongoose.connection.readyState === 1, state: mongoose.connection.readyState } }));

  return fastify;
}

// Export the builder function (don't call it here). Calling connectToDB / starting the
// server should be done by the startup script so failures during DB connect don't
// cause the module import to kill the process.
export default buildApp;
