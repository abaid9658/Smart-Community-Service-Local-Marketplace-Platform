// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toJSONTransform = (_doc: any, ret: any): any => {
  ret.id = ret._id?.toString();
  // Convert all ObjectId-like fields to strings
  if (ret.parentId?._id) ret.parentId = ret.parentId._id.toString();
  else if (ret.parentId) ret.parentId = ret.parentId.toString();
  if (ret.sellerId) ret.sellerId = ret.sellerId.toString?.() ?? ret.sellerId;
  if (ret.providerId) ret.providerId = ret.providerId.toString?.() ?? ret.providerId;
  if (ret.categoryId) ret.categoryId = ret.categoryId.toString?.() ?? ret.categoryId;
  if (ret.userId) ret.userId = ret.userId.toString?.() ?? ret.userId;
  if (ret.serviceId) ret.serviceId = ret.serviceId.toString?.() ?? ret.serviceId;
  if (ret.productId) ret.productId = ret.productId.toString?.() ?? ret.productId;
  if (ret.clientId) ret.clientId = ret.clientId.toString?.() ?? ret.clientId;
  if (ret.conversationId) ret.conversationId = ret.conversationId.toString?.() ?? ret.conversationId;
  if (ret.senderId) ret.senderId = ret.senderId.toString?.() ?? ret.senderId;
  if (ret.reviewerId) ret.reviewerId = ret.reviewerId.toString?.() ?? ret.reviewerId;
  if (ret.revieweeId) ret.revieweeId = ret.revieweeId.toString?.() ?? ret.revieweeId;
  if (ret.bookingId) ret.bookingId = ret.bookingId.toString?.() ?? ret.bookingId;
  if (ret.reporterId) ret.reporterId = ret.reporterId.toString?.() ?? ret.reporterId;
  if (ret.reportedUserId) ret.reportedUserId = ret.reportedUserId.toString?.() ?? ret.reportedUserId;
  if (ret.adminId) ret.adminId = ret.adminId.toString?.() ?? ret.adminId;
  if (Array.isArray(ret.participants)) {
    ret.participants = ret.participants.map((p: any) => p?.toString?.() ?? p);
  }
  delete ret._id;
  delete ret.__v;
  delete ret.passwordHash;
  delete ret.emailVerifyToken;
  delete ret.resetPasswordToken;
  delete ret.resetPasswordExpiry;
  return ret;
};
