import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAdminLog extends Document {
  _id: Types.ObjectId;
  adminId: Types.ObjectId;
  action: string;
  targetType: string;
  targetId: string;
  note?: string;
  createdAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>({
  adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String, required: true },
  targetId: { type: String, required: true },
  note: String,
}, { timestamps: { createdAt: true, updatedAt: false }, collection: 'admin_logs' });

AdminLogSchema.virtual('admin', {
  ref: 'User',
  localField: 'adminId',
  foreignField: '_id',
  justOne: true,
});

AdminLogSchema.set('toJSON', { virtuals: true });
AdminLogSchema.set('toObject', { virtuals: true });

const AdminLog = mongoose.models.AdminLog || mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
export default AdminLog;
