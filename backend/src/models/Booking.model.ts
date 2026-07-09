import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBooking extends Document {
  _id: Types.ObjectId;
  serviceId: Types.ObjectId;
  clientId: Types.ObjectId;
  providerId: Types.ObjectId;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  scheduledDate: Date;
  scheduledTime: string;
  notes?: string;
  packageName?: string;          // ← add
  totalPrice: number;
  paymentStatus: string;
  paymentIntentId?: string;      // ← add (payment.controller already sets this, schema was missing it)
  cancellationReason?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>({
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'REJECTED'],
    default: 'PENDING',
  },
  scheduledDate: { type: Date, required: true },
  scheduledTime: { type: String, required: true },
  notes: String,
  packageName: String,           // ← add
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: 'PENDING' },
  paymentIntentId: String,       // ← add
  cancellationReason: String,
  completedAt: Date,
}, { timestamps: true, collection: 'bookings' });
BookingSchema.index({ clientId: 1 });
BookingSchema.index({ providerId: 1 });
BookingSchema.index({ serviceId: 1 });

BookingSchema.virtual('service', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true,
});

BookingSchema.virtual('client', {
  ref: 'User',
  localField: 'clientId',
  foreignField: '_id',
  justOne: true,
});

BookingSchema.virtual('provider', {
  ref: 'User',
  localField: 'providerId',
  foreignField: '_id',
  justOne: true,
});

BookingSchema.set('toJSON', { virtuals: true });
BookingSchema.set('toObject', { virtuals: true });

const Booking = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);
export default Booking;
