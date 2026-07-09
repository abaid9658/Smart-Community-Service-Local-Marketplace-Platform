import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: Types.ObjectId | null;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  iconUrl: String,
  parentId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'categories' });

const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
export default Category;
