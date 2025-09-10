import { FastifyInstance, FastifyRequest } from 'fastify';
import bcrypt from 'bcrypt';
import User from '../models/user';

interface AuthRequestBody {
  username?: string;
  email: string;
  password: string;
}

interface JWTUserPayload {
  userId: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (req, reply) => {
    const { username, email, password } = req.body as AuthRequestBody;

    const existing = await User.findOne({ email });
    if (existing) {
      return reply.code(400).send({ success: false, message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, passwordHash });

    return reply.code(201).send({ success: true, message: 'Registered', userId: user._id });
  });

  // Login
  fastify.post('/login', async (req, reply) => {
    const { email, password } = req.body as AuthRequestBody;

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return reply.code(401).send({ success: false, message: 'Invalid credentials' });
    }

    const accessToken = fastify.jwt.sign(
      { userId: user._id.toString() },
      { expiresIn: '15m' }
    );

    const refreshToken = fastify.jwt.sign(
      { userId: user._id.toString() },
      { expiresIn: '7d' }
    );

    // Send tokens in secure cookies
    reply
      .setCookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15, // 15 minutes
      })
      .setCookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

    return reply.send({
      success: true,
      message: 'Logged in',
      user: { _id: user._id, email: user.email, username: user.username },
    });
  });

  // Refresh Access Token
  fastify.post('/refresh', async (req, reply) => {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) throw new Error('Missing refresh token');

      const payload = fastify.jwt.verify(refreshToken) as JWTUserPayload;
      const accessToken = fastify.jwt.sign(
        { userId: payload.userId },
        { expiresIn: '15m' }
      );

      reply.setCookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 15,
      });

      return reply.send({ success: true, message: 'Token refreshed' });
    } catch (err) {
      return reply.code(401).send({ success: false, message: 'Invalid or expired refresh token' });
    }
  });

  // Logout
  fastify.post('/logout', async (req, reply) => {
    reply.clearCookie('access_token', { path: '/' });
    reply.clearCookie('refresh_token', { path: '/' });
    return reply.send({ success: true, message: 'Logged out' });
  });

  // Get current user (protected)
  fastify.get('/me', {
    preValidation: [fastify.authenticate],
  }, async (req: FastifyRequest, reply) => {
    const userId = (req.user as JWTUserPayload)?.userId;
    if (!userId) {
      return reply.code(401).send({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return reply.code(404).send({ success: false, message: 'User not found' });
    }

    return { success: true, user };
  });
}
