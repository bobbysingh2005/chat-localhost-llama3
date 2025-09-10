import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Conversation } from '../models/conversation';

interface CreateConversationBody {
  title?: string;
  messages?: Array<{ sender: string; text: string }>;
}

export async function conversationRoutes(fastify: FastifyInstance) {
  // Create a conversation (guest or user)
  fastify.post('/conversations', async (req: FastifyRequest, reply: FastifyReply) => {
    const { title, messages } = (req.body as CreateConversationBody) || {};
    // If user is authenticated, attach userId
    const userId = (req.user as any)?.userId || null;

    const conv = await Conversation.create({ userId, title, messages: messages || [] });
    return reply.code(201).send({ success: true, conversation: conv });
  });

  // List conversations for authenticated user only
  fastify.get('/conversations', { preValidation: [fastify.authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const userId = (req.user as any)?.userId;
    if (!userId) return reply.code(401).send({ success: false, message: 'Unauthorized' });

    const list = await Conversation.find({ userId }).sort({ updatedAt: -1 }).limit(50);
    return { success: true, conversations: list };
  });

  // Get conversation by id (auth optional if conversation has no userId)
  fastify.get('/conversations/:id', async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id;
    const conv = await Conversation.findById(id);
    if (!conv) return reply.code(404).send({ success: false, message: 'Not found' });

    // If conversation has userId, ensure requester is owner
    if (conv.userId) {
      try {
        await req.jwtVerify();
        const userId = (req.user as any)?.userId;
        if (String(conv.userId) !== String(userId)) return reply.code(403).send({ success: false, message: 'Forbidden' });
      } catch (e) {
        return reply.code(401).send({ success: false, message: 'Unauthorized' });
      }
    }

    return { success: true, conversation: conv };
  });

  // Update conversation (only owner)
  fastify.put('/conversations/:id', { preValidation: [fastify.authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id;
    const userId = (req.user as any)?.userId;

    const conv = await Conversation.findById(id);
    if (!conv) return reply.code(404).send({ success: false, message: 'Not found' });
    if (String(conv.userId) !== String(userId)) return reply.code(403).send({ success: false, message: 'Forbidden' });
    const { title, messages } = (req.body as Partial<CreateConversationBody>) || {};
    if (title) conv.title = title;
    if (messages) conv.messages = messages as any;
    await conv.save();

    return { success: true, conversation: conv };
  });

  // Delete conversation (only owner)
  fastify.delete('/conversations/:id', { preValidation: [fastify.authenticate] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const id = (req.params as any).id;
    const userId = (req.user as any)?.userId;

    const conv = await Conversation.findById(id);
    if (!conv) return reply.code(404).send({ success: false, message: 'Not found' });
    if (String(conv.userId) !== String(userId)) return reply.code(403).send({ success: false, message: 'Forbidden' });

    await Conversation.deleteOne({ _id: id });
    return { success: true, message: 'Deleted' };
  });
}
