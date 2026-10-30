import dns from "node:dns";
import nodemailer from "nodemailer";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // ignore
}

export interface EmailResult {
  success: boolean;
  provider?: "smtp";
  id?: string;
  error?: string;
}

export interface EmailConfigOverrides {
  smtpEmail?: string;
  smtpPassword?: string;
}

export function resolveSmtpConfig(overrides?: EmailConfigOverrides) {
  const email = (
    overrides?.smtpEmail ||
    process.env.SMTP_EMAIL ||
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    ""
  ).trim();

  // Strip whitespace and quotes from Google App Passwords
  const password = (
    overrides?.smtpPassword ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    ""
  ).trim().replace(/['"\s]/g, "");

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;

  return { email, password, host, port, isConfigured: Boolean(email && password) };
}

export function getOtpHtml(otp: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #05080d; color: #f4f7fb; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #0c1524; border: 1px solid rgba(148, 163, 184, 0.2); border-radius: 16px; padding: 32px; text-align: center; }
          .logo { font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #00e6a0; margin-bottom: 20px; }
          h2 { color: #f4f7fb; font-size: 20px; margin-top: 0; }
          p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .otp-card { background: #111e33; border: 1px solid #1c3254; border-radius: 12px; padding: 20px; margin: 24px 0; }
          .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #00e6a0; margin: 0; font-family: monospace; }
          .warning { font-size: 12px; color: #ef4444; margin-top: 16px; }
          .footer { font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(148, 163, 184, 0.1); padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">ECHOCHAT</div>
          <h2>Verification Code</h2>
          <p>Please enter the following One-Time Password (OTP) to authenticate your EchoChat account:</p>
          <div class="otp-card">
            <div class="otp-code">${otp}</div>
          </div>
          <p>This code is valid for <strong>5 minutes</strong>.</p>
          <p class="warning">⚠️ Never share this OTP with anyone. EchoChat staff will never ask for your code.</p>
          <div class="footer">
            EchoChat • Secure Real-Time Communication Platform
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Dispatches an OTP verification email using Gmail SMTP
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  overrides?: EmailConfigOverrides
): Promise<EmailResult> {
  const normalizedEmail = toEmail.trim().toLowerCase();
  const smtpConfig = resolveSmtpConfig(overrides);

  if (!smtpConfig.isConfigured) {
    return {
      success: false,
      provider: "smtp",
      error: "SMTP is not configured. Please set SMTP_EMAIL and SMTP_PASSWORD.",
    };
  }

  // Render Free Tier blocks outbound SMTP ports 25, 465, and 587
  const isRenderFree = process.env.RENDER === "true" && !process.env.RENDER_PAID_SMTP;
  if (isRenderFree) {
    console.warn("[SMTP] Running on Render Free Tier: outbound SMTP ports are blocked by Render.");
    return {
      success: false,
      provider: "smtp",
      error: "Outbound SMTP (port 465) is blocked on Render Free Tier. OTP emails are sent automatically via Vercel Serverless (/api/auth/sendOtp).",
    };
  }

  try {
    console.log(`[SMTP] Sending OTP to ${normalizedEmail} via Gmail SMTP (${smtpConfig.email})...`);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpConfig.email,
        pass: smtpConfig.password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    const info = await transporter.sendMail({
      from: `EchoChat <${smtpConfig.email}>`,
      to: normalizedEmail,
      subject: `Your EchoChat Verification Code: ${otp}`,
      html: getOtpHtml(otp),
    });

    console.log(`[SMTP] Verification email sent to ${normalizedEmail}! MessageId:`, info.messageId);
    return {
      success: true,
      provider: "smtp",
      id: info.messageId,
    };
  } catch (err: any) {
    console.error("[SMTP] Gmail SMTP delivery failed:", err?.message || err);
    return {
      success: false,
      provider: "smtp",
      error: `Gmail SMTP failed: ${err?.message || "Check your SMTP_EMAIL and SMTP_PASSWORD Google App Password"}`,
    };
  }
}
