import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReport extends Document {
  _id: Types.ObjectId;
  reporterId?: Types.ObjectId | null;
  reportedUserId?: Types.ObjectId;
  productId?: Types.ObjectId;
  serviceId?: Types.ObjectId;
  reason: string;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: false, default: null },
  reportedUserId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
  reason: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['PENDING', 'REVIEWED', 'RESOLVED', 'DISMISSED'], default: 'PENDING' },
  adminNote: String,
}, { timestamps: true, collection: 'reports' });

ReportSchema.index({ status: 1 });

ReportSchema.virtual('reporter', {
  ref: 'User',
  localField: 'reporterId',
  foreignField: '_id',
  justOne: true,
});

ReportSchema.virtual('reportedUser', {
  ref: 'User',
  localField: 'reportedUserId',
  foreignField: '_id',
  justOne: true,
});

ReportSchema.virtual('product', {
  ref: 'Product',
  localField: 'productId',
  foreignField: '_id',
  justOne: true,
});

ReportSchema.virtual('service', {
  ref: 'Service',
  localField: 'serviceId',
  foreignField: '_id',
  justOne: true,
});

ReportSchema.set('toJSON', { virtuals: true });
ReportSchema.set('toObject', { virtuals: true });

const Report = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
export default Report;
