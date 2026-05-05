/**
 * Generates an HTML login-notification email for SpendWise users.
 * @param name      - The display name of the user
 * @param email     - The email address they logged in with
 * @param method    - Login method: "Password" | "Google"
 * @param loginTime - Formatted date/time string of the login event
 */
export function getLoginEmailHtml(
  name: string,
  email: string,
  method: "Password" | "Google",
  loginTime: string
): string {
  const methodIcon = method === "Google" ? "🔵" : "🔑";
  const methodColor = method === "Google" ? "rgba(66,133,244,0.15)" : "rgba(99,102,241,0.15)";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Login — SpendWise</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', Arial, sans-serif;
      background: #0f0f1a;
      color: #e2e8f0;
    }

    .wrapper {
      max-width: 600px;
      margin: 40px auto;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(99, 102, 241, 0.3);
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #0f3460 0%, #16213e 50%, #1a1a2e 100%);
      padding: 40px 40px 30px;
      text-align: center;
      border-bottom: 1px solid rgba(99, 102, 241, 0.2);
    }

    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin-bottom: 10px;
    }

    .logo span {
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .alert-badge {
      display: inline-block;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #a5b4fc;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 5px 16px;
      border-radius: 50px;
      margin-top: 6px;
    }

    /* ── Body ── */
    .body {
      padding: 36px 40px 28px;
    }

    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 10px;
    }

    .intro {
      font-size: 14px;
      color: #94a3b8;
      line-height: 1.7;
      margin-bottom: 28px;
    }

    /* ── Login Detail Card ── */
    .detail-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 14px;
      overflow: hidden;
      margin-bottom: 28px;
    }

    .detail-card-header {
      background: rgba(99, 102, 241, 0.1);
      padding: 12px 20px;
      font-size: 11px;
      font-weight: 600;
      color: #818cf8;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      border-bottom: 1px solid rgba(99, 102, 241, 0.15);
    }

    .detail-row {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      border-bottom: 1px solid rgba(99, 102, 241, 0.08);
      gap: 14px;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .detail-content label {
      display: block;
      font-size: 11px;
      color: #64748b;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 2px;
    }

    .detail-content span {
      font-size: 14px;
      color: #e2e8f0;
      font-weight: 500;
    }

    /* ── Security Notice ── */
    .security-notice {
      background: rgba(245, 158, 11, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 10px;
      padding: 16px 18px;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .security-notice .icon {
      font-size: 20px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    .security-notice p {
      font-size: 13px;
      color: #d97706;
      line-height: 1.6;
    }

    .security-notice a {
      color: #f59e0b;
      text-decoration: underline;
    }

    /* ── CTA ── */
    .cta-wrap {
      text-align: center;
      margin: 10px 0 8px;
    }

    .cta-btn {
      display: inline-block;
      padding: 13px 36px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      text-decoration: none;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.3px;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
    }

    /* ── Footer ── */
    .footer {
      background: rgba(0,0,0,0.3);
      padding: 22px 40px;
      text-align: center;
      border-top: 1px solid rgba(99, 102, 241, 0.12);
    }

    .footer p {
      font-size: 12px;
      color: #475569;
      line-height: 1.6;
    }

    .footer a {
      color: #6366f1;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">

    <!-- Header -->
    <div class="header">
      <div class="logo">Spend<span>Wise</span></div>
      <div class="alert-badge">🔒 Login Detected</div>
    </div>

    <!-- Body -->
    <div class="body">
      <h1 class="greeting">Hi ${name}, you just logged in!</h1>
      <p class="intro">
        We noticed a new sign-in to your <strong>SpendWise</strong> account.
        If this was you, no action is needed. If you don't recognise this activity,
        please secure your account immediately.
      </p>

      <!-- Login Details -->
      <div class="detail-card">
        <div class="detail-card-header">Login Details</div>

        <div class="detail-row">
          <div class="detail-icon" style="background: rgba(16,185,129,0.12);">📧</div>
          <div class="detail-content">
            <label>Account</label>
            <span>${email}</span>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon" style="background: ${methodColor};">${methodIcon}</div>
          <div class="detail-content">
            <label>Login Method</label>
            <span>${method}</span>
          </div>
        </div>

        <div class="detail-row">
          <div class="detail-icon" style="background: rgba(6,182,212,0.12);">🕐</div>
          <div class="detail-content">
            <label>Time</label>
            <span>${loginTime}</span>
          </div>
        </div>
      </div>

      <!-- Security Warning -->
      <div class="security-notice">
        <div class="icon">⚠️</div>
        <p>
          Wasn't you? Your account may be compromised. Please
          <a href="mailto:${process.env.GMAIL_USER}">contact support</a>
          immediately and change your password.
        </p>
      </div>

      <!-- CTA -->
      <div class="cta-wrap">
        <a href="https://spendwisee-beige.vercel.app" class="cta-btn">
          Go to Dashboard →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>
        This is an automated security notification from SpendWise.<br/>
        © ${new Date().getFullYear()} SpendWise · All rights reserved.
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();
}
