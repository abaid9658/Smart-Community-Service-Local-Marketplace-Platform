import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"LocalHub" <no-reply@localhub.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
};

export const emailTemplates = {
  verifyEmail: (name: string, link: string) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;">
      <h2 style="color:#007261;">Welcome to LocalHub, ${name}!</h2>
      <p>Please verify your email address by clicking the button below:</p>
      <a href="${link}" style="display:inline-block;background:#007261;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Verify Email</a>
      <p style="color:#888;font-size:13px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
    </div>`,

  forgotPassword: (name: string, link: string) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;">
      <h2 style="color:#007261;">Reset Your Password</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <a href="${link}" style="display:inline-block;background:#007261;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Reset Password</a>
      <p style="color:#888;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>`,

  bookingConfirmed: (clientName: string, serviceName: string, date: string) => `
    <div style="font-family:Inter,sans-serif;max-width:600px;margin:auto;padding:32px;">
      <h2 style="color:#007261;">Booking Confirmed!</h2>
      <p>Hi ${clientName}, your booking for <strong>${serviceName}</strong> on <strong>${date}</strong> has been confirmed.</p>
      <p>Visit your dashboard to track your booking status.</p>
    </div>`,
};
