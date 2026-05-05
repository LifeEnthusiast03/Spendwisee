/**
 * Generates a beautiful HTML welcome email for new Spendwise registrants.
 * @param name  - The display name of the newly registered user
 * @param email - The email address they registered with
 */
export function getWelcomeEmailHtml(name: string, email: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Spendwise</title>
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
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%);
      padding: 48px 40px 36px;
      text-align: center;
    }

    .logo {
      font-size: 32px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }

    .logo span {
      background: linear-gradient(90deg, #fbbf24, #f59e0b);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .tagline {
      font-size: 14px;
      color: rgba(255,255,255,0.85);
      font-weight: 400;
      letter-spacing: 1px;
      text-transform: uppercase;
    }

    /* ── Body ── */
    .body {
      padding: 40px 40px 32px;
    }

    .greeting {
      font-size: 26px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 16px;
      line-height: 1.3;
    }

    .intro {
      font-size: 15px;
      color: #94a3b8;
      line-height: 1.7;
      margin-bottom: 32px;
    }

    /* ── Info Card ── */
    .info-card {
      background: rgba(99, 102, 241, 0.08);
      border: 1px solid rgba(99, 102, 241, 0.25);
      border-radius: 12px;
      padding: 20px 24px;
      margin-bottom: 32px;
    }

    .info-card p {
      font-size: 13px;
      color: #94a3b8;
      margin-bottom: 6px;
    }

    .info-card strong {
      font-size: 15px;
      color: #e2e8f0;
      font-weight: 600;
    }

    /* ── Feature list ── */
    .features-title {
      font-size: 16px;
      font-weight: 600;
      color: #c7d2fe;
      margin-bottom: 16px;
    }

    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }

    .feature-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }

    .feature-text h4 {
      font-size: 14px;
      font-weight: 600;
      color: #e2e8f0;
      margin-bottom: 2px;
    }

    .feature-text p {
      font-size: 13px;
      color: #64748b;
      line-height: 1.5;
    }

    /* ── CTA Button ── */
    .cta-wrap {
      text-align: center;
      margin: 36px 0 24px;
    }

    .cta-btn {
      display: inline-block;
      padding: 14px 40px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #ffffff;
      text-decoration: none;
      border-radius: 50px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: 0.3px;
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
    }

    /* ── Footer ── */
    .footer {
      background: rgba(0,0,0,0.3);
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid rgba(99, 102, 241, 0.15);
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
      <div class="tagline">Smart Money · Clear Goals · Financial Freedom</div>
    </div>

    <!-- Body -->
    <div class="body">
      <h1 class="greeting">Welcome aboard, ${name}! 🎉</h1>
      <p class="intro">
        Your account has been successfully created on <strong>SpendWise</strong> — your personal
        finance companion. We're thrilled to have you with us on your journey to smarter spending
        and better financial health.
      </p>

      <!-- Account Info -->
      <div class="info-card">
        <p>Registered Email</p>
        <strong>${email}</strong>
      </div>

      <!-- What you can do -->
      <p class="features-title">Here's what SpendWise offers you:</p>

      <div class="feature-item">
        <div class="feature-icon" style="background: rgba(16,185,129,0.15);">💰</div>
        <div class="feature-text">
          <h4>Track Income &amp; Expenses</h4>
          <p>Log every transaction and keep a crystal-clear record of your cash flow.</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon" style="background: rgba(99,102,241,0.15);">🎯</div>
        <div class="feature-text">
          <h4>Set Financial Goals</h4>
          <p>Define saving goals and watch your progress in real time.</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon" style="background: rgba(245,158,11,0.15);">📊</div>
        <div class="feature-text">
          <h4>Smart Financial Reports</h4>
          <p>Get insightful reports on your spending patterns to make informed decisions.</p>
        </div>
      </div>

      <div class="feature-item">
        <div class="feature-icon" style="background: rgba(6,182,212,0.15);">🤖</div>
        <div class="feature-text">
          <h4>AI-Powered Planning</h4>
          <p>Leverage AI to receive personalized financial plans tailored to your habits.</p>
        </div>
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
        You received this email because you registered at SpendWise.<br/>
        If this wasn't you, please <a href="mailto:${process.env.GMAIL_USER}">contact support</a>.
      </p>
      <p style="margin-top:8px;">© ${new Date().getFullYear()} SpendWise · All rights reserved.</p>
    </div>

  </div>
</body>
</html>
  `.trim();
}
