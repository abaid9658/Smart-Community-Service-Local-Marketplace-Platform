import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId?: string;
  isPrimary: boolean;
  order: number;
}

export interface IProduct extends Document {
  _id: Types.ObjectId;
  sellerId: Types.ObjectId;
  categoryId?: Types.ObjectId;
  title: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  tags: string[];
  location?: string;
  city?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'ARCHIVED';
  viewsCount: number;
  isFeatured: boolean;
  images: IProductImage[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductImageSchema = new Schema<IProductImage>({
  url: { type: String, required: true },
  publicId: String,
  isPrimary: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
}, { _id: true });

const ProductSchema = new Schema<IProduct>({
  sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discountPrice: Number,
  stock: { type: Number, default: 1 },
  tags: { type: [String], default: [] },
  location: String,
  city: String,
  status: {
    type: String,
    enum: ['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'ARCHIVED'],
    default: 'PENDING_APPROVAL',
  },
  viewsCount: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  images: { type: [ProductImageSchema], default: [] },
}, { timestamps: true, collection: 'products' });

// Indexes for search
ProductSchema.index({ title: 'text', description: 'text' });
ProductSchema.index({ status: 1, city: 1, price: 1 });
ProductSchema.index({ sellerId: 1 });

ProductSchema.virtual('seller', {
  ref: 'User',
  localField: 'sellerId',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

ProductSchema.set('toJSON', { virtuals: true });
ProductSchema.set('toObject', { virtuals: true });

const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
export default Product;
