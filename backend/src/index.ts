import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import mongoose from 'mongoose';
import config from './config';
import { connectToDB } from './db';
import { authRoutes } from './routes/auth';

const fastify = Fastify({ logger: true });

// 🔐 Register middleware plugins
fastify.register(cors, {
  origin: true, // Allow requests from any origin (or customize)
  credentials: true, // Allow cookies across origins
});

fastify.register(fastifyCookie);

fastify.register(fastifyJWT, {
  secret: config.secretKey,
  sign: { algorithm: 'HS256' }, // HS256 is safe if you control the key
  cookie: {
    cookieName: 'access_token', // Read token from cookie if Authorization header is missing
    signed: false,
  },
});

// ✅ Define reusable auth decorator
fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify(); // Reads from cookie automatically
  } catch (err) {
    return reply.code(401).send({ success: false, message: 'Unauthorized' });
  }
});

// Log incoming request headers (optional debug)
fastify.addHook('onRequest', async (req, reply) => {
  console.log(`[${req.method}] ${req.url} - ${JSON.stringify(req.headers)}`);
});

// 🌱 Connect to MongoDB
connectToDB();
mongoose.set('debug', true);

// ✅ Register routes
fastify.register(authRoutes, { prefix: '/auth' });

// 🩺 Health check
fastify.get('/health', async () => ({ status: 'ok' }));

// 🚀 Start the server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 Server running at http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
