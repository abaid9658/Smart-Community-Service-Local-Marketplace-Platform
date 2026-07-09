import 'dotenv/config';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import { connectDB } from './config/database';
import { errorHandler, notFound } from './middleware/error.middleware';
import { initSocket } from './socket/socket.server';
import { stripeWebhook } from './controllers/payment.controller';

// Models
import './models/User.model';
import './models/Product.model';
import './models/Service.model';
import './models/Category.model';
import './models/Booking.model';
import './models/Notification.model';
import './models/Report.model';
import './models/Review.model';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import serviceRoutes from './routes/service.routes';
import bookingRoutes from './routes/booking.routes';
import messageRoutes from './routes/message.routes';
import reviewRoutes from './routes/review.routes';
import favoriteRoutes from './routes/favorite.routes';
import notificationRoutes from './routes/notification.routes';
import categoryRoutes from './routes/category.routes';
import adminRoutes from './routes/admin.routes';
import reportRoutes from './routes/report.routes';
import paymentRoutes from './routes/payment.routes';
import contactRoutes from './routes/contact.routes';

const app = express();
const httpServer = http.createServer(app);

// ── Socket.io ─────────────────────────────────────────────────────
initSocket(httpServer);

// ── Security Middleware ───────────────────────────────────────────
app.use(helmet());

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any vercel.app subdomain in production
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
});

app.use(globalLimiter);

// ── Stripe Webhook — raw body BEFORE express.json() ───────────────
app.post('/api/v1/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook as any);

// ── Body Parsing ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ── Logging ───────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Health Check ──────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'LocalHub API' });
});

// ── API Routes ────────────────────────────────────────────────────
const API = '/api/v1';

app.use(`${API}/auth`, authLimiter, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/products`, productRoutes);
app.use(`${API}/services`, serviceRoutes);
app.use(`${API}/bookings`, bookingRoutes);
app.use(`${API}/messages`, messageRoutes);
app.use(`${API}/reviews`, reviewRoutes);
app.use(`${API}/favorites`, favoriteRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/categories`, categoryRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/reports`, reportRoutes);
app.use(`${API}/payments`, paymentRoutes);
app.use(`${API}/contact`, contactRoutes);

// ── 404 & Error Handler ───────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`
  ╔══════════════════════════════════════╗
  ║     🏘️  LocalHub API Server          ║
  ║     Port: ${PORT}                       ║
  ║     DB:   MongoDB Atlas              ║
  ║     Env:  ${process.env.NODE_ENV}          ║
  ╚══════════════════════════════════════╝
  `);
  });
});

export default app;
