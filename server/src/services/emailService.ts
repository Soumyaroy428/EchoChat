import dns from "node:dns";
import nodemailer from "nodemailer";

try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // ignore
}

export interface EmailResult {
  success: boolean;
  provider?: "smtp" | "resend";
  id?: string;
  error?: string;
}

export interface EmailConfigOverrides {
  resendApiKey?: string;
  resendFromEmail?: string;
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

  // Strip whitespace from Google App Passwords (Google shows them as 'xxxx xxxx xxxx xxxx')
  const password = (
    overrides?.smtpPassword ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.SMTP_PASS ||
    ""
  ).trim().replace(/\s+/g, "");

  const host = (process.env.SMTP_HOST || "smtp.gmail.com").trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;

  return { email, password, host, port, isConfigured: Boolean(email && password) };
}

export function resolveResendApiKey(explicitKey?: string): string {
  if (explicitKey && typeof explicitKey === "string" && explicitKey.trim().length > 0) {
    return explicitKey.trim();
  }

  return (
    process.env.RESEND_API_KEY ||
    process.env.RESEND_KEY ||
    process.env.NEXT_PUBLIC_RESEND_API_KEY ||
    ""
  ).trim();
}

export function resolveResendFromEmail(explicitFrom?: string): string {
  const candidate = (
    explicitFrom ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL ||
    ""
  ).trim();

  const isPublicDomain =
    candidate.includes("@gmail.com") ||
    candidate.includes("@googlemail.com") ||
    candidate.includes("@yahoo.") ||
    candidate.includes("@outlook.") ||
    candidate.includes("@hotmail.") ||
    candidate.includes("@icloud.");

  if (!candidate || isPublicDomain) {
    return "EchoChat <onboarding@resend.dev>";
  }

  return candidate;
}

function getOtpHtml(otp: string): string {
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
 * Dispatches an OTP verification email using Gmail SMTP (recommended) or Resend API
 */
export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  overrides?: EmailConfigOverrides
): Promise<EmailResult> {
  const normalizedEmail = toEmail.trim().toLowerCase();
  const smtpConfig = resolveSmtpConfig(overrides);
  const resendApiKey = resolveResendApiKey(overrides?.resendApiKey);

  // 1. Prioritize Gmail SMTP if configured
  if (smtpConfig.isConfigured) {
    try {
      console.log(`[SMTP] Sending OTP to ${normalizedEmail} via Gmail SMTP (${smtpConfig.email})...`);

      const transporter = nodemailer.createTransport({
        host: smtpConfig.host || "smtp.gmail.com",
        port: smtpConfig.port || 465,
        secure: (smtpConfig.port || 465) === 465,
        auth: {
          user: smtpConfig.email,
          pass: smtpConfig.password,
        },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 8000,
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

  // 2. Fall back to Resend API if RESEND_API_KEY is configured
  if (resendApiKey) {
    const fromEmail = resolveResendFromEmail(overrides?.resendFromEmail);
    console.log(`[Resend] Sending OTP to ${normalizedEmail} via Resend API (Sender: ${fromEmail})...`);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          "User-Agent": "EchoChat/1.0",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [normalizedEmail],
          subject: `Your EchoChat Verification Code: ${otp}`,
          html: getOtpHtml(otp),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        let rawError = json?.message || `HTTP ${res.status}`;
        if (typeof rawError === "string" && rawError.includes("can only send testing emails to your own email address")) {
          rawError = `${rawError} (Note: Configure Gmail SMTP via SMTP_EMAIL and SMTP_PASSWORD to send to any user's Gmail ID for free without needing a domain).`;
        }
        console.error(`[Resend] Delivery failed (${res.status}):`, rawError);
        return {
          success: false,
          provider: "resend",
          error: rawError,
        };
      }

      console.log(`[Resend] Verification email dispatched to ${normalizedEmail}! ID:`, json?.id);
      return {
        success: true,
        provider: "resend",
        id: json?.id,
      };
    } catch (err: any) {
      const errorMsg =
        err?.name === "AbortError"
          ? "Resend request timed out"
          : err?.message || "Resend communication error";
      console.error("[Resend] Network error:", errorMsg);
      return {
        success: false,
        provider: "resend",
        error: errorMsg,
      };
    }
  }

  // 3. No email provider configured
  return {
    success: false,
    error: "No email provider configured. Please set SMTP_EMAIL and SMTP_PASSWORD in your environment.",
  };
}
