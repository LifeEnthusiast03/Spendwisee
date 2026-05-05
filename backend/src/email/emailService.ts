import transporter from "./transporter.js";
import { getWelcomeEmailHtml } from "./templates/welcome.js";

/**
 * Sends a welcome / registration confirmation email to a newly registered user.
 *
 * @param name  - Display name of the user
 * @param email - Email address to send to
 */
export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  const mailOptions = {
    from: `"SpendWise" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🎉 Welcome to SpendWise — You're all set!",
    html: getWelcomeEmailHtml(name, email),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Welcome email sent to ${email} — MessageId: ${info.messageId}`);
  } catch (error) {
    // Log the error but do NOT throw — a failed email must not block registration.
    console.error(`[EmailService] Failed to send welcome email to ${email}:`, error);
  }
}
