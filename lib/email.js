/**
 * @module Email Utility
 * @description Send emails using Nodemailer + Gmail SMTP
 */
import nodemailer from 'nodemailer';

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

/**
 * Send registration confirmation email
 */
export async function sendRegistrationConfirmation({ name, email, eventName, eventDate, eventTime, eventMode, eventLocation, communityLink }) {
  // Skip if email credentials are not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    console.warn('Email credentials not configured. Skipping confirmation email.');
    return { success: false, reason: 'Email not configured' };
  }

  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ea580c, #d97706); border-radius: 16px 16px 0 0; padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">🎉 Registration Confirmed!</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #111111; border: 1px solid #333333; border-top: none; border-radius: 0 0 16px 16px; padding: 32px 24px;">
          <p style="color: #e5e5e5; font-size: 16px; line-height: 1.6; margin-top: 0;">
            Hi <strong style="color: #fb923c;">${name}</strong>,
          </p>
          <p style="color: #d4d4d4; font-size: 16px; line-height: 1.6;">
            You have successfully registered for <strong style="color: #fb923c;">${eventName}</strong>. We're excited to have you!
          </p>

          <!-- Event Details Card -->
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 20px; margin: 24px 0;">
            <h3 style="color: #fb923c; margin: 0 0 16px 0; font-size: 16px;">📋 Event Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              ${eventDate ? `<tr>
                <td style="color: #9ca3af; padding: 8px 0; font-size: 14px; width: 100px;">📅 Date</td>
                <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px;">${eventDate}</td>
              </tr>` : ''}
              ${eventTime ? `<tr>
                <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">🕐 Time</td>
                <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px;">${eventTime}</td>
              </tr>` : ''}
              ${eventMode ? `<tr>
                <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">💻 Mode</td>
                <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px;">${eventMode}</td>
              </tr>` : ''}
              ${eventLocation ? `<tr>
                <td style="color: #9ca3af; padding: 8px 0; font-size: 14px;">📍 Venue</td>
                <td style="color: #e5e5e5; padding: 8px 0; font-size: 14px;">${eventLocation}</td>
              </tr>` : ''}
            </table>
          </div>

          <p style="color: #9ca3af; font-size: 14px; line-height: 1.6;">
            Make sure to be on time. If you have any questions, reach out to us!
          </p>

          <!-- Social Links -->
          <div style="background-color: #1a1a1a; border: 1px solid #333333; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
            <h3 style="color: #fb923c; margin: 0 0 16px 0; font-size: 16px;">🔗 Stay Connected</h3>
            <div>
              ${communityLink ? `<a href="${communityLink}" target="_blank" style="display: inline-block; background-color: rgba(37, 211, 102, 0.15); color: #25D366; border: 1px solid rgba(37, 211, 102, 0.3); border-radius: 10px; padding: 10px 20px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 6px 8px 6px;">💬 Join WhatsApp Community</a>` : ''}
              <a href="https://www.instagram.com/techascend.slc/" target="_blank" style="display: inline-block; background-color: rgba(225, 48, 108, 0.15); color: #E1306C; border: 1px solid rgba(225, 48, 108, 0.3); border-radius: 10px; padding: 10px 20px; text-decoration: none; font-size: 14px; font-weight: 600; margin: 0 6px 8px 6px;">📸 Follow on Instagram</a>
            </div>
          </div>

          <!-- Footer -->
          <div style="border-top: 1px solid #333333; margin-top: 24px; padding-top: 20px; text-align: center;">
            <p style="color: #6b7280; font-size: 13px; margin: 0;">
              © ${new Date().getFullYear()} Tech Ascend — Shyam Lal College
            </p>
            <p style="color: #4b5563; font-size: 12px; margin: 8px 0 0 0;">
              This is an automated confirmation email.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: `"Tech Ascend" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `✅ Registration Confirmed — ${eventName}`,
      html: htmlContent,
    });

    console.log(`Confirmation email sent to ${email} for event: ${eventName}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return { success: false, reason: error.message };
  }
}
