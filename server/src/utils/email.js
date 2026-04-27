import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send email verification OTP
 * @param {string} to
 * @param {string} otp
 * @param {string} name
 */
export const sendVerificationEmail = async (to, otp, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'StudyCircle <noreply@studycircle.app>',
    to,
    subject: 'Verify your StudyCircle account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to StudyCircle, ${name}!</h2>
        <p>Your verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 16px; background: #F3F4F6; border-radius: 8px; text-align: center; margin: 24px 0;">
          ${otp}
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p style="color: #6B7280; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  });
};

/**
 * Send password reset email
 * @param {string} to
 * @param {string} resetUrl
 * @param {string} name
 */
export const sendPasswordResetEmail = async (to, resetUrl, name) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'StudyCircle <noreply@studycircle.app>',
    to,
    subject: 'Reset your StudyCircle password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">Reset Password</a>
        <p>Or copy and paste this link:</p>
        <p style="word-break: break-all; color: #4F46E5;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p style="color: #6B7280; font-size: 12px;">If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });
};

