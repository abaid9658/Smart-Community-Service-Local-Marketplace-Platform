import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  _id: Types.ObjectId;
  reviewerId: Types.ObjectId;
  revieweeId: Types.ObjectId;
  productId?: Types.ObjectId;
  serviceId?: Types.ObjectId;
  bookingId?: Types.ObjectId;
  rating: number;
  comment: string;
  reply?: string;
  isVerified: boolean;
  isReported: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>({
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  reply: String,
  isVerified: { type: Boolean, default: false },
  isReported: { type: Boolean, default: false },
}, { timestamps: true, collection: 'reviews' });

ReviewSchema.index({ serviceId: 1 });
ReviewSchema.index({ productId: 1 });
ReviewSchema.index({ revieweeId: 1 });

ReviewSchema.virtual('reviewer', {
  ref: 'User',
  localField: 'reviewerId',
  foreignField: '_id',
  justOne: true,
});

ReviewSchema.virtual('reviewee', {
  ref: 'User',
  localField: 'revieweeId',
  foreignField: '_id',
  justOne: true,
});

ReviewSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

ReviewSchema.virtual('service', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true,
});

ReviewSchema.virtual('booking', {
  ref: 'Booking',
  localField: 'bookingId',
  foreignField: '_id',
  justOne: true,
});

ReviewSchema.set('toJSON', { virtuals: true });
ReviewSchema.set('toObject', { virtuals: true });

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
export default Review;
