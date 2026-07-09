import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { sendSuccess } from '../utils/response';
import Report from '../models/Report.model';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Submit Contact Form ───────────────────────────────────────────
export const submitContact = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
      return;
    }

    // Save as a Report so it appears in admin panel
    await Report.create({
      reporterId: null,       // guest/unauthenticated contact
      reason: `Contact Form: ${subject || 'General Enquiry'}`,
      description: `From: ${name} <${email}>\n\n${message}`,
      status: 'PENDING',
    });

    // Also send email notification to admin
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: process.env.SMTP_USER,
        subject: `[LocalHub Contact] ${subject || 'New Message from Contact Form'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #007261;">New Contact Form Submission</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Name:</td><td style="padding: 8px;">${name}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Email:</td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; font-weight: bold; color: #555;">Subject:</td><td style="padding: 8px;">${subject || 'N/A'}</td></tr>
            </table>
            <div style="padding: 16px; background: #f5f5f5; border-radius: 8px; margin-top: 16px;">
              <strong>Message:</strong><br/><br/>
              ${message.replace(/\n/g, '<br/>')}
            </div>
          </div>
        `,
      });
    } catch (emailErr) {
      // Don't fail the request if email fails — the report is already saved
      console.error('Contact email failed:', emailErr);
    }

    sendSuccess(res, null, 'Message sent successfully! We will get back to you soon.');
  } catch (err) {
    next(err);
  }
};
