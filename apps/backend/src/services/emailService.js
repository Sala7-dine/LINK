import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html });
};

const sendVerificationEmail = (to, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  return sendEmail({
    to,
    subject: 'LINK – Verify your email',
    html: `<p>Click <a href="${url}">here</a> to verify your email. Link expires in 24h.</p>`,
  });
};

const sendPasswordResetEmail = (to, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  return sendEmail({
    to,
    subject: 'LINK – Reset your password',
    html: `<p>Click <a href="${url}">here</a> to reset your password. Link expires in 30 minutes.</p>`,
  });
};

export { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
