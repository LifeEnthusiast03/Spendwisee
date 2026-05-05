import nodemailer from "nodemailer";

/**
 * Creates a Nodemailer transporter configured with Gmail OAuth2.
 * Credentials are read from environment variables.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GMAIL_USER,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
  },
});

export default transporter;
