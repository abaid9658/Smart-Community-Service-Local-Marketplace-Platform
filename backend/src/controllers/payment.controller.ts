import { Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Booking from '../models/Booking.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middleware/error.middleware';
import { sendEmail, paymentSuccessEmail, bookingConfirmationEmail } from '../config/email';
import User from '../models/User.model';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10' as any,
});

// ── Create Payment Intent (for booking / product purchase) ────────
export const createPaymentIntent = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, currency = 'pkr', bookingId, description } = req.body;

    if (!amount || amount <= 0) throw new AppError('Invalid amount', 400);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paisa/cents
      currency: currency.toLowerCase(),
      description: description || 'LocalHub Payment',
      metadata: {
        bookingId: bookingId || '',
        userId: req.user!.userId,
      },
      automatic_payment_methods: { enabled: true },
    });

    sendSuccess(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
};

// ── Confirm Payment (after Stripe card payment success) ────────────
export const confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentIntentId, bookingId } = req.body;

    // Verify the payment intent status with Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== 'succeeded') {
      throw new AppError('Payment has not been completed yet', 400);
    }

    let booking = null;

    // If a booking is associated, mark it as paid
    if (bookingId) {
      booking = await Booking.findById(bookingId)
        .populate('service', 'title price')
        .populate('client', 'username profile.fullName email');

      if (!booking) throw new AppError('Booking not found', 404);

      (booking as any).paymentStatus = 'PAID';
      (booking as any).paymentIntentId = paymentIntentId;
      await booking.save();

      // Send confirmation emails
      const client = booking.client as any;
      if (client?.email) {
        const emailData = bookingConfirmationEmail({
          clientName: client.profile?.fullName || client.username,
          serviceTitle: (booking.service as any)?.title || 'Service',
          amount: paymentIntent.amount / 100,
          bookingId: booking._id.toString(),
        });
        sendEmail({ to: client.email, ...emailData });
      }
    } else {
      // Generic payment - send payment confirmation email
      const user = await User.findById(req.user!.userId);
      if (user?.email) {
        const emailData = paymentSuccessEmail({
          userName: user.profile?.fullName || user.username,
          itemTitle: paymentIntent.description || 'Purchase',
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          paymentId: paymentIntentId,
        });
        sendEmail({ to: user.email, ...emailData });
      }
    }

    sendSuccess(res, {
      status: 'success',
      paymentIntentId,
      booking: booking ? { ...( booking as any).toJSON(), id: booking._id.toString() } : null,
    }, 'Payment confirmed successfully');
  } catch (err) {
    next(err);
  }
};

// ── Get Payment History ───────────────────────────────────────────
export const getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const paymentIntents = await stripe.paymentIntents.list({
      limit: 20,
    });

    // Filter by user metadata
    const userPayments = paymentIntents.data.filter(
      pi => pi.metadata.userId === req.user!.userId && pi.status === 'succeeded'
    );

    sendSuccess(res, userPayments.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      currency: pi.currency.toUpperCase(),
      status: pi.status,
      description: pi.description,
      bookingId: pi.metadata.bookingId,
      createdAt: new Date(pi.created * 1000).toISOString(),
    })));
  } catch (err) {
    next(err);
  }
};

// ── Stripe Webhook (for real-time payment events) ─────────────────
export const stripeWebhook = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret || webhookSecret === 'whsec_placeholder_update_from_stripe_dashboard') {
      // Skip webhook verification in dev if no webhook secret
      res.json({ received: true });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch {
      throw new AppError('Webhook signature verification failed', 400);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`✅ Payment succeeded: ${pi.id}, ${pi.amount / 100} ${pi.currency}`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Payment failed: ${pi.id}`);
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (err) {
    next(err);
  }
};
