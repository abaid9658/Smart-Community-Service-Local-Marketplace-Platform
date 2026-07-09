export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'SELLER' | 'SERVICE_PROVIDER' | 'ADMIN' | 'SUPER_ADMIN';
  isEmailVerified: boolean;
  isSuspended: boolean;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  profile?: Profile;
  viewsCount?: number;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  skills: string[];
  portfolioLinks: string[];
  socialLinks?: SocialLinks;
  totalSales: number;
  completedServices: number;
  averageRating: number;
  totalReviews: number;
  isVerified: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  children?: Category[];
  _count?: { products: number; services: number };
}

export interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId?: string;
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
  createdAt: string;
  updatedAt: string;
  seller?: User;
  category?: Category;
  images: ProductImage[];
  _count?: { reviews: number; favorites: number };
}

export interface ServiceImage {
  id: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface ServicePackage {
  name: string;
  description: string;
  price: number;
  deliveryDays: number;
}

export interface Service {
  id: string;
  providerId: string;
  categoryId?: string;
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
  faq?: { question: string; answer: string }[];
  packages?: ServicePackage[];
  createdAt: string;
  updatedAt: string;
  provider?: User;
  category?: Category;
  images: ServiceImage[];
  _count?: { reviews: number; favorites: number; bookings: number };
}

export interface Booking {
  id: string;
  serviceId: string;
  clientId: string;
  providerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  scheduledDate: string;
  scheduledTime: string;
  notes?: string;
  totalPrice: number;
  paymentStatus: string;
  cancellationReason?: string;
  completedAt?: string;
  createdAt: string;
  service?: Service;
  client?: User;
  provider?: User;
  review?: Review;
}

export interface Review {
  id: string;
  reviewerId: string;
  revieweeId: string;
  productId?: string;
  serviceId?: string;
  bookingId?: string;
  rating: number;
  comment: string;
  reply?: string;
  isVerified: boolean;
  createdAt: string;
  reviewer?: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  sender?: User;
  tempId?: string;
}

export interface Conversation {
  id: string;
  lastMessage?: string;
  lastMessageAt?: string;
  participants: ConversationParticipant[];
  messages?: Message[];
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
  lastReadAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Favorite {
  id: string;
  userId: string;
  productId?: string;
  serviceId?: string;
  product?: Product;
  service?: Service;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalServices: number;
  totalBookings: number;
  pendingApprovals: number;
  pendingReports: number;
  totalRevenue: number;
  monthlyRevenue: { month: string; revenue: number; bookings: number }[];
  recentUsers: User[];
  recentBookings: Booking[];
  usersByRole: { role: string; _count: { role: number } }[];
  bookingsByStatus: { status: string; _count: { status: number } }[];
  monthlyUsers: { createdAt: string }[];
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  productId?: string;
  serviceId?: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
  reporter?: User;
  reportedUser?: User;
  product?: Product;
  service?: Service;
}
