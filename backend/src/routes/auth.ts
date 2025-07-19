import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { User } from '../models/user';

export async function authRoutes(fastify: FastifyInstance) {
  // Register a new user
  fastify.post('/register', async (req, reply) => {
    const { username, password } = req.body as { username: string; password: string };

    const existing = await User.findOne({ username });
    if (existing) {
      return reply.code(400).send({ success: false, message: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, passwordHash });

    return reply.send({ success: true, id: user._id });
  });

  // Login
  fastify.post('/login', async (req, reply) => {
    const { username, password } = req.body as { username: string; password: string };
    const user = await User.findOne({ username });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({ success: false, message: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign({ userId: user._id.toString() });
    return reply.send({ success: true, token });
  });

  // Get current user (protected)
  fastify.get('/me', { preValidation: [fastify.authenticate] }, async (req, reply) => {
      const userId = req.user.userId;

      if (!userId) {
        return reply.code(401).send({ success: false, message: 'Unauthorized' });
      }

      const user = await User.findById(userId).select('-passwordHash');
      return { success: true, user };
    }
  );
}
