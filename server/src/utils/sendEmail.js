import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@studycircle.com',
    to,
    subject,
    html,
  };

  if (process.env.SMTP_USER === 'your_smtp_user') {
    console.log(`\n======================================================`);
    console.log(`[EMAIL BYPASS] Sending email to ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content: ${html.replace(/<[^>]*>?/gm, '')}`); // Strip HTML tags for console
    console.log(`======================================================\n`);
    return;
  }

  await transporter.sendMail(mailOptions);
};
