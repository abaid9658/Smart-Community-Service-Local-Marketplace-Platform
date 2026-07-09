import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  lastMessage?: string;
  lastMessageAt?: Date;
  createdAt: Date;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const ConversationSchema = new Schema<IConversation>({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: String,
  lastMessageAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'conversations' });

ConversationSchema.index({ participants: 1 });

const MessageSchema = new Schema<IMessage>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  mediaUrl: String,
  mediaType: String,
  isRead: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'messages' });

MessageSchema.index({ conversationId: 1, createdAt: -1 });

MessageSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true,
});

MessageSchema.set('toJSON', { virtuals: true });
MessageSchema.set('toObject', { virtuals: true });

export const Conversation = mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);
export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);
