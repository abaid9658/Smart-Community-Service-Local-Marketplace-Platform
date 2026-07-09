import { Response, NextFunction } from 'express';
import { Conversation, Message } from '../models/Message.model';
import { sendSuccess, getPagination, buildPaginationMeta } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { AuthRequest } from '../middleware/auth.middleware';
import { getIO } from '../socket/socket.server';
import mongoose from 'mongoose';

// ── Get or Create Conversation ────────────────────────────────────
export const getOrCreateConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId } = req.body;
    const myId = req.user!.userId;

    if (userId === myId) throw new AppError('Cannot message yourself', 400);

    let conversation = await Conversation.findOne({
      participants: { $all: [new mongoose.Types.ObjectId(myId), new mongoose.Types.ObjectId(userId)] },
    }).populate('participants', 'username profile.fullName profile.avatarUrl isOnline').lean();

    if (!conversation) {
      const created = await Conversation.create({
        participants: [myId, userId],
      });
      conversation = await Conversation.findById(created._id)
        .populate('participants', 'username profile.fullName profile.avatarUrl isOnline')
        .lean();
    }

    sendSuccess(res, { ...conversation, id: (conversation!._id as { toString(): string }).toString() });
  } catch (err) {
    next(err);
  }
};

// ── Get My Conversations ──────────────────────────────────────────
export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversations = await Conversation.find({
      participants: new mongoose.Types.ObjectId(req.user!.userId),
    })
      .sort({ lastMessageAt: -1 })
      .populate('participants', 'username profile.fullName profile.avatarUrl isOnline lastSeen')
      .lean();

    sendSuccess(res, conversations.map(c => ({ ...c, id: (c._id as { toString(): string }).toString() })));
  } catch (err) {
    next(err);
  }
};

// ── Get Messages ──────────────────────────────────────────────────
export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { page, limit } = req.query;
    const { page: p, limit: l, skip } = getPagination(page as string, limit as string);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new AppError('Conversation not found', 404);
    if (!conversation.participants.some((pid: any) => pid.toString() === req.user!.userId)) {
      throw new AppError('Not authorized', 403);
    }

    const [messages, total] = await Promise.all([
      Message.find({ conversationId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(l)
        .populate('sender', 'username profile.fullName profile.avatarUrl')
        .lean(),
      Message.countDocuments({ conversationId }),
    ]);

    // Mark messages as read
    await Message.updateMany(
      { conversationId, senderId: { $ne: new mongoose.Types.ObjectId(req.user!.userId) }, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    sendSuccess(res, {
      messages: messages.reverse().map(m => ({ ...m, id: (m._id as { toString(): string }).toString() })),
      ...buildPaginationMeta(total, p, l),
    });
  } catch (err) {
    next(err);
  }
};

// ── Send Message ──────────────────────────────────────────────────
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const file = req.file as (Express.Multer.File & { path: string }) | undefined;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new AppError('Conversation not found', 404);
    if (!conversation.participants.some((pid: any) => pid.toString() === req.user!.userId)) {
      throw new AppError('Not authorized', 403);
    }

    const message = await Message.create({
      conversationId,
      senderId: req.user!.userId,
      content: content || '',
      mediaUrl: file?.path,
      mediaType: file ? 'image' : undefined,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content || '[Media]',
      lastMessageAt: new Date(),
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'username profile.fullName profile.avatarUrl')
      .lean();

    // Emit via Socket.io
    const io = getIO();
    conversation.participants.forEach((pid: any) => {
      const participantId = pid.toString();
      if (participantId !== req.user!.userId) {
        io.to(`user:${participantId}`).emit('new_message', { ...populated, id: (populated!._id as { toString(): string }).toString() });
      }
    });

    sendSuccess(res, { ...populated, id: (populated!._id as { toString(): string }).toString() }, 'Message sent', 201);
  } catch (err) {
    next(err);
  }
};
