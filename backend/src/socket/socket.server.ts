import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { verifyAccessToken } from '../config/jwt';
import User from '../models/User.model';
import { Conversation, Message } from '../models/Message.model';
import mongoose from 'mongoose';

let io: SocketServer;

// Map userId -> socketId for presence tracking
const onlineUsers = new Map<string, string>();

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
  });

  // Auth middleware for Socket.io
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication required'));

      const payload = verifyAccessToken(token);
      (socket as any).userId = payload.userId;
      (socket as any).role = payload.role;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    const userId = (socket as any).userId as string;
    console.log(`🟢 Socket connected: ${userId}`);

    // ── Presence ────────────────────────────────────────────────
    onlineUsers.set(userId, socket.id);
    await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() }).catch(() => {});
    io.emit('user:online', { userId });

    // ── Join personal room for DMs and notifications ────────────
    socket.join(`user:${userId}`);

    // ── Chat Events ─────────────────────────────────────────────
    socket.on('message:send', async (data: {
      conversationId: string;
      content: string;
      tempId?: string;
    }) => {
      try {
        const message = await Message.create({
          conversationId: data.conversationId,
          senderId: userId,
          content: data.content,
        });

        await Conversation.findByIdAndUpdate(data.conversationId, {
          lastMessage: data.content,
          lastMessageAt: new Date(),
        });

        const populated = await Message.findById(message._id)
          .populate('sender', 'username profile.fullName profile.avatarUrl')
          .lean();

        const Notification = (await import('../models/Notification.model')).default;

        // Emit to all participants
        const conversation = await Conversation.findById(data.conversationId).lean();
        conversation?.participants.forEach(async (pid: any) => {
          const pidStr = pid.toString();
          io.to(`user:${pidStr}`).emit('message:received', {
            ...populated,
            id: (populated!._id as { toString(): string }).toString(),
            tempId: data.tempId,
          });

          // Create notification for other participant
          if (pidStr !== userId) {
            const senderName = (populated?.sender as any)?.profile?.fullName || (populated?.sender as any)?.username || 'Someone';
            
            // Create notification in DB
            const notif = await Notification.create({
              userId: pid,
              type: 'MESSAGE',
              title: `New Message from ${senderName}`,
              message: data.content.substring(0, 60),
              link: `/dashboard/messages`,
            });

            // Emit notification in real-time
            io.to(`user:${pidStr}`).emit('notification:received', {
              ...notif.toJSON(),
              id: notif._id.toString(),
            });
          }
        });
      } catch (err) {
        console.error('Socket message send error:', err);
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    socket.on('message:read', async (data: { conversationId: string }) => {
      await Message.updateMany(
        { conversationId: data.conversationId, senderId: { $ne: new mongoose.Types.ObjectId(userId) }, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      socket.to(`conv:${data.conversationId}`).emit('message:read', { conversationId: data.conversationId, readBy: userId });
    });

    socket.on('typing:start', (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('typing:start', { userId, conversationId: data.conversationId });
    });

    socket.on('typing:stop', (data: { conversationId: string }) => {
      socket.to(`conv:${data.conversationId}`).emit('typing:stop', { userId, conversationId: data.conversationId });
    });

    socket.on('conversation:join', (conversationId: string) => {
      socket.join(`conv:${conversationId}`);
    });

    socket.on('conversation:leave', (conversationId: string) => {
      socket.leave(`conv:${conversationId}`);
    });

    // ── Disconnect ───────────────────────────────────────────────
    socket.on('disconnect', async () => {
      console.log(`🔴 Socket disconnected: ${userId}`);
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() }).catch(() => {});
      io.emit('user:offline', { userId });
    });
  });

  return io;
};

export const emitToUser = (userId: string, event: string, data: unknown): void => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const getIO = (): SocketServer => io;
export const getOnlineUsers = (): string[] => Array.from(onlineUsers.keys());
export { io };
