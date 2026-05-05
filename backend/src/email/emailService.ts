import transporter from "./transporter.js";
import { getWelcomeEmailHtml } from "./templates/welcome.js";
import { getLoginEmailHtml } from "./templates/login.js";

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

/**
 * Sends a login-notification email to a user after a successful sign-in.
 *
 * @param name      - Display name of the user
 * @param email     - Email address to send to
 * @param method    - Login method: "Password" | "Google"
 */
export async function sendLoginEmail(
  name: string,
  email: string,
  method: "Password" | "Google"
): Promise<void> {
  const loginTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "short",
  });

  const mailOptions = {
    from: `"SpendWise" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "🔒 New Login to Your SpendWise Account",
    html: getLoginEmailHtml(name, email, method, loginTime),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Login email sent to ${email} — MessageId: ${info.messageId}`);
  } catch (error) {
    // Log the error but do NOT throw — a failed email must not block login.
    console.error(`[EmailService] Failed to send login email to ${email}:`, error);
  }
}
