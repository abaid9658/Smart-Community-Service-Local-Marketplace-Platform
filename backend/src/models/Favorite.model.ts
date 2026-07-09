import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  productId?: Types.ObjectId;
  serviceId?: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'favorites' });

FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true, sparse: true });
FavoriteSchema.index({ userId: 1, serviceId: 1 }, { unique: true, sparse: true });

FavoriteSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

FavoriteSchema.virtual('service', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true,
});

FavoriteSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

FavoriteSchema.set('toJSON', { virtuals: true });
FavoriteSchema.set('toObject', { virtuals: true });

const Favorite = mongoose.models.Favorite || mongoose.model<IFavorite>('Favorite', FavoriteSchema);
export default Favorite;
