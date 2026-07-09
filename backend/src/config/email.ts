import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: MailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"LocalHub" <no-reply@localhub.com>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${subject}`);
  } catch (err) {
    console.error('❌ Email send failed:', err);
  }
};

// ── Template helpers ──────────────────────────────────────────────

export const bookingConfirmationEmail = (data: {
  clientName: string;
  serviceTitle: string;
  scheduledDate?: string;
  amount: number;
  bookingId: string;
}) => ({
  subject: `Booking Confirmed — ${data.serviceTitle}`,
  html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #fafafa; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #007261, #005a4c); padding: 32px; text-align: center;">
        <h1 style="color: #68FADD; margin: 0; font-size: 28px;">LocalHub</h1>
        <p style="color: rgba(255,255,255,0.8); margin-top: 8px;">Your booking is confirmed!</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1A1A2E; margin-top: 0;">Hi ${data.clientName},</h2>
        <p style="color: #6B7280;">Your booking has been successfully placed.</p>
        <div style="background: white; border: 1.5px solid #E8E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">SERVICE</p>
          <p style="margin: 0 0 16px; font-weight: 700; font-size: 18px; color: #1A1A2E;">${data.serviceTitle}</p>
          ${data.scheduledDate ? `<p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">SCHEDULED DATE</p><p style="margin: 0 0 16px; font-weight: 600; color: #1A1A2E;">${data.scheduledDate}</p>` : ''}
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">AMOUNT PAID</p>
          <p style="margin: 0; font-weight: 700; font-size: 22px; color: #007261;">PKR ${data.amount.toLocaleString()}</p>
        </div>
        <p style="color: #6B7280; font-size: 14px;">Booking ID: <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${data.bookingId}</code></p>
        <a href="${process.env.FRONTEND_URL}/dashboard/my-bookings" style="display: inline-block; background: #007261; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-top: 16px;">View My Bookings</a>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
        <p>© 2024 LocalHub. All rights reserved.</p>
      </div>
    </div>
  `,
});

export const paymentSuccessEmail = (data: {
  userName: string;
  itemTitle: string;
  amount: number;
  currency: string;
  paymentId: string;
}) => ({
  subject: `Payment Successful — ${data.itemTitle}`,
  html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; background: #fafafa; border-radius: 12px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #007261, #005a4c); padding: 32px; text-align: center;">
        <h1 style="color: #68FADD; margin: 0; font-size: 28px;">LocalHub</h1>
        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; margin: 16px auto 0; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 32px;">✅</span>
        </div>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #1A1A2E; margin-top: 0;">Payment Successful!</h2>
        <p style="color: #6B7280;">Hi ${data.userName}, your payment has been processed successfully.</p>
        <div style="background: white; border: 1.5px solid #E8E8F0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">ITEM</p>
          <p style="margin: 0 0 16px; font-weight: 700; font-size: 18px; color: #1A1A2E;">${data.itemTitle}</p>
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">AMOUNT CHARGED</p>
          <p style="margin: 0 0 16px; font-weight: 700; font-size: 22px; color: #007261;">${data.currency} ${data.amount.toLocaleString()}</p>
          <p style="margin: 0 0 8px; color: #6B7280; font-size: 14px;">PAYMENT ID</p>
          <p style="margin: 0; font-size: 13px; color: #9CA3AF; font-family: monospace;">${data.paymentId}</p>
        </div>
        <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #007261; color: white; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">Go to Dashboard</a>
      </div>
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #9CA3AF; font-size: 12px;">
        <p>© 2024 LocalHub. All rights reserved.</p>
      </div>
    </div>
  `,
});
