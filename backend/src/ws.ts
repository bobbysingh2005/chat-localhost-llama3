import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';

export let io: Server | null = null;

export function setupWebSocket(server: any) {
  io = new Server(server, {
    cors: {
      origin: '*', // Restrict in production
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id);
    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected:', socket.id);
    });
  });
}
