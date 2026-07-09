import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/database';
import User from '../src/models/User.model';
import { Message, Conversation } from '../src/models/Message.model';

async function run() {
  await connectDB();
  console.log('Connected to MongoDB');

  // Let's find some user
  const user = await User.findOne();
  if (!user) {
    console.log('No users found');
    await mongoose.connection.close();
    return;
  }
  console.log('Found user:', user.username, user._id);

  // Let's create a temp conversation and message
  const conv = await Conversation.create({
    participants: [user._id],
  });

  const msg = await Message.create({
    conversationId: conv._id,
    senderId: user._id,
    content: 'Test content',
  });

  const populated = await Message.findById(msg._id)
    .populate('sender', 'username profile.fullName profile.avatarUrl')
    .lean();

  console.log('Populated message:', JSON.stringify(populated, null, 2));

  // Cleanup
  await Message.findByIdAndDelete(msg._id);
  await Conversation.findByIdAndDelete(conv._id);
  await mongoose.connection.close();
}

run().catch(err => {
  console.error(err);
  mongoose.connection.close();
});
