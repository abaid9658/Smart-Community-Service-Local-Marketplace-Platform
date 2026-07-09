import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
let currentSocketToken: string | null = null;

export const initSocket = (token: string): Socket => {
  if (socket && currentSocketToken !== token) {
    socket.disconnect();
    socket = null;
  }

  if (socket?.connected) return socket;

  currentSocketToken = token;
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000', {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => console.log('🟢 Socket connected:', socket?.id));
  socket.on('disconnect', () => console.log('🔴 Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  currentSocketToken = null;
};

export const joinConversation = (conversationId: string): void => {
  socket?.emit('conversation:join', conversationId);
};

export const leaveConversation = (conversationId: string): void => {
  socket?.emit('conversation:leave', conversationId);
};

export const emitTypingStart = (conversationId: string): void => {
  socket?.emit('typing:start', { conversationId });
};

export const emitTypingStop = (conversationId: string): void => {
  socket?.emit('typing:stop', { conversationId });
};

export const emitMessage = (data: { conversationId: string; content: string; tempId?: string }): void => {
  socket?.emit('message:send', data);
};
