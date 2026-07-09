import mongoose from 'mongoose';

// Global transform: add `id` string and strip internal fields on ALL models
mongoose.set('toJSON', {
  virtuals: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    delete ret.emailVerifyToken;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpiry;
    return ret;
  },
});

mongoose.set('strictPopulate', false);

let isConnected = false;

export async function connectDB(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('❌ MONGODB_URI is not defined in .env');
  }

  if (isConnected) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('✅ MongoDB Atlas connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  }
}

export default mongoose;
