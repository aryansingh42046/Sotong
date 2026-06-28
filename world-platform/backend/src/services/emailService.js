import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || 'noreply@worldplatform.app';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const sendVerificationEmail = async (email, token) => {
  const verifyUrl = `${FRONTEND_URL}/auth/verify-email?token=${token}`;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Verify your World Platform account',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Welcome to World Platform! 🌍</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="color:#888;font-size:12px;margin-top:24px">Link expires in 24 hours.</p>
      </div>
    `,
  });
};
