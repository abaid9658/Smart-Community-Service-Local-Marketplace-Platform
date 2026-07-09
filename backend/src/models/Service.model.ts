import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IServiceImage {
  url: string;
  publicId?: string;
  isPrimary: boolean;
  order: number;
}

export interface IFaqItem {
  question: string;
  answer: string;
}

export interface IPackage {
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
}

export interface IService extends Document {
  _id: Types.ObjectId;
  providerId: Types.ObjectId;
  categoryId?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  deliveryDays: number;
  revisions: number;
  tags: string[];
  location?: string;
  city?: string;
  isAvailable: boolean;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';
  viewsCount: number;
  isFeatured: boolean;
  faq?: IFaqItem[];
  packages?: IPackage[];
  images: IServiceImage[];
  createdAt: Date;
  updatedAt: Date;
}

const ServiceImageSchema = new Schema<IServiceImage>({
  url: { type: String, required: true },
  publicId: String,
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { _id: true });

const ServiceSchema = new Schema<IService>({
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  deliveryDays: { type: Number, default: 1 },
  revisions: { type: Number, default: 1 },
  tags: { type: [String], default: [] },
  location: String,
  city: String,
  isAvailable: { type: Boolean, default: true },
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED'],
    default: 'PENDING_APPROVAL',
  },
  viewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  faq: [{ question: String, answer: String, _id: false }],
  packages: [{ name: String, description: String, price: Number, deliveryDays: Number, _id: false }],
  images: { type: [ServiceImageSchema], default: [] },
}, { timestamps: true, collection: 'services' });

ServiceSchema.index({ title: 'text', description: 'text' });
ServiceSchema.index({ status: 1, isAvailable: 1, city: 1, price: 1 });
ServiceSchema.index({ providerId: 1 });

ServiceSchema.virtual('provider', {
  ref: 'User',
  localField: 'providerId',
  foreignField: '_id',
  justOne: true,
});

ServiceSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

ServiceSchema.set('toJSON', { virtuals: true });
ServiceSchema.set('toObject', { virtuals: true });

const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
export default Service;
